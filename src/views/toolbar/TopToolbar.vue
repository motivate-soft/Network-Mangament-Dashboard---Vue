<template>
  <v-toolbar clipped-left app dark flat color="secondary" >
    <v-toolbar-side-icon @click.stop="toggleDrawer"/>
    <v-btn icon @click.stop="$emit('mini')">
      <v-icon>{{ miniVariant ? 'chevron_right' : 'chevron_left' }}</v-icon>
    </v-btn>

    <v-toolbar-title>Wanos Central Manager</v-toolbar-title>

    <v-spacer/>
    <v-btn v-if="$root.isDEV" small @click="fakeOffline">OFFLINE</v-btn>
    <benchmark-spinner />
    <!-- Organization selector -->
    <select-org />
    <!-- Account settings -->
    <account-settings />

    <!-- The popup with the list of errors logged -->
    <v-btn flat class="event_button" style="min-width: 0; padding: 0 5px;" @click="showErrors = true">
      <v-badge :value="errors.length > 0" color="pink" overlap>
        <template slot="badge">{{ errors.length }}</template>
        <v-icon large color="white">notifications_none</v-icon>
      </v-badge>
    </v-btn>
    <a href="http://wanos.co" target="_blank" title="Wanos Networks">
      <img src="@/assets/wanos-logo2.png" alt="Wanos" class="pl-2">
    </a>

    <!-- Device alerts -->
    <v-snackbar top right color="secondary" :value="hasAlert" :timeout="0" style="top:50px">
      <div>
        Configuration changed. <v-btn small color="primary" @click="applyReconfigure">Apply now</v-btn>
      </div>
    </v-snackbar>
    <v-snackbar top center color="error" :value="hasDeviceError" :timeout="0">
      <div>
        The error has been detected. Please check the <router-link to="/device/diagnostics/logging/error">detail</router-link>.
        <v-btn small color="secondary" @click="confirmErrorLog">Dismiss</v-btn>
      </div>
    </v-snackbar>
    <v-snackbar top v-model="reconfigureSnackbar">
      <div>{{ reconfigureMessage }}</div>
    </v-snackbar>

    <list-errors v-model="showErrors" />
  </v-toolbar>
</template>

<script>
import events from '@/events'
import config from '@/config'
import listErrors from './ErrorsList'
import accountSettings from './AccountSettings'
import SelectOrg from "./SelectOrg"
import benchmarkSpinner from './BenchmarkSpinner'
import { WanosApi } from '@/api/wanos.api'
import { mapState, mapMutations } from 'vuex'

export default
{
  name: 'TopToolbar',
  components:
    {
      SelectOrg,
      listErrors,
      accountSettings,
      benchmarkSpinner,
    },
  props:
    {
      miniVariant:
        {
          type: Boolean,
          default: false
        },
      clipped:
        {
          type: Boolean
        }
    },
  data() {
    return {
      showErrors: false,
      reconfigureMessage: '',
      reconfigureSnackbar: false,
      timerAlerts: null,
    }
  },
  computed:
    {
      ...mapState(['activeDevice', 'activeOrg', 'errors', 'user']),
      hasAlert() {
        return this.activeDevice && this.activeDevice.alert ? !!this.activeDevice.alert.reconfigure : false;
      },
      hasDeviceError() {
        return this.activeDevice && this.activeDevice.alert ? !!this.activeDevice.alert.error : false;
      }
    },
  created() {
    this.timerAlerts = setTimeout(this.alertPoller, config.pollingAlerts);
  },
  beforeDestroy() {
    if (this.timerAlerts) clearTimeout(this.timerAlerts);
  },
  methods:
    {
      ...mapMutations(['setDeviceErrorStatus', 'setDeviceAlert', 'setDeviceResetting']),
      fakeOffline() {
        events.$emit('device_off', this.activeDevice);
      },
      toggleDrawer() {
        events.$emit('toggle_drawer');
      },
      async alertPoller() {
        if (this.activeDevice) {
          const res = await WanosApi.alertPoll(this.activeOrg._id, this.activeDevice._id);
          if (res) {
            if (res.reconfigure && !this.activeDevice.resetting) this.setDeviceAlert(true);
            if (res.error) this.setDeviceErrorStatus(true);
          }
        }
        if (this.user) this.timerAlerts = setTimeout(this.alertPoller, config.pollingAlerts);
      },
      async applyReconfigure() {
        this.setDeviceResetting(true);
        const res = await WanosApi.configResetCounter(this.activeOrg._id, this.activeDevice._id, 'service');
        this.setDeviceResetting(false);
        this.setDeviceAlert(false);
        if (res && res.message) {
          this.reconfigureMessage = res.message;
          this.reconfigureSnackbar = true;
        }
      },
      async confirmErrorLog() {
        if (this.user && this.activeDevice) {
          const res = await WanosApi.dismissDeviceError(this.activeOrg._id, this.activeDevice._id);
          if (res) {
            this.setDeviceErrorStatus(false);
          }
        }
      },

    }
}
</script>

<style>
  .event_button .v-badge__badge
  {
    width: auto;
    height: auto;
    min-width: 22px;
    min-height: 22px;
    padding: 1px 4px;
  }

</style>
