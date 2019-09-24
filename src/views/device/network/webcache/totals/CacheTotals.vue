<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-card class="elevation-3">
        <v-card-title class="pa-2 ">
          <h3 class="subheading">Cache Statistics on {{ chosenPeriod }}</h3>
          <v-spacer/>
          <v-btn small flat icon class="ma-0"
                 @click.stop="showStats = !showStats">
            <v-icon>{{ showStats ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text v-if="showStats">
          <v-data-table :headers="headers" :items="totalData" item-key="_id" hide-actions class="elevation-1 table-totals striped_table">
            <template slot="items" slot-scope="props">
              <tr align="center">
                <td>{{ props.item.hits }}</td>
                <td>{{ props.item.misses }}</td>
                <td>{{ props.item.denied }}</td>
                <td>{{ props.item.hitsBytes | megabyte }}</td>
                <td>{{ props.item.missesBytes | megabyte }}</td>
                <td>{{ props.item.deniedBytes | megabyte }}</td>
                <td>{{ props.item.totalReqs }}</td>
                <td>{{ props.item.totalBytes | megabyte }}</td>
                <td>{{ props.item.users }}</td>
                <td>{{ props.item.sites }}</td>
                <td>{{ props.item.domains }}</td>
              </tr>
            </template>
          </v-data-table>
          <!-- first row of charts -->
          <v-layout row wrap fill-height>
            <v-flex xs12 lg6 grow class="totals_flex_grow">
              <v-card class="elevation-3">
                <v-card-title class="pa-2 ">
                  <h3>{{ kind }} Requests statistics on {{ chosenPeriod }}</h3>
                  <v-spacer/>
                  <v-btn small flat icon class="ma-0"
                         @click.stop="showReqs = !showReqs">
                    <v-icon>{{ showReqs ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</v-icon>
                  </v-btn>
                </v-card-title>
                <v-card-text v-if="showReqs" class="pa-2">
                  <chart-requests :points="dataRequests"/>
                </v-card-text>
              </v-card>
            </v-flex>
            <v-flex xs12 lg6 grow class="totals_flex_grow">
              <v-card class="elevation-3">
                <v-card-title class="pa-2 ">
                  <h3>{{ kind }} Megabytes statistics on {{ chosenPeriod }}</h3>
                  <v-spacer/>
                  <v-btn small flat icon class="ma-0"
                         @click.stop="showBytes = !showBytes">
                    <v-icon>{{ showBytes ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</v-icon>
                  </v-btn>
                </v-card-title>
                <v-card-text v-if="showBytes" class="pa-2">
                  <chart-bytes :points="dataBytes"/>
                </v-card-text>
              </v-card>
            </v-flex>
            <!-- second row -->
            <v-flex xs12 lg6 grow class="totals_flex_grow">
              <v-card class="elevation-3 totals_flex_col">
                <v-card-title class="pa-2 ">
                  <h3>Overall Hits Ratio</h3>
                  <v-spacer/>
                  <v-btn small flat icon class="ma-0"
                         @click.stop="showOverall = !showOverall">
                    <v-icon>{{ showOverall ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</v-icon>
                  </v-btn>
                </v-card-title>
                <v-card-text v-if="showOverall" class="pa-2 totals_flex_grow flex_center">
                  <v-flex xs6 grow style="text-align: center">
                    <h4 class="pa-2">Requests</h4>
                    <chart-radial :value="totalData[0].totalReqs ? Math.round(100 * totalData[0].hits / totalData[0].totalReqs) : 0"
                                  :size="100" :width="8"
                                  :range1-color="'#8D6E63'" :range1-max="20"
                                  :range2-color="'#FF5722'" :range2-max="40"
                                  :range3-color="'#FFC107'" :range3-max="80"
                                  :range4-color="'#4CAF50'" percent/>
                  </v-flex>
                  <v-flex xs6 grow style="text-align: center">
                    <h4 class="pa-2">Megabytes</h4>
                    <chart-radial :value="totalData[0].totalBytes ? Math.round(100 * totalData[0].hitsBytes / totalData[0].totalBytes) : 0"
                                  :size="100" :width="8"
                                  :range1-color="'#8D6E63'" :range1-max="20"
                                  :range2-color="'#FF5722'" :range2-max="40"
                                  :range3-color="'#FFC107'" :range3-max="80"
                                  :range4-color="'#4CAF50'" percent/>
                  </v-flex>
                </v-card-text>
              </v-card>
            </v-flex>

          </v-layout>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import ChartRequests from './ChartRequests'
import ChartBytes from './ChartBytes'
import ChartRadial from '@/components/base/UtilizationProgress'
import { mapState } from "vuex"
import { WanosApi } from '@/api/wanos.api'
import chartTicks from '@/plugins/mixinWebcache'

export default
{
  name: 'CacheTotals',
  components:
    {
      ChartRequests,
      ChartBytes,
      ChartRadial
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
      showReqs: true,
      showBytes: true,
      showThroughput: true,
      showOverall: true,
      totals: {},
      headers:
      [
        {
          text: 'Hit reqs',
          align: 'center',
          class: 'font-weight-black',
          sortable: false
        },
        {
          text: 'Miss reqs',
          align: 'center',
          class: 'font-weight-black',
          sortable: false
        },
        {
          text: 'Denied reqs',
          align: 'center',
          class: 'font-weight-black',
          sortable: false
        },
        {
          text: 'Hit MB',
          align: 'center',
          class: 'font-weight-black',
          sortable: false
        },
        {
          text: 'Miss MB',
          align: 'center',
          class: 'font-weight-black',
          sortable: false
        },
        {
          text: 'Denied MB',
          align: 'center',
          class: 'font-weight-black',
          sortable: false
        },
        {
          text: 'Total reqs',
          align: 'center',
          class: 'font-weight-black',
          sortable: false
        },
        {
          text: 'Total MB',
          align: 'center',
          class: 'font-weight-black',
          sortable: false
        },
        {
          text: 'Users',
          align: 'center',
          class: 'font-weight-black',
          sortable: false
        },
        {
          text: 'Sites',
          align: 'center',
          class: 'font-weight-black',
          sortable: false
        },
        {
          text: 'Domains',
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
        } else return this.year;
      },
      totalData() {
        const data = this.totals;
        return [{
          hits: data.hits || 0,
          misses: data.misses || 0,
          denied: data.denied || 0,
          hitsBytes: data.hitsBytes || 0,
          missesBytes: data.missesBytes || 0,
          deniedBytes: data.deniedBytes || 0,
          totalReqs: (data.hits || 0) + (data.misses || 0) + (data.denied || 0),
          totalBytes: (data.hitsBytes || 0) + (data.missesBytes || 0) + (data.deniedBytes || 0),
          throughput: data.throughput || 0,
          users: data.users || 0,
          sites: data.sites || 0,
          domains: data.domains || 0,
        }];
      },
      dataRequests() {
        const periods = this.totals.periodList || [];
        return this.ticks.map((item, idx) => {
          const data = periods.find(p => p.period === idx + 1);
          return {
            period: item,
            hits: data ? data.hits : 0,
            misses: data ?data.misses : 0,
            denied: data ? data.denied : 0,
            total: data ? data.hits + data.misses + data.denied : 0
          };
        });
      },
      dataBytes() {
        const periods = this.totals.periodList || [];
        const filterMB = this.$options.filters.megabyte;
        return this.ticks.map((item, idx) => {
          const data = periods.find(p => p.period === idx + 1);
          return {
            period: item,
            hits: data ? filterMB(data.hitsBytes) : 0,
            misses: data ? filterMB(data.missesBytes) : 0,
            denied: data ? filterMB(data.deniedBytes) : 0,
            total: data ? filterMB(data.hitsBytes + data.missesBytes + data.deniedBytes) : 0
          };
        });
      },
      dataThroughput() {
        return [];
      }
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
      }
    },
  mounted() {
    this.fetchData();
  },
  methods:
    {
      async fetchData() {
        if (this.year || this.month || this.day || this.week)
        try {
          this.totals = await WanosApi.getWebcacheTotals(this.activeOrg._id, this.activeDevice._id, this.year, this.month, this.day, this.week);
        } catch (e) {
          console.error(e);
        }
      }
    }
}
</script>

<style>
  .table-totals table.v-table thead th
  {
    white-space: normal;
  }

  .totals_flex_grow
  {
    display: flex;
    flex-grow: 1;
  }

  .totals_flex_grow > *
  {
    flex-grow: 1;
  }

  .totals_flex_grow.flex_center
  {
    justify-content: space-around;
    align-items: center;
  }

  .v-sheet.totals_flex_col
  {
    display: flex;
    flex-direction: column;
  }
</style>
