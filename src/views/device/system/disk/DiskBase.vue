<template>
  <v-layout row wrap>
    <v-flex xs12 lg6>
      <v-card class="elevation-3 mt-2" height="100%">
        <v-card-title class="pa-2 ">
          <h6 class="subheading">Disk Input/Output load the Last {{ period }}</h6>
        </v-card-title>
        <system-panel :info="infoLoad" ref="panelLoad"/>
      </v-card>
    </v-flex>
    <v-flex xs12 lg6>
      <v-card class="elevation-3 mt-2" height="100%">
        <v-card-title class="pa-2 ">
          <h6 class="subheading">Disk space utilization the Last {{ period }}</h6>
        </v-card-title>
        <system-panel :info="infoSpace" ref="panelSpace"/>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapState } from "vuex"
import { WanosApi } from '@/api/wanos.api'
import SystemPanel from '@/components/base/systemPanel.vue'

export default {
  name: 'DiskBase',
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
      infoLoad: {},
      infoSpace: {}
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
        WanosApi.getDiskLoad(this.activeOrg._id, this.activeDevice._id, this.period.toLowerCase()).then(response => {
          this.infoLoad = response;
          this.$nextTick(() => {
            this.$refs.panelLoad.updateChart(); // trigger an update for the chart
          });
        }).catch(err => {
          console.error(err);
        });
        WanosApi.getDiskSpace(this.activeOrg._id, this.activeDevice._id, this.period.toLowerCase()).then(response => {
          this.infoSpace = response;
          this.$nextTick(() => {
            this.$refs.panelSpace.updateChart(); // trigger an update for the chart
          });
        }).catch(err => {
          console.error(err);
        });
      }
    }
}
</script>
