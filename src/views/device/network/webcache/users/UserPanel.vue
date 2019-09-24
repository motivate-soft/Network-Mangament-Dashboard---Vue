<template>
  <div>
    <h3>Number of users: {{ users.length }}</h3>
    <v-data-table ref="userList" :headers="headers" :items="sortedUsers" item-key="user" :pagination.sync="pagination"
                  :total-items="users.length" hide-actions must-sort class="elevation-1 striped_table">
      <template slot="items" slot-scope="props">
        <tr align="center">
          <td align="left" @click="doExpand(props)">
            <button type="button" class="row-expander blue--text darken-2">{{ props.item.user }}</button>
          </td>
          <td>{{ props.item.requests }} <span class="italic">({{ totalReqs ? (100 * props.item.requests / totalReqs).toFixed(2) : 0 }})</span></td>
          <td>{{ props.item.bytes | megabyte }} <span class="italic">({{ totalBytes ? (100 * props.item.bytes / totalBytes).toFixed(2) : 0 }})</span></td>
          <td>{{ props.item.duration | secondsTime }} <span class="italic">({{ totalDuration ? (100 * props.item.duration / totalDuration).toFixed(2) : 0 }})</span></td>
          <td>{{ props.item.largestFileBytes | megabyte }} MB</td>
          <td align="left">{{ props.item.largestFileUrl }}</td>
        </tr>
      </template>
      <template slot="expand" slot-scope="props">
        <v-layout row class="expander-margin">
          <v-flex xs12>
            <v-card v-if="props.item.urlList" class="elevation-3">
              <v-card-title class="pa-2 ">
                <h3>Statistics for {{ props.item.user }} on {{ periodName }}</h3>
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
                <url-table :urls="props.item.urlList" :sorted-by="detailSortedBy" @fetch="newSorting(props.item.user,...arguments)"/>
              </v-card-text>
            </v-card>
            <v-progress-circular v-else color="blue" indeterminate/>
          </v-flex>
        </v-layout>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { mapState } from "vuex"
import { WanosApi } from '@/api/wanos.api'
import UrlTable from '../urls/UrlTable'
import xyChart from "@/components/base/xyChart.vue"
import chartTicks from '@/plugins/mixinWebcache'

export default
{
  name: 'CacheUsersPanel',
  components:
    {
      UrlTable,
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
      users:
        {
          type: Array,
          default: () => []
        },
      periodName:
        {
          type: String,
          default: ''
        },
    },
  data() {
    return {
      detailSortedBy: 'bytes',
      pagination:
        {
          sortBy: 'bytes',
          descending: true
        },
      headers:
        [
          {
            text: 'User',
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
        ],
    }
  },
  computed:
    {
      ...mapState(["activeOrg", "activeDevice"]),
      totalReqs() {
        return this.users.reduce((acc, item) => {
          return acc + item.requests;
        }, 0);
      },
      totalBytes() {
        return this.users.reduce((acc, item) => {
          return acc + item.bytes;
        }, 0);
      },
      totalDuration() {
        return this.users.reduce((acc, item) => {
          return acc + item.duration;
        }, 0);
      },
      sortedUsers() {
        // we want the rows to always be sorted in descending order
        // so we set the "total-items" prop of the data-table and
        // then watch "pagination" to detect on which column to sort
        const col = this.pagination.sortBy;
        return this.users.slice().sort((a,b) => b[col] - a[col]);
      },
    },
  watch:
    {
      pagination:
        {
          handler(newVal, oldVal) {
            this.pagination.descending = true;
            if(!oldVal.descending || oldVal.sortBy !== newVal.sortBy) this.$emit('fetch',newVal.sortBy); // avoid needless API calls
          },
          deep: true
        },
      year() {
        this.updateExpanded();
      },
      month() {
        this.updateExpanded();
      },
      day() {
        this.updateExpanded();
      },
      week() {
        this.updateExpanded();
      }
    },
  methods:
    {
      updateExpanded() {
        const tbl = this.$refs.userList;
        if(tbl) {
          const expandedRows = tbl.expanded;
          for(let user in expandedRows) {
            if (expandedRows[user]) {
              this.fetchDetails(user);
              break;
            }
          }
        }
      },
      newSorting(user,col) {
        this.detailSortedBy = col;
        this.fetchDetails(user);
      },
      async doExpand(row) {
        row.expanded = !row.expanded;
        // if we expand a user row and we have not fetched the user details yet - go get them
        if(row.expanded && !row.item.urlList) this.fetchDetails(row.item.user);
      },
      async fetchDetails(user) {
        try {
          // get the detailed usage statistics for the given User
          const resp = await WanosApi.getWebcacheUserDetails(this.activeOrg._id, this.activeDevice._id, this.year, this.month, this.day, this.week,
            user, this.detailSortedBy);
          this.$emit('detail',user,resp);
        } catch (e) {
          console.error(e);
        }
      },
      seriesRequests(row) {
        return [
          {
            name: this.kind + " requests for " + row.user,
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
            name: this.kind + " Megabytes for " + row.user,
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
    }
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
