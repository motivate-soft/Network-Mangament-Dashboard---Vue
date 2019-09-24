<template>
  <v-layout column>
    <v-flex xs12>
      <v-card class="elevation-3">
        <v-card-title class="pa-2 ">
          <h6 class="subheading">Top 100 URL requests on {{ chosenPeriod }}</h6>
          <v-spacer/>
          <v-btn small flat icon class="ma-0"
                 @click.stop="showStats = !showStats">
            <v-icon>{{ showStats ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text v-if="showStats">
          <url-table :urls="urls" :sorted-by="sortedBy" @fetch="newSorting"/>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapState } from "vuex"
import { WanosApi } from '@/api/wanos.api'
import UrlTable from './UrlTable'

export default
{
  name: 'CacheUrls',
  components:
    {
      UrlTable
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
      urls: [],
      sortedBy: 'requests'
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
  mounted() {
    this.fetchData();
  },
  methods:
    {
      async fetchData() {
        if (this.year || this.month || this.day || this.week)
        try {
          this.urls = await WanosApi.getWebcacheUrls(this.activeOrg._id, this.activeDevice._id, this.year, this.month, this.day, this.week,
            this.sortedBy);
        } catch (e) {
          console.error(e);
        }
      },
      newSorting(col) {
        this.sortedBy = col;
        this.fetchData();
      }
    }
}
</script>
