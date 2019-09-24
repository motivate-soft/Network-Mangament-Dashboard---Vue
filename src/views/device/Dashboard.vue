<template>
  <v-container grid-list-md fluid class="pt-2">
    <v-layout row wrap>
      <v-flex xs12>
        <h3>Dashboard - <span class="primary--text">{{ activeDevice.hostname }}</span></h3>
      </v-flex>
    </v-layout>
    <v-layout row wrap>
      <v-flex xs12>
        <v-card>
          <v-card-text class="pa-2">
            <v-layout row wrap>
              <v-flex md3>
                <v-select v-model="selectedPeer"
                          :items="peers"
                          return-object
                          item-text="label"
                          item-value="output"
                          label="Graph"
                          hide-details/>
              </v-flex>
              <v-flex md3>
                <v-select v-model="updateInterval"
                          :items="updateIntervals"
                          item-text="label"
                          item-value="value"
                          label="Update Interval"
                          hide-details/>
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12 lg6>
        <v-card>
          <v-card-title class="pa-2">
            <h3>Optimized Mbps : Wan Tx</h3>
          </v-card-title>
          <v-card-text class="pa-2">
            <interval-line-chart :interval-data="intervalData"
                                 :series="optimizedWanTx"
                                 :reset="selectedPeer.output"/>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12 lg6>
        <v-card>
          <v-card-title class="pa-2">
            <h3>Optimized Mbps : Wan Rx</h3>
          </v-card-title>
          <v-card-text class="pa-2">
            <interval-line-chart :interval-data="intervalData"
                                 :series="optimizedWanRx"
                                 :reset="selectedPeer.output"/>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12 lg6>
        <v-card>
          <v-card-title class="pa-2">
            <h3>Ratio</h3>
          </v-card-title>
          <v-card-text class="pa-2">
            <interval-line-chart :interval-data="intervalData"
                                 :series="ratio"
                                 :reset="selectedPeer.output"/>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12 lg6>
        <v-card v-if="selectedPeer.output === null" key="total">
          <v-card-title class="pa-2">
            <h3>Pass-Through Mbps</h3>
          </v-card-title>
          <v-card-text class="pa-2">
            <interval-line-chart :interval-data="intervalData"
                                 :series="bypassTraffic"
                                 :reset="selectedPeer.output"/>
          </v-card-text>
        </v-card>
        <v-card v-else key="peer">
          <v-card-title class="pa-2">
            <h3>Loss Recovery & Round Trip Time</h3>
          </v-card-title>
          <v-card-text class="pa-2">
            <interval-line-chart :interval-data="intervalData"
                                 :series="lossRtt"
                                 :reset="selectedPeer.output"/>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout row wrap>
      <v-flex xs12>
        <v-card>
          <v-card-title class="pa-2">
            <h3>Protocols: <span class="primary--text">{{ selectedPeer.label }}</span></h3>
          </v-card-title>
          <v-card-text class="pa-2">
            <top-protocols :chart-data="topProtocols"/>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<style scoped>
</style>

<script>
import { mapState } from "vuex";
import { WanosApi } from "@/api/wanos.api";
import IntervalLineChart from "@/components/base/IntervalLineChart.vue";
import TopProtocols from "@/components/TopProtocols.vue";

