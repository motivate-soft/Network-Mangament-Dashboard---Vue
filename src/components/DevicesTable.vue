<template>
  <span>
    <v-layout row wrap>
      <v-flex md3 >
        <v-text-field v-model="search" append-icon="search" label="Search" single-line hide-details clearable/>
      </v-flex>
      <v-flex md3 offset-md6>
        <v-select v-model="updateInterval" :items="updateIntervals" item-text="text" item-value="value"
                  label="Update Interval" hide-details return-object/>
      </v-flex>
    </v-layout>
    <v-data-table :headers="headers" :items="devicesStats" :rows-per-page-items="rowsPerPage"
                  :search="search" :pagination.sync="pagination" item-key="_id">
      <template slot="items" slot-scope="props">
        <tr>
          <td>
            <v-icon :color="deviceStatIconColor(props.item)">{{deviceStatIcon(props.item)}}</v-icon>
          </td>
          <td>{{ props.item.hostname }}</td>
          <td>
            <utilization-progress v-if="props.item.online" :value="props.item.stats.cpuLoad">{{ props.item.stats.cpuLoad }}</utilization-progress>
          </td>
          <td>
            <utilization-progress-used v-if="props.item.online" :used="props.item.stats.mem.used" :total="props.item.stats.mem.total"/>
          </td>
          <td>
            <template v-if="props.item.online">
              <utilization-progress v-for="fs in props.item.stats.fsList" :key="fs.fs" :value="fs.use"/>
            </template>
          </td>
          <td>
            <template v-if="props.item.online">
              {{ (props.item.stats.net.wanRxBps - ((stats[props.item._id] || {}).rx || 0)) * 8 / 5 | bandwidth }}
            </template>
          </td>
          <td>
            <template v-if="props.item.online">
              {{ (props.item.stats.net.wanTxBps - ((stats[props.item._id] || {}).tx || 0)) * 8 / 5 | bandwidth }}
            </template>
          </td>
          <td class="text-xs-right px-0">
            <v-tooltip top>
              <v-btn slot="activator" fab small color="primary" class="xsmall-button" @click.stop="changeDevice(props.item)">
                <v-icon>screen_share</v-icon>
              </v-btn>
              <span>Manage Device</span>
            </v-tooltip>
          </td>
        </tr>
      </template>
    </v-data-table>
  </span>
</template>

<style scoped>
.xsmall-button
{
  width: 30px;
  height: 30px;
}
</style>

<script>
import UtilizationProgress from "@/components/base/UtilizationProgress.vue";
import UtilizationProgressUsed from "@/components/base/UtilizationProgressUsed.vue";
import { mapState, mapActions, mapMutations } from "vuex";

export default {
  name: "DevicesTable",

  components: {
    UtilizationProgress,
    UtilizationProgressUsed
  },

  data() {
    return {
      pagination: { sortBy: "hostname" },
      headers: [
        {
          text: "Status",
          value: "online",
          class: "subheading",
          width: "10px"
        },
        {
          text: "Device",
          value: "hostname",
          class: "subheading",
          align: "left"
        },
        {
          text: "CPU",
          value: "stats.cpuLoad",
          class: "subheading"
        },
        {
          text: "Memory",
          value: "stats.mem.used",
          class: "subheading"
        },
        {
          text: "Disk",
          class: "subheading",
          sortable: false
        },
        {
          text: "WAN RX",
          value: "stats.net.wanRxBps",
          class: "subheading"
        },
        {
          text: "WAN TX",
          value: "stats.net.wanTxBps",
          class: "subheading"
        },
        {
          text: "Manage",
          class: ["subheading", "px-0"],
          align: "right",
          sortable: false
        },
      ],
      rowsPerPage: [
        {
          text: "$vuetify.dataIterator.rowsPerPageAll",
          value: -1
        }, 5, 10, 25],
      search: "",
      updateInterval: {
        text: "5 Seconds",
        value: 5000
      },
      updateIntervals: [
        {
          text: "5 Seconds",
          value: 5000
        },
        {
          text: "10 Seconds",
          value: 10000
        },
        {
          text: "15 Seconds",
          value: 15000
        },
        {
          text: "30 Seconds",
          value: 30000
        },
        {
          text: "1 Minute",
          value: 60000
        }
      ],
      stats: {},
    };
  },

  computed:
    {
      ...mapState(["activeOrg", "devicesStats", "devices"])
    },

  watch:
  {
    updateInterval: function() {
      // First clear the existing interval, then create new one
      clearInterval(this.intervalTimer);
      this.intervalTimer = setInterval(this.getIntervalStats, this.updateInterval.value);
    }
  },

  created() {
    if (this.activeOrg) {
      this.getDevicesStats(this.activeOrg._id);
    }
    this.unwatchActiveOrg = this.$store.watch(
      state => state.activeOrg,
      () => {
        this.getDevicesStats(this.activeOrg._id);
      }
    );

    this.intervalTimer = setInterval(this.getIntervalStats, this.updateInterval.value);
  },

  beforeDestroy() {
    this.unwatchActiveOrg();
    clearInterval(this.intervalTimer);
  },

  methods:
  {
    ...mapActions(["getDevicesStats"]),
    ...mapMutations(['setActiveDevice']),
    getIntervalStats() {
      // DeviceStats returns accumulated Rx/Tx bytes - so we need to calculate the diff between now and 5sec before to find the rate
      // save the current values
      this.devicesStats.forEach(dev => {
        this.stats[dev._id] = {
          rx: dev.stats.net.wanRxBps, // these are bytes - not bits
          tx: dev.stats.net.wanTxBps,
        };
      });
      this.getDevicesStats(this.activeOrg._id);
    },
    changeDevice(dev) {
      const device = this.devices.find(item => item._id === dev._id);
      if (device) {
        this.setActiveDevice(device);
        this.$router.push({name: 'deviceDashboard'});
      }
    },
    deviceStatIcon(deviceState) {
      return deviceState.online ? 'check_circle' : 'error';
    },
    deviceStatIconColor(deviceState) {
      if (!deviceState.online) return 'error';
      if (/unlicensed/i.test((deviceState.wanosLicense || '').trim() || 'unlicensed') || Object.values(deviceState.alert || {}).reduce((acc, value) => acc + Number(value), 0) > 0) return 'warning';
      return 'success';
    },
  },

};
</script>
