<template>
  <div>
    <sidebar-drawer :mini-variant="miniVariant" />

    <!-- Top toolbar -->
    <top-toolbar :mini-variant="miniVariant" @mini="miniVariant = !miniVariant"/>
    <v-snackbar top center v-model="deviceChangedSnackbar" color="success">
      <div>
        The active device has been changed - be careful with your configuration changes.
      </div>
    </v-snackbar>

    <!-- Main body -->
    <v-content>
      <v-slide-x-transition mode="out-in">
        <router-view :key="refreshView"/>
      </v-slide-x-transition>
    </v-content>

    <!-- Footer -->
    <v-footer fixed app>
      <!-- Auto generated build version -->
      <h6 class="grey--text text--darken-2 body-1">Version: {{ appVersion }}
      (gitref)
      </h6>
      <v-spacer/>
      <h6 class="grey--text text--darken-2 body-1">Copyright &copy; 2013 - 2019 Wanos Networks Pty (Ltd) |
          <a href="http://wanos.co/" target="_blank"> Wanos.co</a> |
          <a href="http://wanos.co/wan-optimization/support/" target="_blank"> Support</a> |
          <a href="http://wanos.co/wan-optimization/privacy-policy/" target="_blank"> Privacy Policy</a>
        </h6>
    </v-footer>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
import events from '@/events'
import TopToolbar from "./toolbar/TopToolbar";
import sidebarDrawer from './toolbar/SidebarDrawer'
import { version } from '@/../package.json'

export default {
  name: "Layout",
  components: {
    TopToolbar,
    sidebarDrawer,
  },
  data() {
    return {
      refreshView: 1,
      miniVariant: false,
      deviceChangedSnackbar: false,
    };
  },

  computed:
  {
    ...mapState(["orgs", "devices", "activeOrg", "activeDevice"]),
    appVersion () {
      return version;
    }
  },

  watch:
  {
    activeDevice(newVal, oldVal) {
      if ((oldVal || {})._id === (newVal || {})._id) return;
      // This feels like a hack, but seems to be the only way to refresh a router
      // view when the active device changes and we are viewing any page that is not
      // the main organization dashboard page.
      if (this.$route && this.$route.name && this.$route.name !== "dashboard") {
        this.refreshView++;
      }
      if (newVal) this.deviceChangedSnackbar = true;
    }
  },

  created() {
    if (this.orgs.length === 0 && !window.WanosBootstrapping) this.getBootstrap();
    this.$options.sockets.onmessage = message => {
      // Online devices has changed, so update the device list
      if (message.data === "ONLINE_DEVICES_UPDATED" && this.activeOrg) {
        const oldDev = this.activeDevice;
        this.getDevices(this.activeOrg._id).then(() => {
          if(!oldDev) return;
          let newDev = this.devices.find(dev => dev._id === oldDev._id);
          if(newDev && oldDev.online && !newDev.online) {
            events.$emit('device_off', Object.assign({}, oldDev)); // active device is offline - redirect to Dashboard
            // switch to another online device
            // newDev = this.devices.find(dev => dev.online);
            this.setActiveDevice(null); // Antonie does not want a device to be auto-selected
          }
        });
      }
    };
    if (!this.user && this.activeDevice) this.$router.push('/');
  },
  beforeDestroy() {
    this.$options.sockets.onmessage = null;
  },
  methods:
  {
    ...mapMutations(["setActiveDevice"]),
    ...mapActions(["getBootstrap", "getDevices"]),
  },

};
</script>

<style>
  .v-dialog.auto
  {
    width: auto;
  }

  .v-content
  {
    height: 100vh;
    overflow: hidden;
  }

  .v-content__wrap
  {
    overflow: auto;
  }

  .center_screen
  {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    position: fixed;
    line-height: 1.5;
    color: #888;
    font-family: sans-serif;
    text-align: center;
  }

</style>
