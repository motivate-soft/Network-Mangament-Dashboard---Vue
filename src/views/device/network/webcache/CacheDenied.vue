<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-card class="elevation-3">
        <v-card-title class="pa-2 ">
          <h6 class="subheading">Top 100 denied URL on {{ chosenPeriod }}</h6>
          <v-spacer/>
          <v-btn small flat icon class="ma-0"
                 @click.stop="showStats = !showStats">
            <v-icon>{{ showStats ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text v-if="showStats">
          <h3>Number of URLs: {{ denied.length }}</h3>
          <v-data-table :headers="headers" :items="denied" item-key="url" hide-actions class="elevation-1 striped_table">
            <template slot="items" slot-scope="props">
              <tr align="center">
                <td align="left">
                  <a :href="'http://' + props.item.url" target="_blank">{{ props.item.url }}</a>
                </td>
                <td>{{ props.item.requests }} <span class="italic">({{ totalReqs ? (100 * props.item.requests / totalReqs).toFixed(2) : 0 }})</span></td>
                <td>{{ props.item.blacklistAclList.join(', ') }}</td>
              </tr>
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

export default
{
  name: 'CacheDenied',
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
      denied: [],
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
            sortable: false
          },
          {
            text: 'Blacklisted ACLs',
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
        return this.denied.reduce((acc, item) => {
          return acc + item.requests;
        }, 0);
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
    },
  methods:
    {
      async fetchData() {
        if (this.year || this.month || this.day || this.week)
        try {
          this.denied = await WanosApi.getWebcacheDenied(this.activeOrg._id, this.activeDevice._id, this.year, this.month, this.day, this.week);
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
</style>
