<template>
  <v-layout justify-center>
    <v-form ref="form" lazy-validation @submit.prevent="save">
      <v-card class="elevation-3" min-width="500px">
        <v-card-title class="pa-2 ">
          <h6 class="subheading">System settings</h6>
        </v-card-title>
        <v-card-text>
          <v-text-field :rules="[rules.required]" :error-messages="serverValidation.hostname" v-model.trim="settings.hostname" label="Hostname"
                        hint="Required" persistent-hint required validate-on-blur @focus="serverValidation.hostname = []"/>
          <v-layout>
            <v-flex xs6>
              <v-menu v-model="chooseDate" lazy max-width="100%" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y>
                <v-text-field slot="activator" label="Date" v-model="settings.date" readonly clearable/>
                <v-date-picker v-model="settings.date" first-day-of-week="1" locale="en-uk" @input="chooseDate = false"/>
              </v-menu>
            </v-flex>
            <v-flex xs6>
              <v-menu v-model="chooseTime" lazy max-width="100%" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y>
                <v-text-field slot="activator" label="Time" v-model="settings.time" readonly clearable/>
                <v-time-picker v-model="settings.time" use-seconds full-width/>
                <div>
                  <v-btn color="error" @click="chooseTime = false">Cancel</v-btn>
                  <v-btn color="success" @click="chooseTime = false">Accept</v-btn>
                </div>
              </v-menu>
            </v-flex>
          </v-layout>
          <v-text-field :rules="[rules.hostname]" :error-messages="serverValidation.ntp" v-model.trim="settings.ntp" label="NTP server"
                        placeholder="E.g. pool.ntp.org" validate-on-blur @focus="serverValidation.ntp = []"/>
          <v-select v-model="settings.timezone" :items="timeZones" label="Timezone"/>
          <v-checkbox v-model="settings.ssh" label="Enable SSH server on appliance" class="hide_messages"/>
          <v-select v-model="settings.datastore" :items="datastores" label="Datastore"/>
          <v-layout>
            <v-flex xs6>
              <v-text-field :rules="[rules.ip]" :error-messages="serverValidation.primary" v-model.trim="settings.primary" label="Primary DNS server"
                            validate-on-blur @focus="serverValidation.primary = []"/>
            </v-flex>
            <v-flex xs6>
              <v-text-field :rules="[rules.ip]" :error-messages="serverValidation.secondary" v-model.trim="settings.secondary" label="Secondary DNS server"
                            validate-on-blur @focus="serverValidation.secondary = []"/>
            </v-flex>
          </v-layout>
          <v-select v-model="settings.logLevel" :items="logLevels" label="Log level" hide-details/>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn color="success" dark type="submit">Submit</v-btn>
          <v-spacer/>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-layout>
</template>

<script>
import { mapState } from "vuex"
import { WanosApi } from '@/api/wanos.api'
import config from '@/config'
import timezones from '@/json/timezones.json'
import ValidationRules from '@/plugins/validationRules'

export default
{
  name: 'SystemSettings',
  mixins: [ValidationRules],
  data() {
    return {
      datastores: [],
      chooseDate: false,
      chooseTime: false,
      timeZones: timezones,
      settings:
        {
          hostname: null,
          ntp: null,
          date: null,
          time: null,
          timezone: 'UTC',
          ssh: false,
          primary: null,
          secondary: null,
          logLevel: 'info'
        },
      serverValidation:
        {
          hostname: [],
          ntp: [],
          primary: [],
          secondary: [],
        },
    }
  },
  computed:
    {
      ...mapState(["activeOrg", "activeDevice"]),
      logLevels() {
        return config.LOG_LEVELS
      }
    },
  created() {
    this.$root.$on('validation', this.onValidation);
  },
  beforeDestroy() {
    this.$root.$off('validation', this.onValidation);
  },
  mounted() {
    this.fetchData();
  },
  methods:
    {
      async fetchData() {
        try {
          const settings = await WanosApi.getConfigSystem(this.activeOrg._id, this.activeDevice._id);
          this.datastores = settings.datastoreList;
          this.settings = settings.settings;
        } catch (e) {
          console.error(e);
        }
      },
      onValidation (err) {
        if (err.code === config.ERR_CODE.VALIDATION || err.validationErrors) {
          const msgs = this.serverValidation;
          for(const elem of err.fieldList || err.validationErrors) {
            msgs[elem.field] = [elem.message];
          }
        }
      },
      async save() {
        if (!this.$refs.form.validate()) {
          return;
        }
        try {
          await WanosApi.saveSystemSettings(this.activeOrg._id, this.activeDevice._id, this.settings);
        } catch (err) {
          console.error(err);
        }
      }
    }
}
</script>
