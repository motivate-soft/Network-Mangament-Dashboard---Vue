<template>
  <v-layout justify-center>
    <v-form ref="form" lazy-validation @submit.prevent="save">
      <v-card class="elevation-3" min-width="500px">
        <v-card-title class="pa-2 ">
          <h6 class="subheading">Network settings</h6>
        </v-card-title>
        <v-card-text>
          <v-text-field :rules="[rules.ipmask]" :error-messages="serverValidation.ipMask" v-model.trim="settings.ipMask" label="Wan IP address / subnet mask"
                        hint="Ex: 192.168.0.1/24" validate-on-blur @focus="serverValidation.ipMask = []"/>
          <v-text-field :rules="[rules.ip]" :error-messages="serverValidation.gateway" v-model.trim="settings.gateway" label="Wan gateway"
                        validate-on-blur @focus="serverValidation.gateway = []"/>
          <v-select v-model="settings.deployment" :items="deployments" label="Deployment mode"/>
          <v-select v-model="settings.encapsulation" :items="encapsulations" label="Encapsulation" hint="Encapsulation should match on all sites" persistent-hint/>
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
  name: 'NetworkSettings',
  mixins: [ValidationRules],
  data() {
    return {
      deployments: [
        'bridge',
        'tunnel',
      ],
      settings:
        {
          ipMask: null,
          gateway: null,
          deployment: null,
          encapsulation: null,
        },
      serverValidation:
        {
          ipMask: [],
          gateway: [],
        },
    }
  },
  computed:
    {
      ...mapState(["activeOrg", "activeDevice"]),
      encapsulations() {
        return this.settings.deployment === 'tunnel' ?
        [
          'ipcomp',
          'udp',
          'gre',
          'ipsec',
          'ipsec-in-udp'
        ] :
          [
            'ipcomp',
            'udp'
          ];
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
          this.settings = await WanosApi.getConfigNetwork(this.activeOrg._id, this.activeDevice._id);
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
          await WanosApi.saveNetworkSettings(this.activeOrg._id, this.activeDevice._id, this.settings);
        } catch (err) {
          console.error(err);
        }
      }
    }
}
</script>
