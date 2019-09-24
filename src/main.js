import '@babel/polyfill'
import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import store from './store/store'
import "@/plugins/filters"
import "@/plugins/colorwheel"
import "@/plugins/websocket"
import events from './events'
import config from './config'
import "./stylus/main.styl"

Vue.config.productionTip = false;
Vue.config.performance = process.env.NODE_ENV !== 'production';

router.beforeEach((to, from, next) => {
  if (to.meta && to.meta.access === 'w' && !store.getters.userAccess) next(false);
  else {
    if (store.state.orgs.length > 0 || !store.state.user) next();
    else {
      window.WanosBootstrapping = true;
      store.dispatch('getBootstrap').then(() => {
        window.WanosBootstrapping = false;
        // prevent the racing between AJAX call(s) inside created/mounted hooks of the current route's component
        next();
      });
    }
  }
});

router.afterEach(() => {
  events.$emit('new_route');
});

new Vue({
  data:
    {
      errMsg: '',
      spinner: 0,
      deviceWentOffline: false,
      alerts:
        {
          benchmarkWaiting: false,
          benchmarkReady: false,
        }
    },
  router,
  store,
  render: h => h(App),
  computed:
    {
      isDEV() {
        return process.env.NODE_ENV === 'development';
      }
    },
  created() {
    events.$on('show_spin', this.showSpin);
    events.$on('hide_spin', this.hideSpin);
    events.$on('backend', this.backendError);
    events.$on('device_off', this.deviceOffline);
  },
  beforeDestroy() {
    events.$off('show_spin', this.showSpin);
    events.$off('hide_spin', this.hideSpin);
    events.$off('backend', this.backendError);
    events.$off('device_off', this.deviceOffline);
  },
  methods:
    {
      backendError(err) {
        if (err.code === config.ERR_CODE.UNAUTHENTICATED) {
          this.$store.commit('setUser', null);
          return;
        } else if (err.code === config.ERR_CODE.UNAUTHORIZED) {
          this.$router.push('/');
        } else if (err.code === config.ERR_CODE.DEVICE_OFFLINE) {
          this.deviceOffline(this.$store.state.activeDevice);
          // switch to another online device
          let newDev = this.$store.state.devices.find(dev => dev.online);
          this.$store.commit('setActiveDevice', newDev);
          return;
        }
        if (err.code !== config.ERR_CODE.VALIDATION) {
          this.errMsg = err.message || err;
          this.$store.commit('pushError', err);
        }
        if (err.fieldList && err.fieldList.length > 0 || err.validationErrors && err.validationErrors.length > 0) this.$emit('validation', err);
      },
      deviceOffline(device) {
        this.deviceWentOffline = true;
        this.$store.commit('pushError', {
          code: config.ERR_CODE.DEVICE_OFFLINE,
          message: 'The Wanos appliance ' + (device ? '"' + device.hostname + ' (' + device.ip + ')"' : '') + ' became offline'
        });
        this.$router.push('/');
      },
      showSpin: function() {
        this.spinner++;
      },
      hideSpin: function() {
        if(this.spinner > 0) this.spinner--;
      },
    }
}).$mount('#app');
