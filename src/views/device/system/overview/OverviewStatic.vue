<template>
  <v-layout row wrap>
    <!-- System Info -->
    <v-flex xs12 lg6>
      <v-card class="elevation-3 mt-2" height="100%">
        <v-card-title class="pa-2">
          <h6 class="subheading">System Information</h6>
        </v-card-title>
        <v-data-table :items="systemInformation" hide-actions class="ma-2 striped_table no_tbl_header">
          <template slot="items" slot-scope="props">
            <tr>
              <td>{{ props.item.name }}</td>
              <td>{{ props.item.value }}</td>
            </tr>
          </template>
        </v-data-table>
      </v-card>
    </v-flex>
    <!-- Indicators -->
    <v-flex xs12 lg6>
      <v-card class="indicator_panel elevation-3 mt-2" height="100%">
        <v-card-title class="pa-2">
          <h6 class="subheading">Indicators</h6>
        </v-card-title>
        <v-card-text class="spacer justify-center indicator_panel">
          <div align="center" class="pb-5">
            <!-- d-inline-flex is to allow horizontal centering - otherwise it takes full width -->
            <v-select :items="intervalList" v-model.number="interval" label="Update interval" class="d-inline-flex" hide-details/>
          </div>
          <!-- we can not use a helper class for FLEX - it has undesired side effects (inter-dependencies with other CSS classes) -->
          <div class="justify-center align-center" style="display: flex;">
            <v-layout row wrap class="shrink">
              <v-flex style="text-align: center">
                <h4 class="pa-2">Load</h4>
                <chart-radial :value="indicators.load || 0" :size="100" :width="8" percent/>
              </v-flex>
              <v-flex style="text-align: center">
                <h4 class="pa-2">CPU</h4>
                <chart-radial :value="indicators.cpu || 0" :size="100" :width="8" percent/>
              </v-flex>
              <v-flex style="text-align: center">
                <h4 class="pa-2">Memory</h4>
                <chart-radial :value="indicators.memory || 0" :size="100" :width="8" percent/>
              </v-flex>
              <v-flex style="text-align: center">
                <h4 class="pa-2">Disk</h4>
                <chart-radial :value="indicators.disk || 0" :size="100" :width="8" percent/>
              </v-flex>
              <v-flex style="text-align: center">
                <h4 class="pa-2">Datastore</h4>
                <chart-radial :value="indicators.datastore || 0" :size="100" :width="8" percent/>
              </v-flex>
            </v-layout>
          </div>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapState } from "vuex"
import { WanosApi } from '@/api/wanos.api'
import ChartRadial from '@/components/base/UtilizationProgress'

export default
{
  name: 'SystemOverviewIndicators',
  components:
    {
      ChartRadial,
    },
  data() {
    return {
      timer: null,
      loading: false,
      interval: 10000,
      intervalList:
        [
          {
            text: '10 seconds',
            value: 10000
          },
          {
            text: '20 seconds',
            value: 20000
          },
          {
            text: '30 seconds',
            value: 30000
          },
          {
            text: '60 seconds',
            value: 60000
          },
        ],
      sysInfo: {},
      indicators: {},
    }
  },
  computed:
    {
      ...mapState(["activeOrg", "activeDevice"]),
      systemInformation() {
        const info = this.sysInfo;
        const flt = this.$options.filters;
        return [
          {
            name: 'Hostname',
            value: this.activeDevice.hostname
          },
          {
            name: 'Software version',
            value: info.version
          },
          {
            name: 'CPU threads',
            value: info.threads
          },
          {
            name: 'Datastore disk',
            value: info.datastore
          },
          {
            name: 'System memory',
            value: flt.traffic(info.memoryBytes)
          },
          {
            name: 'Total bytes saved',
            value: flt.traffic(info.savedBytes)
          },
          {
            name: 'Swap disk',
            value: flt.traffic(info.swapBytes)
          },
          {
            name: 'Uptime',
            value: flt.uptime(info.uptime)
          },
          {
            name: 'Platform',
            value: info.platform
          },
        ];
      }
    },
  watch:
    {
      interval() {
        if(this.timer) clearTimeout(this.timer);
        if(!this.loading) this.updateIndicators();
      },
    },
  created() {
    this.systemInfo();
  },
  beforeDestroy() {
    if(this.timer) clearTimeout(this.timer);
  },
  methods:
    {
      systemInfo() {
        WanosApi.getSystemInfo(this.activeOrg._id, this.activeDevice._id).then(response => {
          this.sysInfo = response;
        }).catch(err => {
          console.error(err);
        });
        this.updateIndicators();
      },
      updateIndicators() {
        this.loading = true;
        WanosApi.getIndicators(this.activeOrg._id, this.activeDevice._id).then(response => {
          this.loading = false;
          this.indicators = response;
          this.timer = setTimeout(() => {
            this.updateIndicators();
          },this.interval);
        }).catch(err => {
          this.loading = false;
          console.error(err);
          this.timer = setTimeout(() => {
            this.updateIndicators();
          },this.interval);
        });
      }
    }
}
</script>

<style>
  .indicator_panel
  {
    display: flex;
    flex-direction: column;
  }

</style>
