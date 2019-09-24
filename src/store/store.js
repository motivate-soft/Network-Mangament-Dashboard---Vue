import Vue from "vue";
import Vuex from "vuex";
import persistedState from 'vuex-persistedstate'
import { WanosApi } from "@/api/wanos.api";
import config from '@/config'

Vue.use(Vuex);

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',

  plugins:
    [
      persistedState(
        {
          key: 'wanos',
          paths: ['user', 'activeOrg', 'activeDevice']
        }
      )
    ],

  state: {
    user: null,
    orgs: [],
    activeOrg: null,
    devices: [],
    activeDevice: null,
    devicesStats: [],
    errors: []
  },

  getters: {
    // getDeviceIpById: (state) => (id) => {
    //   let device = state.devices.find(device => device.id === id);
    //   return device !== undefined ? device.ip : "";
    // }
    userAccess(state) {
      return (state.user || {}).accessRight === 'w';
    },
    darkTheme(state) {
      return !(state.user && state.user.settings && state.user.settings.theme === 'lightTheme');
    }
  },

  mutations: {
    setTheme(state, theme) {
      if (state.user) {
        if (!state.user.settings) Vue.set(state.user, 'settings', {});
        if (!('theme' in state.user.settings)) Vue.set(state.user.settings, 'theme', theme);
        else state.user.settings.theme = theme;
      }
    },
    setUser(state, user) {
      state.user = user;
    },
    setOrgs(state, orgs) {
      state.orgs = orgs;
    },
    setActiveOrg(state, org) {
      state.activeOrg = state.orgs.find(item => item._id === org._id);
    },
    setDevices(state, devices) {
      state.devices = devices;
    },
    setActiveDevice(state, device) {
      state.activeDevice = device;
    },
    setDevicesStats(state, stats) {
      state.devicesStats = stats;
    },
    clearState(state) {
      // we can not assign directly to STATE or otherwise we will immediately loose the reactivity
      state.user = null;
      state.orgs = [];
      state.devices = [];
      state.activeOrg = null;
      state.activeDevice = null;
      state.devicesStats = [];
      state.errors = [];
    },
    pushError(state, error) {
      if (typeof error !== 'object') error = {message: error};
      error.stamp = new Date();
      error.key = error.stamp.getTime();
      state.errors.unshift(error);
    },
    dismissError(state, index) {
      state.errors.splice(index, 1);
    },
    dismissAll(state) {
      state.errors = [];
    },
    removeOrg(state, org) {
      const oldOrg = org._id;
      const idx = state.orgs.indexOf(org);
      if (idx !== -1) {
        state.orgs.splice(idx, 1);
        // find ID of the Global org
        const global = state.orgs.find(item => item.name === 'Global') || {};
        // move all devices from this organization back to Global
        state.devices.forEach(item => {
          if (item.orgId === oldOrg) item.orgId = global._id;
        });
      }
    },
    removeDevice(state, device) {
      const idx = state.devices.findIndex(dev => dev._id === device._id);
      if (idx !== -1) state.devices.splice(idx, 1);
    },
    updateOrg(state, org) {
      const idx = state.orgs.findIndex(item => item._id === org._id);
      if (idx !== -1) state.orgs.splice(idx, 1, org);
    },
    updateDevice(state, device) {
      const idx = state.devices.findIndex(item => item._id === device._id);
      if (idx !== -1) state.devices.splice(idx, 1, device);
    },
    addOrg(state, org) {
      state.orgs.push(org);
    },
    addDevice(state, device) {
      state.devices.push(device);
    },
    setDeviceAlert(state, alert) {
      if (state.activeDevice) {
        if (!(alert in state.activeDevice)) Vue.set(state.activeDevice, 'alert', {reconfigure: alert});
        else state.activeDevice.alert.reconfigure = alert;
      }
    },
    setDeviceErrorStatus(state, error) {
      if (state.activeDevice) {
        if (!(alert in state.activeDevice)) Vue.set(state.activeDevice, 'alert', {error: error});
        else state.activeDevice.alert.error = error;
      }
    },
    setDeviceResetting(state, reset) {
      if (state.activeDevice) Vue.set(state.activeDevice, 'resetting', reset);
    },
  },

  actions: {
    login({ commit }, user) {
      return WanosApi.login(user)
        .then(res => {
          if(res.email) {
            commit("setUser", res);
          }
        });
    },
    logout({ commit }) {
      return new Promise(resolve => {
        commit("clearState");
        resolve();
      })
    },
    getOrgs({ commit }) {
      return WanosApi.getOrgs()
        .then(res => {
          commit("setOrgs", res || []);
        });
    },
    getDevices({ commit }, orgId) {
      return WanosApi.getDevices(orgId)
        .then(res => {
          commit("setDevices", res || []);
        });
    },
    getBootstrap({ commit }) {
      return WanosApi.getBootstrap()
        .then(res => {
          // res will be NULL if the token in the cookie has expired
          if (res) {
            commit("setOrgs", res.orgs);
            commit("setDevices", res.devices);
            if (res.activeOrg) {
              commit("setActiveOrg", res.activeOrg);
            }
            let active = null;
            if (res.devices.length > 0) {
              const oldDeviceId = localStorage.getItem(config.WCM_activeDevice);
              if (oldDeviceId) {
                active = res.devices.find(dev => dev._id === oldDeviceId);
              }
            }
            commit("setActiveDevice", active);
          }
        });
    },
    getDevicesStats({ commit }, orgId) {
      return WanosApi.getDevicesStats(orgId)
        .then(res => {
          commit("setDevicesStats", res);
        })
    },
    dismissError({ commit }, index) {
      commit('dismissError', index);
    },
    dismissAll({ commit }) {
      commit('dismissAll');
    },
    deleteOrg({ commit }, org) {
      return WanosApi.removeOrg(org._id)
        .then((res) => {
          if(res) commit("removeOrg", org);
        });
    },
    updateOrg({ commit }, org) {
      return WanosApi.updateOrg(org)
        .then((res) => {
          if(res) commit("updateOrg", org);
          return res;
        });
    },
    addOrg({ commit }, org) {
      return WanosApi.addOrg(org)
        .then((res) => {
          if(res) commit("addOrg", res.data);
          return res;
        });
    },
    deleteDevice({ commit }, device) {
      return WanosApi.removeDevice(device._id)
        .then((res) => {
          if(res) commit("removeDevice", device);
        });
    },
    updateDevice({ dispatch, state }, device) {
      return WanosApi.updateDevice(device)
        .then((res) => {
          if(res) {
            dispatch('getDevices', state.activeOrg._id);
            dispatch('getDevicesStats', state.activeOrg._id);
          }
          return res;
        });
    },
    toggleDarkTheme({ state, commit, getters }) {
      commit("setTheme", getters.darkTheme ? 'lightTheme' : 'darkTheme');
      return WanosApi.setUserSettings(state.user);
    },
  }
});
