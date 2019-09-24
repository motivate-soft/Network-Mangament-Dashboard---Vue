import Vue from "vue"
import VueNativeSock from "vue-native-websocket"

Vue.use(VueNativeSock, `ws://${window.location.host}/ws`);
