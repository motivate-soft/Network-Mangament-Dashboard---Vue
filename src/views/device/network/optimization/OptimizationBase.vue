<template>
  <v-layout row wrap>
    <!-- Total optimized from LAN to WAN -->
    <v-flex xs12 lg6>
      <v-card class="elevation-3" height="100%">
        <v-card-title class="pa-2 ">
          <h6 class="subheading">{{ peer.hostname }}: optimized traffic from LAN to WAN for the Last {{ period }}</h6>
        </v-card-title>
        <system-panel :info="totalLanWan" ref="_LanWan" totals saved/>
      </v-card>
    </v-flex>
    <!-- Total optimized from WAN to LAN -->
    <v-flex xs12 lg6>
      <v-card class="elevation-3" height="100%">
        <v-card-title class="pa-2 ">
          <h6 class="subheading">{{ peer.hostname }}: optimized traffic from WAN to LAN for the Last {{ period }}</h6>
        </v-card-title>
        <system-panel :info="totalWanLan" ref="_WanLan" totals saved/>
      </v-card>
    </v-flex>
    <!-- Total pass-through -->
    <v-flex xs12 lg6>
      <v-card class="elevation-3" height="100%">
        <v-card-title class="pa-2 ">
          <h6 class="subheading">{{ peer.hostname }}: pass-through for the Last {{ period }}</h6>
        </v-card-title>
        <system-panel :info="passThrough" ref="_passThrough" totals/>
      </v-card>
    </v-flex>
    <!-- Total ratio -->
    <v-flex xs12 lg6>
      <v-card class="elevation-3" height="100%">
        <v-card-title class="pa-2 ">
          <h6 class="subheading">{{ peer.hostname }}: WANop ratios for the Last {{ period }}</h6>
        </v-card-title>
        <system-panel :info="ratios" ref="_ratios"/>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapState } from "vuex"
import { WanosApi } from '@/api/wanos.api'
import SystemPanel from '@/components/base/systemPanel.vue'

export default {
  name: 'OverviewBase',
  components:
    {
      SystemPanel,
    },
  props:
    {
      period:
        {
          type: String,
          default: 'Day'
        },
      peer:
        {
          type: Object,
          default: () => ({})
        }
    },
  data() {
    return {
      totalWanLan: {},
      totalLanWan: {},
      passThrough: {},
      ratios: {},
    }
  },
  computed:
    {
      ...mapState(["activeOrg", "activeDevice"]),
    },
  /*
  watch:
    {
      period:
        {
          // we use the same component for all tabs - so we have to fetch new data from the API on each Tab change, and also on the initial view
          handler: 'fetchData',
          immediate: true
        },
    },
    */
  methods:
    {
      async fetchData() {
        WanosApi.getOptimizationLanWan(this.activeOrg._id, this.activeDevice._id, this.period.toLowerCase(), this.peer.ip).then(response => {
          this.totalLanWan = response;
          this.$nextTick(() => {
            this.$refs._LanWan.updateChart(); // trigger an update for the chart
          });
        }).catch(err => {
          console.error(err);
        });
        WanosApi.getOptimizationWanLan(this.activeOrg._id, this.activeDevice._id, this.period.toLowerCase(), this.peer.ip).then(response => {
          this.totalWanLan = response;
          this.$nextTick(() => {
            this.$refs._WanLan.updateChart(); // trigger an update for the chart
          });
        }).catch(err => {
          console.error(err);
        });
        WanosApi.getOptimizationPassThrough(this.activeOrg._id, this.activeDevice._id, this.period.toLowerCase(), this.peer.ip).then(response => {
          this.passThrough = response;
          this.$nextTick(() => {
            this.$refs._passThrough.updateChart(); // trigger an update for the chart
          });
        }).catch(err => {
          console.error(err);
        });
        WanosApi.getOptimizationRatios(this.activeOrg._id, this.activeDevice._id, this.period.toLowerCase(), this.peer.ip).then(response => {
          this.ratios = response;
          this.$nextTick(() => {
            this.$refs._ratios.updateChart(); // trigger an update for the chart
          });
        }).catch(err => {
          console.error(err);
        });
      },
    }
}
</script>

<style>
  .no_tbl_header table > thead > tr
  {
    height: auto !important;
  }
</style>
