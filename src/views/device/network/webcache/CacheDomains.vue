<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-card class="elevation-3">
        <v-card-title class="pa-2 ">
          <h6 class="subheading">Top domains on {{ chosenPeriod }}</h6>
          <v-spacer/>
          <v-btn small flat icon class="ma-0"
                 @click.stop="showStats = !showStats">
            <v-icon>{{ showStats ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text v-if="showStats">
          <v-layout row wrap>
            <v-flex xs12 lg6>
              <pie-chart :segments="pieRequests" caption="Requests per domain" :counter="totalReqs + ' reqs'" :height="300"/>
            </v-flex>
            <v-flex xs12 lg6>
              <pie-chart :segments="pieBytes" caption="Megabytes per domain" :counter="totalBytesFilter" :height="300"/>
            </v-flex>
          </v-layout>
          <h3 style="margin-top: 12px;margin-bottom: 4px;">Number of domains: {{ domains.length }}</h3>
          <v-data-table :headers="headers" :items="sortedDomains" item-key="user" :pagination.sync="pagination"
                        :total-items="domains.length" hide-actions must-sort class="elevation-1 striped_table">
            <template slot="items" slot-scope="props">
              <tr align="center">
                <td align="left">
                  <v-tooltip right>
                    <span slot="activator" class="domain-tooltip">{{ props.item.domain }}</span>
                    <v-data-table :headers="headerTooltip" :items="props.item.userList.slice(0,10)" item-key="user" hide-actions class="domain-users">
                      <template slot="items" slot-scope="tips">
                        <tr align="center">
                          <td>{{ tips.item.user }}</td>
                          <td>{{ tips.item.requests }}</td>
                          <td>{{ tips.item.bytes | megabyte }} MB</td>
                        </tr>
                      </template>
                    </v-data-table>
                  </v-tooltip>
                </td>
                <td>{{ props.item.requests }} <span class="italic">({{ totalReqs ? (100 * props.item.requests / totalReqs).toFixed(2) : 0 }})</span></td>
                <td>{{ props.item.bytes | megabyte }} <span class="italic">({{ totalBytes ? (100 * props.item.bytes / totalBytes).toFixed(2) : 0 }})</span></td>
                <td>{{ props.item.duration | secondsTime }} <span class="italic">({{ totalDuration ? (100 * props.item.duration / totalDuration).toFixed(2) : 0 }})</span></td>
              </tr>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import PieChart from '@/components/base/pieChart'
import { mapState } from "vuex"
import { WanosApi } from '@/api/wanos.api'

export default
{
  name: 'CacheDomains',
  components:
    {
      PieChart
    },
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
      domains: [],
      pagination:
        {
          sortBy: 'bytes',
          descending: true
        },
      headers:
        [
          {
            text: 'URL',
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
        ],
      headerTooltip:
      [
        {
          text: 'User',
          align: 'center',
          class: 'font-weight-black',
          sortable: false
        },
        {
          text: 'Count',
          align: 'center',
          class: 'font-weight-black',
          sortable: false
        },
        {
          text: 'Size',
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
        return this.domains.reduce((acc, item) => {
          return acc + item.requests;
        }, 0);
      },
      totalBytes() {
        return this.domains.reduce((acc, item) => {
          return acc + item.bytes;
        }, 0);
      },
      totalBytesFilter() {
        return this.$options.filters.megabyte(this.totalBytes) + ' MB';
      },
      totalDuration() {
        return this.domains.reduce((acc, item) => {
          return acc + item.duration;
        }, 0);
      },
      sortedDomains() {
        // we want the rows to always be sorted in descending order
        // so we set the "total-items" prop of the data-table and
        // then watch "pagination" to detect on which column to sort
        const col = this.pagination.sortBy;
        return this.domains.slice().sort((a,b) => b[col] - a[col]);
      },
      pieRequests() {
        const total = this.totalReqs;
        const map = {};
        this.domains.forEach(item => {
          const domain = total && 100 * item.requests / total >= 2 ? item.domain : 'others';
          if(!map[domain]) map[domain] = item.requests;
          else if(domain === 'others') map[domain] += item.requests;
        });
        const result = [];
        for(let key in map) result.push({
          label: key,
          tooltip: map[key],
          percentage: total ? (100 * map[key] / total).toFixed(2) : 0,
        });
        return result;
      },
      pieBytes() {
        const total = this.totalBytes;
        const flt = this.$options.filters.megabyte;
        const map = {};
        this.domains.forEach(item => {
          const domain = total && 100 * item.bytes / total >= 2 ? item.domain : 'others';
          if(!map[domain]) map[domain] = item.bytes;
          else if(domain === 'others') map[domain] += item.bytes;
        });
        const result = [];
        for(let key in map) result.push({
          label: key,
          tooltip: flt(map[key]) + ' MB',
          percentage: total ? (100 * map[key] / total).toFixed(2) : 0,
        });
        return result;
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
          this.domains = await WanosApi.getWebcacheDomains(this.activeOrg._id, this.activeDevice._id, this.year, this.month, this.day, this.week,
            this.pagination.sortBy);
        } catch (e) {
          console.error(e);
        }
      }
    }
}
</script>

<style>
  .italic
  {
    font-style: italic;
  }

  .domain-tooltip
  {
    border-bottom: 1px dotted gray;
    cursor: grab;
  }

  .domain-users table.v-table tbody td
  {
    height: 24px;
  }

  .domain-users table.v-table thead tr
  {
    height: 32px;
  }
</style>
