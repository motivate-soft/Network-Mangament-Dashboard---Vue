<template>
  <v-container grid-list-lg fluid class="pt-2">
    <!-- filters -->
    <v-layout row wrap>
      <v-flex xs12>
        <v-card class="elevation-3">
          <v-card-title class="pa-2">
            <h6 class="subheading">Application Distribution</h6>
            <v-spacer/>
            <v-btn small flat icon class="ma-0" @click.stop="showFilters = !showFilters">
              <v-icon>{{ showFilters ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text v-if="showFilters">
            <v-container grid-list-lg class="pa-0">
              <v-layout row wrap justify-center align-center>
                <v-flex xs1>
                  <v-autocomplete v-model="current.top" :items="topSelector" label="Applications" hide-details/>
                </v-flex>
                <v-flex xs2>
                  <v-select v-model="current.period" :items="periods" label="Period" hide-details/>
                </v-flex>
                <v-flex xs2>
                  <v-select v-model="current.peer" :items="listPeers" label="Peer" hide-details item-text="hostname" item-value="ip"/>
                </v-flex>
                <v-flex xs1>
                  <v-btn color="primary" dark @click="fetchData">Submit</v-btn>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <!-- charts -->
    <v-layout row wrap fill-height>
      <v-flex xs12 lg6 grow class="apps_flex_grow">
        <v-card class="elevation-3">
          <v-card-title class="pa-2">
            <h6 class="subheading">Top applications: LAN</h6>
            <v-spacer/>
            <v-btn small flat icon class="ma-0" @click.stop="showChartLAN = !showChartLAN">
              <v-icon>{{ showChartLAN ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text v-if="showChartLAN" class="pa-2">
            <pie-chart :segments="pieLAN" :height="300"/>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12 lg6 grow class="apps_flex_grow">
        <v-card class="elevation-3">
          <v-card-title class="pa-2">
            <h6 class="subheading">Top applications: WAN</h6>
            <v-spacer/>
            <v-btn small flat icon class="ma-0" @click.stop="showChartWAN = !showChartWAN">
              <v-icon>{{ showChartWAN ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text v-if="showChartWAN" class="pa-2">
            <pie-chart :segments="pieWAN" :height="300"/>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <!-- details -->
    <v-layout row wrap>
      <v-flex xs12>
        <v-card class="elevation-3">
          <v-card-title class="pa-2">
            <h6 class="subheading">Details</h6>
            <v-spacer/>
            <v-btn small flat icon class="ma-0" @click.stop="showApplications = !showApplications">
              <v-icon>{{ showApplications ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text v-if="showApplications" class="elevation-0">
            <v-data-table :headers="headers" :items="applications" :pagination.sync="pagination" hide-actions must-sort class="striped_table">
              <template slot="items" slot-scope="props">
                <tr>
                  <td align="right">
                    <div class="app_color_flag" :style="{'background-color': props.item.color}"/>
                  </td>
                  <td>{{ props.item.application }}</td>
                  <td align="center">{{ props.item.percentageLan }}%</td>
                  <td align="center">{{ props.item.bytesLan | megabyte | maxDecimalPoints(1) | thousand }} MB</td>
                  <td>
                    <app-progress-linear :value="props.item.reduction"
                                         :text="props.item.reduction | maxDecimalPoints(1) + '%'"
                                         :height="18"
                                         :background-opacity="0"
                                         color="primary"
                    />
                  </td>
                  <td align="center">{{ props.item.bytesWan | megabyte | maxDecimalPoints(1) | thousand }} MB</td>
                  <td align="center">{{ props.item.percentageWan }}%</td>
                </tr>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState } from "vuex"
import { WanosApi } from '@/api/wanos.api'
import AppProgressLinear from "@/components/base/AppProgressLinear.vue"
import PieChart from '@/components/base/pieChart'
import { ColorSet } from "@amcharts/amcharts4/core"

export default
{
  name: 'TopApplications',
  components:
    {
      AppProgressLinear,
      PieChart,
    },
  data() {
    return {
      showFilters: true,
      showApplications: true,
      showChartLAN: true,
      showChartWAN: true,
      applications: [],
      topSelector:
        [
          {
            text: 'Top 1',
            value: 1
          },
          {
            text: 'Top 10',
            value: 10
          },
          {
            text: 'Top 20',
            value: 20
          },
          {
            text: 'Top 30',
            value: 30
          },
          {
            text: 'Top 40',
            value: 40
          },
        ],
      periods:
        [
          {
            text: 'Last 2 min',
            value: 120,
          },
          {
            text: 'Last 5 min',
            value: 300,
          },
          {
            text: 'Last 15 min',
            value: 900,
          },
          {
            text: 'Last 30 min',
            value: 1800,
          },
          {
            text: 'Last 60 min',
            value: 3600,
          },
          {
            text: 'Last 2 hours',
            value: 7200,
          },
          {
            text: 'Last 8 hours',
            value: 28800,
          },
          {
            text: 'Last 24 hours',
            value: 86400,
          },
        ],
      current:
        {
          peer: null,
          top: 10,
          period: 1800,
        },
      headers:
        [
          {
            text: '\xA0',
            align: 'center',
            class: 'subheading',
            sortable: false,
            width: '40px'
          },
          {
            text: 'Application',
            align: 'left',
            class: 'subheading',
            sortable: true,
            value: 'application',
          },
          {
            text: '% of LAN',
            align: 'center',
            class: 'subheading',
            sortable: true,
            value: 'percentageLan',
          },
          {
            text: 'LAN MB',
            align: 'center',
            class: 'subheading',
            sortable: true,
            value: 'bytesLan',
          },
          {
            text: 'Reduction',
            align: 'left',
            class: 'subheading',
            sortable: true,
            value: 'reduction',
          },
          {
            text: 'WAN MB',
            align: 'center',
            class: 'subheading',
            sortable: true,
            value: 'bytesWan',
          },
          {
            text: '% of WAN',
            align: 'center',
            class: 'subheading',
            sortable: true,
            value: 'percentageWan',
          },
        ],
      pagination:
        {
          sortBy: 'percentageLan',
          descending: true,
          rowsPerPage: -1,
        },
    };
  },
  computed:
    {
      ...mapState(["activeOrg", "activeDevice", "devices"]),
      listPeers () {
        return [
          {
            hostname: 'All',
            ip: null
          }
        ].concat(this.activeDevice.peersList.map(item => {
          return {
            hostname: item.hostname + ' (' + item.ip + ')',
            ip: item.ip
          }
        }));
      },
      totalLAN () {
        return this.applications.reduce((acc, item) => {
          return acc + item.bytesLan;
        }, 0);
      },
      totalWAN () {
        return this.applications.reduce((acc, item) => {
          return acc + item.bytesWan;
        }, 0);
      },
      totalLANProc () {
        return this.applications.reduce((acc, item) => {
          return acc + item.percentageLan;
        }, 0);
      },
      totalWANProc () {
        return this.applications.reduce((acc, item) => {
          return acc + item.percentageWan;
        }, 0);
      },
      pieLAN() {
        const flt = this.$options.filters.megabyte;
        const total = this.totalLANProc;
        const result = [];
        this.applications.forEach(item => {
          result.push({
            label: item.application,
            tooltip: flt(item.bytesLan) + ' MB',
            percentage: item.percentageLan.toFixed(1),
          });
        });
        if(total && total < 99.99) result.push({
          label: 'Others',
          tooltip: flt(this.totalLAN * (100 - total) / 100) + ' MB',
          percentage: 100 - total
        });
        return result;
      },
      pieWAN() {
        const flt = this.$options.filters.megabyte;
        const total = this.totalWANProc;
        const result = [];
        this.applications.forEach(item => {
          result.push({
            label: item.application,
            tooltip: flt(item.bytesWan) + ' MB',
            percentage: item.percentageWan.toFixed(1),
          });
        });
        if(total && total < 99.99) result.push({
          label: 'Others',
          tooltip: flt(this.totalWAN * (100 - total) / 100) + ' MB',
          percentage: 100 - total
        });
        return result;
      },
    },
  watch:
    {
      pagination:
        {
          deep: true,
          handler(newVal, oldVal) {
            if (newVal.sortBy !== oldVal.sortBy) this.pagination.descending = true;
          }
        },
    },
  mounted() {
    this.fetchData();
  },
  methods:
    {
      async fetchData() {
        try {
          const applications = await WanosApi.getTopApplications(this.activeOrg._id, this.activeDevice._id, this.current);
          const colorSet = new ColorSet();
          this.applications = applications.map(item => {
            item.color = colorSet.next();
            return item;
          });
        } catch (err) {
          console.error(err);
        }
      },
    }
}
</script>

<style>
  .apps_flex_grow
  {
    display: flex;
    flex-grow: 1;
  }

  .apps_flex_grow > *
  {
    flex-grow: 1;
  }

  .apps_flex_grow.flex_center
  {
    justify-content: space-around;
    align-items: center;
  }

  .app_color_flag
  {
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 2px;
    margin-bottom: -4px;
  }
</style>
