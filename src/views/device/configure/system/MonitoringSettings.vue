<template>
  <v-layout justify-center>
    <v-form ref="form" lazy-validation @submit.prevent="save">
      <v-card class="elevation-3" min-width="500px">
        <v-card-title class="pa-2 ">
          <h6 class="subheading">Monitoring settings</h6>
        </v-card-title>
        <v-card-text>
          <v-checkbox v-model="settings.snmp" label="Enable SNMP daemon" class="hide_messages"/>
          <v-checkbox v-model="settings.netflowExporting" label="Enable Netflow exports" class="hide_messages"/>
          <v-text-field :rules="settings.netflowExporting ? [rules.ip] : []" :error-messages="serverValidation.netflowIP" v-model.trim="settings.netflowIP" label="IP address of the Netflow collector"
                        hint="Ex: 192.168.0.1" validate-on-blur @focus="serverValidation.netflowIP = []" :disabled="!settings.netflowExporting"/>
          <v-text-field :rules="settings.netflowExporting ? [rules.port] : []" :error-messages="serverValidation.netflowPort" v-model.number="settings.netflowPort" label="Port of the Netflow collector (ex: 2055)"
                        validate-on-blur @focus="serverValidation.netflowPort = []" :disabled="!settings.netflowExporting" type="number" min="1" max="65535" hint="1 - 65535"/>
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
import ValidationRules from '@/plugins/validationRules'

export default
{
  name: 'MonitoringSettings',
  mixins: [ValidationRules],
  data() {
    return {
      settings:
        {
          snmp: false,
          netflowExporting: false,
          netflowIP: null,
          netflowPort: null,
        },
      serverValidation:
        {
          netflowIP: [],
          netflowPort: [],
        },
    }
  },
  computed:
    {
      ...mapState(["activeOrg", "activeDevice"]),
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
          this.settings = await WanosApi.getConfigMonitoring(this.activeOrg._id, this.activeDevice._id);
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
          await WanosApi.saveMonitoringSettings(this.activeOrg._id, this.activeDevice._id, this.settings);
        } catch (err) {
          console.error(err);
        }
      }
    }
}
</script>
