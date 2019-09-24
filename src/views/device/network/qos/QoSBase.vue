<template>
  <v-layout v-if="info.length > 0" row wrap>
    <v-flex v-for="graph in info" :key="graph.class" xs12 lg6>
      <v-card class="elevation-3 mt-2" height="100%">
        <v-card-title class="pa-2 ">
          <h6 class="subheading">{{ graph.name }} for the Last {{ period }}</h6>
        </v-card-title>
        <system-panel :info="graph" ref="panel" totals/>
      </v-card>
    </v-flex>
  </v-layout>
  <div v-else class="center_screen">
    <h1>No data</h1>
  </div>
</template>

<script>
import { mapState } from "vuex"
import { WanosApi } from '@/api/wanos.api'
import SystemPanel from '@/components/base/systemPanel.vue'

export default {
  name: 'QoSBase',
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
      group:
        {
          type: Number,
          default: null
        }
    },
  data() {
    return {
      info: [],
    }
  },
  computed:
    {
      ...mapState(["activeOrg", "activeDevice"]),
    },
  methods:
    {
      async fetchData(group, period) {
        try {
          this.info = await WanosApi.getNetworkQoS(this.activeOrg._id, this.activeDevice._id, period.toLowerCase(), group);
          if(this.info && this.info.length > 0) this.$nextTick(() => {
            this.$refs.panel.forEach(item => {
              item.updateChart(); // trigger an update for the chart
            })
          });
        } catch(err) {
          console.error(err);
        }
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
