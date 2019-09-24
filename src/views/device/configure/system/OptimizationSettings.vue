<template>
  <v-layout justify-center>
    <v-form ref="form" lazy-validation @submit.prevent="save">
      <v-card class="elevation-3" min-width="500px">
        <v-card-title class="pa-2 ">
          <h6 class="subheading">Optimization settings</h6>
        </v-card-title>
        <v-card-text>
          <v-text-field :error-messages="serverValidation.peerTimeout" v-model.number="settings.peerTimeout" label="Peer timeout (seconds)"
                        validate-on-blur @focus="serverValidation.peerTimeout = []" type="number" min="0" max="100000" hint="1 - 86400 (ex: 60)"/>
          <v-text-field :error-messages="serverValidation.wanRate" v-model.number="settings.wanRate" label="Max WAN Tx rate (Kbps)"
                        validate-on-blur @focus="serverValidation.wanRate = []" type="number" min="0" max="100000" hint="0 = disable traffic shaping"/>
          <v-slider v-model.number="settings.compression" label="Compression level" max="10" ticks :tick-labels="tickCompression"
                    hint="0 = disabled, 1 = fast, 10 = best" persistent-hint/>
          <v-slider v-model.number="settings.deduplication" label="Deduplication level" max="4" ticks :tick-labels="tickDeduplication"
                    hint="0 = disabled, 1 = fast, 4 = best" persistent-hint/>
          <v-select v-model="settings.lossRecovery" :items="recovery" label="Packet loss recovery"/>
          <v-select v-model="settings.errorCorrection" :items="correction" label="Forward error correction"/>
          <v-select v-model="settings.aggregation" :items="aggregation" label="Packet aggregation" hint="Max coalesce wait time (milliseconds)"/>

          <v-checkbox v-model="settings.accelerator" label="Enable TCP accelerator" class="hide_messages"/>
          <v-checkbox v-model="settings.webcache" label="Enable Webcache" class="hide_messages"/>
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
  name: 'OptimizationSettings',
  mixins: [ValidationRules],
  data() {
    return {
      tickCompression: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      tickDeduplication: ['0', '1', '2', '3', '4'],
      recovery:
      [
        {
          text: 'Stateless',
          value: 0,
        },
        {
          text: 'Stream compress only (<= 20ms)',
          value: 1,
        },
        {
          text: 'Conservative',
          value: 2,
        },
        {
          text: 'Medium',
          value: 3,
        },
        {
          text: 'Aggressive',
          value: 4,
        },
      ],
      correction:
      [
        {
          text: 'OFF (default)',
          value: 0
        },
        {
          text: 'FEC 2:1',
          value: 2
        },
        {
          text: 'FEC 5:1',
          value: 5
        },
        {
          text: 'FEC 10:1',
          value: 10
        },
        {
          text: 'FEC 20:1',
          value: 20
        },
      ],
      aggregation:
      [
        {
          text: '0 (default)',
          value: 0,
        },
        {
          text: '10ms',
          value: 10,
        },
        {
          text: '20ms',
          value: 20,
        },
        {
          text: '50ms',
          value: 50,
        },
        {
          text: '100ms',
          value: 100,
        },
      ],
      settings:
        {
          peerTimeout: 60,
          wanRate: 0,
          compression: 0,
          deduplication: 0,
          lossRecovery: 0,
          errorCorrection: 0,
          aggregation: 0,
          accelerator: false,
          webcache: false,
        },
      serverValidation:
        {
          peerTimeout: [],
          wanRate: [],
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
          this.settings = await WanosApi.getConfigOptimization(this.activeOrg._id, this.activeDevice._id);
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
          await WanosApi.saveOptimizationSettings(this.activeOrg._id, this.activeDevice._id, this.settings);
        } catch (err) {
          console.error(err);
        }
      }
    }
}
</script>
