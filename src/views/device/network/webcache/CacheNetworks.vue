<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-card class="elevation-3">
        <v-card-title class="pa-2 ">
          <h6 class="subheading">Network Statistics on {{ chosenPeriod }}</h6>
          <v-spacer/>
          <v-btn small flat icon class="ma-0"
                 @click.stop="showStats = !showStats">
            <v-icon>{{ showStats ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text v-if="showStats">
          <h3>Number of networks: {{ networks.length }}</h3>
          <v-data-table ref="networkList" :headers="headers" :items="sortedNetworks" item-key="network" :pagination.sync="pagination"
                        :total-items="networks.length" hide-actions must-sort class="elevation-1 striped_table">
            <template slot="items" slot-scope="props">
              <tr align="center">
                <td align="left" @click="doExpand(props)">
                  <button type="button" class="row-expander blue--text darken-2">{{ props.item.network }}</button>
                </td>
                <td>{{ props.item.requests }} <span class="italic">({{ totalReqs ? (100 * props.item.requests / totalReqs).toFixed(2) : 0 }})</span></td>
                <td>{{ props.item.bytes | megabyte }} <span class="italic">({{ totalBytes ? (100 * props.item.bytes / totalBytes).toFixed(2) : 0 }})</span></td>
                <td>{{ props.item.duration | secondsTime }} <span class="italic">({{ totalDuration ? (100 * props.item.duration / totalDuration).toFixed(2) : 0 }})</span></td>
                <td>{{ props.item.users }}</td>
                <td>{{ props.item.largestFileBytes | megabyte }} MB</td>
                <td align="left">{{ props.item.largestFileUrl }}</td>
              </tr>
            </template>
            <template slot="expand" slot-scope="props">
              <v-layout row class="expander-margin">
                <v-flex xs12>
                  <v-card v-if="props.item.userList" class="elevation-3">
                    <v-card-title class="pa-2 ">
                      <h3>Statistics for {{ props.item.network }} on {{ chosenPeriod }}</h3>
                    </v-card-title>
                    <v-card-text>
                      <v-layout row wrap>
                        <v-flex xs12 lg6>
                          <xy-chart :series="seriesRequests(props.item)" :points="dataRequests(props.item)" :height="300"
                                    caption="Requests statistics"/>
                        </v-flex>
                        <v-flex xs12 lg6>
                          <xy-chart :series="seriesBytes(props.item)" :points="dataBytes(props.item)" :height="300"
                                    caption="Megabytes statistics"/>
                        </v-flex>
                      </v-layout>
                      <user-detail :users="props.item.userList" :period-name="chosenPeriod" :year="year" :month="month"
                                   :day="day" :week="week" :key="props.item.network" @fetch="newSorting(props.item.network,...arguments)"
                                   @detail="updateUser(props.item.network,...arguments)"/>
                    </v-card-text>
                  </v-card>
                  <v-progress-circular v-else color="blue" indeterminate/>
                </v-flex>
              </v-layout>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapState } from "vuex"
import { WanosApi } from '@/api/wanos.api'
import UserDetail from './users/UserPanel'
import xyChart from "@/components/base/xyChart.vue"
import chartTicks from '@/plugins/mixinWebcache'

export default
{
  name: 'CacheNetworks',
  components:
    {
      UserDetail,
      xyChart
    },
  mixins: [chartTicks],
  props:
    {
      year:
        {
          type: Number,
          default: 0
        },
      month:
        {
          type: Number,
          default: 0
        },
      day:
        {
          type: Number,
          default: 0
        },
      week:
        {
          type: Number,
          default: 0
        },
    },
  data() {
    return {
      showStats: true,
      networks: [],
      userSortBy: 'bytes',
      pagination:
        {
          sortBy: 'bytes',
          descending: true
        },
      headers:
        [
          {
            text: 'Network',
            align: 'left',
            class: 'font-weight-black',
            sortable: false
          },
          {
            text: 'Requests (%)',
            align: 'center',
            class: 'font-weight-black',
            value: 'requests',
            sortable: true
          },
          {
            text: 'Megabytes (%)',
            align: 'center',
            class: 'font-weight-black',
            value: 'bytes',
            sortable: true
          },
          {
            text: 'Duration (%)',
            align: 'center',
            class: 'font-weight-black',
            value: 'duration',
            sortable: true
          },
          {
            text: 'Users',
            align: 'center',
            class: 'font-weight-black',
            value: 'users',
            sortable: true
          },
          {
            text: 'Largest',
            align: 'center',
            class: 'font-weight-black',
            value: 'largest',
            sortable: true
          },
          {
            text: 'URL',
            align: 'center',
            class: 'font-weight-black',
            sortable: false
          },
        ]
    }
  },
  computed:
    {
      ...mapState(["activeOrg", "activeDevice"]),
      chosenPeriod() {
        if(!this.year) return '';
        if(this.month) {
          return this.year + '-' + (this.month < 10 ? '0' : '') + this.month
            + (this.day ? '-' + (this.day < 10 ? '0' : '') + this.day : '');
        } else if(this.week) {
          return this.year + ' Week ' + this.week;
        } else return String(this.year);
      },
      totalReqs() {
        return this.networks.reduce((acc, item) => {
          return acc + item.requests;
        }, 0);
      },
      totalBytes() {
        return this.networks.reduce((acc, item) => {
          return acc + item.bytes;
        }, 0);
      },
      totalDuration() {
        return this.networks.reduce((acc, item) => {
          return acc + item.duration;
        }, 0);
      },
      sortedNetworks() {
        // we want the rows to always be sorted in descending order
        // so we set the "total-items" prop of the data-table and
        // then watch "pagination" to detect on which column to sort
        const col = this.pagination.sortBy;
        return this.networks.slice().sort((a,b) => b[col] - a[col]);
      },
    },
  watch:
    {
      year() {
        this.fetchData();
      },
      month() {
        this.fetchData();
      },
      day() {
        this.fetchData();
      },
      week() {
        this.fetchData();
      },
      pagination:
        {
          handler(newVal, oldVal) {
            this.pagination.descending = true;
            if(!oldVal.descending || oldVal.sortBy !== newVal.sortBy) this.fetchData(); // avoid needless API calls
          },
          deep: true
        },
    },
  mounted() {
    this.fetchData();
  },
  methods:
    {
      async fetchData() {
        if (this.year || this.month || this.day || this.week)
        try {
          const networks = await WanosApi.getWebcacheNetworks(this.activeOrg._id, this.activeDevice._id, this.year, this.month, this.day, this.week,
            this.pagination.sortBy);
          this.networks = networks.map(item => {
            item.largest = item.largestFileBytes;
            return item;
          });
          this.updateExpanded();
        } catch (e) {
          console.error(e);
        }
      },
      async fetchDetails(network) {
        try {
          // get the detailed usage statistics for the given Network
          const resp = await WanosApi.getWebcacheNetworkDetails(this.activeOrg._id, this.activeDevice._id, this.year, this.month, this.day, this.week,
            network, this.userSortBy);
          const found = this.networks.find(item => item.network === network);
          if(found) {
            this.$set(found, 'userList', resp.userList);
            this.$set(found, 'periodList', resp.periodList);
          }
        } catch (e) {
          console.error(e);
        }
      },
      newSorting(network,col) {
        this.userSortBy = col;
        this.fetchDetails(network);
      },
      updateExpanded() {
        const tbl = this.$refs.networkList;
        if(tbl) {
          const expandedRows = tbl.expanded;
          for(let network in expandedRows) {
            if (expandedRows[network]) {
              this.fetchDetails(network);
              break;
            }
          }
        }
      },
      async doExpand(row) {
        row.expanded = !row.expanded;
        // if we expand a network row and we have not fetched the network details yet - go get them
        if(row.expanded && !row.item.userList) this.fetchDetails(row.item.network);
      },
      updateUser(network,user,details) {
        const net = this.networks.find(item => item.network === network);
        if(net && net.userList) {
          const found = net.userList.find(item => item.user === user);
          if(found) {
            this.$set(found, 'urlList', details.urlList);
            this.$set(found, 'periodList', details.periodList);
          }
        }
      },
      seriesRequests(row) {
        return [
          {
            name: this.kind + " requests for " + row.network,
            valueField: "requests",
            tooltipText: "{valueY} reqs",
            numberFormat: "#.",
            fillColor: "#6e9dc9",
            strokeColor: "#6e9dc9",
            //fillOpacity: 0.6,
          },
        ];
      },
      dataRequests(row) {
        // data points for the Requests chart
        const periods = row.periodList || [];
        return this.ticks.map((item, idx) => {
          const data = periods.find(p => p.period === idx + 1);
          return {
            period: item,
            requests: data ? data.requests : 0,
          };
        });
      },
      seriesBytes(row) {
        return [
          {
            name: this.kind + " Megabytes for " + row.network,
            valueField: "bytes",
            tooltipText: "{valueY} MB",
            numberFormat: "#.",
            fillColor: "#6e9dc9",
            strokeColor: "#6e9dc9",
            //fillOpacity: 0.6,
          },
        ];
      },
      dataBytes(row) {
        // data points for the Megabytes chart
        const periods = row.periodList || [];
        const filter = this.$options.filters.megabyte;
        return this.ticks.map((item, idx) => {
          const data = periods.find(p => p.period === idx + 1);
          return {
            period: item,
            bytes: data ? filter(data.bytes) + ' MB' : 0,
          };
        });
      }
    },
}
</script>

<style>
  .italic
  {
    font-style: italic;
  }

  .row-expander
  {
    border: none;
    border-radius: 0;
    outline: none;
  }

  .expander-margin
  {
    margin: 4px !important;
  }
</style>
