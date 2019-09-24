<template>
  <v-layout row wrap>
    <!-- System load -->
    <v-flex xs12 lg6>
      <v-card class="elevation-3 mt-2" height="100%">
        <v-card-title class="pa-2">
          <h6 class="subheading">System load the Last {{ period }}</h6>
        </v-card-title>
        <system-panel :info="infoSystem" ref="panelSystem"/>
      </v-card>
    </v-flex>
    <!-- CPU -->
    <v-flex xs12 lg6>
      <v-card class="elevation-3 mt-2" height="100%">
        <v-card-title class="pa-2">
          <h6 class="subheading">CPU load the Last {{ period }}</h6>
        </v-card-title>
        <system-panel :info="infoCPU" ref="panelCPU"/>
      </v-card>
    </v-flex>
    <!-- I/O load -->
    <v-flex xs12 lg6>
      <v-card class="elevation-3 mt-2" height="100%">
        <v-card-title class="pa-2">
          <h6 class="subheading">Disk Input/Output load the Last {{ period }}</h6>
        </v-card-title>
        <system-panel :info="infoDiskLoad" ref="panelDiskLoad"/>
      </v-card>
    </v-flex>
    <!-- RAM -->
    <v-flex xs12 lg6>
      <v-card class="elevation-3 mt-2" height="100%">
        <v-card-title class="pa-2">
          <h6 class="subheading">RAM utilization the Last {{ period }}</h6>
        </v-card-title>
        <system-panel :info="infoRAM" ref="panelRAM"/>
      </v-card>
    </v-flex>
    <!-- Disk space -->
    <v-flex xs12 lg6>
      <v-card class="elevation-3 mt-2" height="100%">
        <v-card-title class="pa-2">
          <h6 class="subheading">Disk usage the Last {{ period }}</h6>
        </v-card-title>
        <system-panel :info="infoDiskSpace" ref="panelDiskSpace"/>
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
        }
    },
  data() {
    return {
      loading: false,
      infoSystem: {},
      infoCPU: {},
      infoRAM: {},
      infoDiskLoad: {},
      infoDiskSpace: {},
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
        },
    },
  methods:
    {
      async fetchData() {
        WanosApi.getSystemLoad(this.activeOrg._id, this.activeDevice._id, this.period.toLowerCase()).then(response => {
          this.infoSystem = response;
          this.$nextTick(() => {
            this.$refs.panelSystem.updateChart(); // trigger an update for the chart
          });
        }).catch(err => {
          console.error(err);
        });
        WanosApi.getCPUData(this.activeOrg._id, this.activeDevice._id, this.period.toLowerCase()).then(response => {
          this.infoCPU = response;
          this.$nextTick(() => {
            this.$refs.panelCPU.updateChart(); // trigger an update for the chart
          });
        }).catch(err => {
          console.error(err);
        });
        WanosApi.getMemoryData(this.activeOrg._id, this.activeDevice._id, this.period.toLowerCase()).then(response => {
          this.infoRAM = response;
          this.$nextTick(() => {
            this.$refs.panelRAM.updateChart(); // trigger an update for the chart
          });
        }).catch(err => {
          console.error(err);
        });
        WanosApi.getDiskLoad(this.activeOrg._id, this.activeDevice._id, this.period.toLowerCase()).then(response => {
          this.infoDiskLoad = response;
          this.$nextTick(() => {
            this.$refs.panelDiskLoad.updateChart(); // trigger an update for the chart
          });
        }).catch(err => {
          console.error(err);
        });
        WanosApi.getDiskSpace(this.activeOrg._id, this.activeDevice._id, this.period.toLowerCase()).then(response => {
          this.infoDiskSpace = response;
          this.$nextTick(() => {
            this.$refs.panelDiskSpace.updateChart(); // trigger an update for the chart
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
