<template>
  <v-layout row wrap>
    <v-flex xs12 lg6 v-for="intf in info" :key="intf.name">
      <v-card class="elevation-3 mt-2">
        <v-card-title class="pa-2 ">
          <h6 class="subheading">{{ intf.name }} - network traffic for the Last {{ period }}</h6>
        </v-card-title>
        <system-panel :info="intf" ref="panel" totals/>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapState } from "vuex"
import { WanosApi } from '@/api/wanos.api'
import SystemPanel from '@/components/base/systemPanel.vue'

export default {
  name: 'TrafficBase',
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
  watch:
    {
      period:
        {
          // we use the same component for all tabs - so we have to fetch new data from the API on each Tab change, and also on the initial view
          handler: 'fetchData',
          immediate: true
        }
    },
  methods:
    {
      async fetchData() {
        try {
          this.info = await WanosApi.getNetworkTraffic(this.activeOrg._id, this.activeDevice._id, this.period.toLowerCase());
          if(this.info && this.info.length > 0) this.$nextTick(() => {
            this.$refs.panel.forEach(item => {
              item.updateChart(); // trigger an update for the chart
            })
          });
        } catch (e) {
          console.error(e);
        }
      }
    }
}
</script>