export default {
  name: "DeviceDashboard",

  components: {
    IntervalLineChart,
    TopProtocols
  },

  data() {
    return {
      optimizedWanTx: [
        {
          name: "From Lan",
          valueField: "opLanRx",
          defaultValue: 0,
          tooltipText: "{valueY}",
          numberFormat: "#.00",
          fillColor: "#74C846",
          strokeColor: "#74C846",
          fillOpacity: 0.3
        },
        {
          name: "To Wan",
          valueField: "opWanTx",
          defaultValue: 0,
          tooltipText: "{valueY}",
          numberFormat: "#.00",
          fillColor: "#6365B7",
          strokeColor: "#6365B7",
          fillOpacity: 0.3
        }
      ],
      optimizedWanRx: [
        {
          name: "From Wan",
          valueField: "opWanRx",
          defaultValue: 0,
          tooltipText: "{valueY}",
          numberFormat: "#.00",
          fillColor: "#6365B7",
          strokeColor: "#6365B7",
          fillOpacity: 0.3
        },
        {
          name: "To Lan",
          valueField: "opLanTx",
          defaultValue: 0,
          tooltipText: "{valueY}",
          numberFormat: "#.00",
          fillColor: "#74C846",
          strokeColor: "#74C846",
          fillOpacity: 0.3
        }
      ],
      bypassTraffic: [
        {
          name: "Wan Rx",
          valueField: "bpWanRx",
          defaultValue: 0,
          tooltipText: "{valueY}",
          numberFormat: "#.00",
          fillColor: "#74C846",
          strokeColor: "#74C846",
          fillOpacity: 0.3
        },
        {
          name: "Wan Tx",
          valueField: "bpWanTx",
          defaultValue: 0,
          tooltipText: "{valueY}",
          numberFormat: "#.00",
          fillColor: "#6365B7",
          strokeColor: "#6365B7",
          fillOpacity: 0.3
        }
      ],
      lossRtt: [
        {
          name: "Loss Recovery",
          valueField: "loss",
          defaultValue: 0,
          tooltipText: "{valueY}",
          numberFormat: "#.00",
          fillColor: "#74C846",
          strokeColor: "#74C846",
          fillOpacity: 0.3
        },
        {
          name: "Latency RTT ms",
          valueField: "rtt",
          defaultValue: 0,
          tooltipText: "{valueY}",
          numberFormat: "#.00",
          fillColor: "#6365B7",
          strokeColor: "#6365B7",
          fillOpacity: 0.3
        }
      ],
      ratio: [
        {
          name: "Wan Rx",
          valueField: "ratioWanRx",
          defaultValue: 1,
          tooltipText: "{valueY}",
          numberFormat: "#.00",
          fillColor: "#74C846",
          strokeColor: "#74C846",
          fillOpacity: 0.3
        },
        {
          name: "Wan Tx",
          valueField: "ratioWanTx",
          defaultValue: 1,
          tooltipText: "{valueY}",
          numberFormat: "#.00",
          fillColor: "#6365B7",
          strokeColor: "#6365B7",
          fillOpacity: 0.3
        }
      ],
      updateIntervals: [
        {
          label: "3 Seconds",
          value: 3000
        },
        {
          label: "10 Seconds",
          value: 10000
        },
        {
          label: "30 Seconds",
          value: 30000
        }
      ],
      selectedPeer:
        {
          hostname: "Total",
          output: null,
          ip: null,
          label: "Total"
        },
      updateInterval: 3000,
      intervalData: null,
      topProtocols: []
    };
  },

  computed:
  {
    ...mapState(["activeOrg", "activeDevice"]),
    peers: function() {
      let totalOption = {
        hostname: "Total",
        output: null,
        ip: null
      };
      return [totalOption].concat(this.activeDevice.peersList || []).map(x => {
        x.label = x.output !== null ? x.hostname + " (" + x.ip + ")" : x.hostname;
        return x;
      });
    }
  },

  watch:
  {
    updateInterval: function() {
      this.intervalState.ts = null;
      // First clear the existing interval, then create new one
      clearInterval(this.intervalTimer);
      this.intervalTimer = setInterval(this.getIntervalStats, this.updateInterval);
    },
    selectedPeer: function() {
      this.intervalState.ts = null;
      this.getTopProtocols();
    }
  },

  created() {
    this.intervalState = {
      ts: null,
      opWanTxBytes: 0,
      opLanRxBytes: 0,
      opWanRxBytes: 0,
      opLanTxBytes: 0,
      bpWanRxBytes: 0,
      bpWanTxBytes: 0,
      loss: 0,
      rtt: 0
    };
  },

  mounted() {
    this.intervalTimer = setInterval(this.getIntervalStats, this.updateInterval);
    this.getTopProtocols();
  },

  beforeDestroy() {
    clearInterval(this.intervalTimer);
  },

  methods:
  {
    getTopProtocols() {
      WanosApi.getDeviceDashboardTopProtocols(this.activeOrg._id, this.activeDevice._id, this.selectedPeer.ip).then(
        result => {
          let filteredResult = [];
          if (result) {
            for (let x of result) {
              if (x.lanBytes <= 0) {
                continue;
              }
              let optimization = x.lanBytes > 0 ? ((x.lanBytes - x.wanBytes) / x.lanBytes) * 100 : 0;
              x.optimization = optimization > 0 ? optimization : 0;
              filteredResult.push(x);
            }
          }
          this.topProtocols = filteredResult;
        }
      );
    },

    getIntervalStats() {
      WanosApi.getDeviceDashboardStats(this.activeOrg._id, this.activeDevice._id, this.selectedPeer.output).then(result => {
        this.parseIntervalStats(result);
      });
    },

    parseIntervalStats(data) {
      if (!this.intervalState.ts) {
        this.intervalState = JSON.parse(JSON.stringify(data));
        this.intervalState.bpWanTxBytes = data.bpWanTxBytes - data.opWanTxBytes;
        return;
      }
      let intervalSeconds = data.ts - this.intervalState.ts;
      let opWanTxDiff = data.opWanTxBytes - this.intervalState.opWanTxBytes;
      let opLanRxDiff = data.opLanRxBytes - this.intervalState.opLanRxBytes;
      let opWanRxDiff = data.opWanRxBytes - this.intervalState.opWanRxBytes;
      let opLanTxDiff = data.opLanTxBytes - this.intervalState.opLanTxBytes;
      let bpWanRxDiff = data.bpWanRxBytes - this.intervalState.bpWanRxBytes;
      let bpWanTxDiff = data.bpWanTxBytes - data.opWanTxBytes - this.intervalState.bpWanTxBytes;
      let lossDiff = data.loss - this.intervalState.loss;

      if (opWanTxDiff < 0) opWanTxDiff = 0;
      if (opLanRxDiff < 0) opLanRxDiff = 0;
      if (opWanRxDiff < 0) opWanRxDiff = 0;
      if (opLanTxDiff < 0) opLanTxDiff = 0;
      if (bpWanRxDiff < 0) bpWanRxDiff = 0;
      if (bpWanTxDiff < 0) bpWanTxDiff = 0;
      if (lossDiff < 0) lossDiff = 0;

      let ratioWanRx = opWanRxDiff > 0 && opLanTxDiff > 0 ? opLanTxDiff / opWanRxDiff : 1;
      let ratioWanTx = opWanTxDiff > 0 && opLanRxDiff > 0 ? opLanRxDiff / opWanTxDiff : 1;

      let intervalData = {
        opWanTx: (opWanTxDiff / intervalSeconds / 125000).toFixed(2),
        opLanRx: (opLanRxDiff / intervalSeconds / 125000).toFixed(2),
        opWanRx: (opWanRxDiff / intervalSeconds / 125000).toFixed(2),
        opLanTx: (opLanTxDiff / intervalSeconds / 125000).toFixed(2),
        bpWanRx: (bpWanRxDiff / intervalSeconds / 125000).toFixed(2),
        bpWanTx: (bpWanTxDiff / intervalSeconds / 125000).toFixed(2),
        ratioWanRx: ratioWanRx,
        ratioWanTx: ratioWanTx,
        loss: lossDiff,
        rtt: data.rtt
      };

      this.intervalState = JSON.parse(JSON.stringify(data));
      this.intervalState.bpWanTxBytes = data.bpWanTxBytes - data.opWanTxBytes;
      this.intervalData = intervalData;
    }
  },

};
</script>
