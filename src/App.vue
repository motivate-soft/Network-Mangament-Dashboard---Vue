<template>
  <v-app :dark="darkTheme">
    <login v-if="!user"/>
    <layout v-else/>
    <v-dialog v-model="$root.deviceWentOffline" transition="scale-transition" max-width="500px" @keydown.esc="$root.deviceWentOffline = false">
      <v-card class="elevation-20">
        <v-card-title class="headline error lighten-1 white--text" primary-title>OFFLINE</v-card-title>
        <v-card-text class="title mt-4 mb-3">The currently active Wanos device went offline.</v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" class="mt-2 mb-2" @click="$root.deviceWentOffline = false">Close</v-btn>
          <v-spacer />
        </v-card-actions>
      </v-card>
    </v-dialog>
    <notification-box v-model="$root.errMsg" type="error" :timeout="3000"/>
    <div v-show="$root.spinner > 0" class="loader">
      <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
        <g fill="#bbbbbb" stroke="#ffffff" stroke-width="1">
          <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" transform="rotate(0 50 50) translate(0 -30)"/>
          <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" transform="rotate(30 50 50) translate(0 -30)"/>
          <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" transform="rotate(60 50 50) translate(0 -30)"/>
          <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" transform="rotate(90 50 50) translate(0 -30)"/>
          <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" transform="rotate(120 50 50) translate(0 -30)"/>
          <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" transform="rotate(150 50 50) translate(0 -30)"/>
          <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" transform="rotate(180 50 50) translate(0 -30)"/>
          <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" transform="rotate(210 50 50) translate(0 -30)"/>
          <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" transform="rotate(240 50 50) translate(0 -30)"/>
          <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" transform="rotate(270 50 50) translate(0 -30)"/>
          <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" transform="rotate(300 50 50) translate(0 -30)"/>
          <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" transform="rotate(330 50 50) translate(0 -30)"/>
        </g>
      </svg>
    </div>
  </v-app>
</template>

<script>
import NotificationBox from '@/components/base/NotificationBox.vue'
import Login from "@/views/Login.vue";
import Layout from "@/views/Layout.vue";
import { mapState, mapGetters } from "vuex";

export default {
  name: "App",

  components:
  {
    NotificationBox,
    Login,
    Layout
  },

  computed:
  {
    ...mapState(["user"]),
    ...mapGetters(['darkTheme']),
  },

  beforeDestroy() {
    this.$store.commit('clearState');
  }
};
</script>

<style>
  html
  {
    overflow: hidden !important; /* prevent Vuetify scrollbar */
  }

  .loader
  {
    z-index: 300;
    position: fixed;
    top: 50%;
    left: 50%;
    height: 35px;
    width: 35px;
    margin-left: -50px;   /* negative, half of width above */
    margin-top: -50px;   /* negative, half of height above */
    animation: rot 1.7s infinite linear;
  }

  @keyframes rot
  {
    0%
    {
      transform: rotate(0deg);
    }

    100%
    {
      transform: rotate(359deg);
    }
  }

  .application.theme--light tspan
  {
    fill: #000 !important;
  }

  .application.theme--dark tspan
  {
    fill: #FFF !important;
  }

  .striped_table tbody tr:nth-child(odd)
  {
    background-color: rgba(0, 0, 0, .03);
  }

  i.edit-icons:hover
  {
    filter : invert(40%);
  }

  div.theme--dark input:-webkit-autofill
  {
    -webkit-text-fill-color: white;
    transition: background-color 5000s ease-in-out 0s;
  }
  div.theme--dark input:-moz-autofill
  {
    -moz-text-fill-color: white;
    transition: background-color 5000s ease-in-out 0s;
  }

  div.theme--light input:-webkit-autofill
  {
    -webkit-text-fill-color: black;
    transition: background-color 5000s ease-in-out 0s;
  }
  div.theme--light input:-moz-autofill
  {
    -moz-text-fill-color: black;
    transition: background-color 5000s ease-in-out 0s;
  }

</style>
