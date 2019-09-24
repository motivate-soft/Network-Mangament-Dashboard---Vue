<template>
  <v-container grid-list-lg fluid class="pt-2">
    <v-layout row wrap>
      <v-flex xs12>
        <v-tabs v-model="curTab" fixed-tabs class="elevation-3" slider-color="primary" @change="loadData">
          <v-tab v-for="tab in tabs" :key="tab.id" :href="`#${tab.id}`">{{ tab.title }}</v-tab>
        </v-tabs>
      </v-flex>
    </v-layout>
    <v-layout row wrap>
      <v-flex xs12>
        <v-card class="elevation-3">
          <v-card-title class="pa-2">
            <h6 class="subheading">Filters</h6>
            <v-spacer/>
            <v-btn small flat icon class="ma-0"
                   @click.stop="showFilters = !showFilters">
              <v-icon>{{ showFilters ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text v-if="showFilters">
            <v-layout row wrap>
              <v-flex xs3>
                <v-select v-model="currentYear" :items="yearList" label="Year" hide-details @change="setYear"/>
              </v-flex>
              <v-flex xs3>
                <v-select v-model="currentMonth" :items="monthList" :disabled="!currentYear" label="Month" hide-details
                          item-text="text" item-value="value" @change="setMonth"/>
              </v-flex>
              <v-flex xs3>
                <v-select v-model="currentDay" :items="dayList" :disabled="!currentMonth" label="Day" hide-details
                          @change="currentWeek = null"/>
              </v-flex>
              <v-flex xs3>
                <v-select v-model="currentWeek" :items="weekList" :disabled="!currentYear" label="Week" hide-details
                          @change="currentDay = null, currentMonth = null"/>
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <v-slide-x-transition mode="out-in">
      <component :is="currentTab.component" :year="currentYear" :month="currentMonth" :day="currentDay" :week="currentWeek" ref="cache_tab"/>
    </v-slide-x-transition>
  </v-container>
</template>

<script>
import CacheTotals from './totals/CacheTotals'
import CacheDomains from './CacheDomains'
import CacheUrls from './urls/CacheUrls'
import CacheDenied from './CacheDenied'
import CacheUsers from './users/CacheUsers'
import CacheNetworks from './CacheNetworks'
import CacheMime from './CacheMime'
import { mapState } from "vuex"
import { WanosApi } from '@/api/wanos.api'

export default
{
  name: 'Webcache',
  components:
    {
      CacheTotals,
      CacheDomains,
      CacheUrls,
      CacheDenied,
      CacheUsers,
      CacheNetworks,
      CacheMime
    },
  data() {
    return {
      showFilters: true,
      dayItems: [],
      currentYear: null,
      currentMonth: null,
      currentDay: null,
      currentWeek: null,
      curTab: 'cache-1',
      tabs:
      [
        {
          id: 'cache-1',
          title: 'Totals',
          component: 'cache-totals'
        },
        {
          id: 'cache-2',
          title: 'Top domains',
          component: 'cache-domains'
        },
        {
          id: 'cache-3',
          title: 'Top URLs',
          component: 'cache-urls'
        },
        {
          id: 'cache-4',
          title: 'Top denied',
          component: 'cache-denied'
        },
        {
          id: 'cache-5',
          title: 'Users',
          component: 'cache-users'
        },
        {
          id: 'cache-6',
          title: 'Networks',
          component: 'cache-networks'
        },
        {
          id: 'cache-7',
          title: 'MIME types',
          component: 'cache-mime'
        }
      ]
    };
  },
  computed:
    {
      ...mapState(["activeOrg", "activeDevice"]),
      currentTab() {
        const id = this.curTab;
        return this.tabs.find(item => item.id === id);
      },
      yearList() {
        return this.dayItems.map(item => item.year)
          .filter((value, index, self) => self.indexOf(value) === index)
          .sort();
      },
      monthList() {
        if(!this.currentYear) return [];
        const year = this.currentYear;
        return [
          {
            value: 0,
            text: 'ANY'
          }].concat(this.dayItems.filter(item => item.year == year)[0].monthList.map(mon => ({
            value: mon.val,
            text: mon.month
          })));
      },
      dayList() {
        if(!this.currentMonth) return [];
        const year = this.currentYear;
        const month = this.currentMonth;
        return [
          {
            value: 0,
            text: 'ANY'
          }
        ].concat(this.dayItems.filter(item => item.year == year)[0].monthList
          .filter(item => item.val == month)[0].dayList.map(item => ({
            value: item,
            text: item
          })));
      },
      weekList() {
        if(!this.currentYear) return [];
        const year = this.currentYear;
        return [
          {
            value: 0,
            text: 'ANY'
          }
        ].concat(this.dayItems.filter(item => item.year == year)[0].weekList.map(item => ({
            value: item,
            text: item
          })));
      }
    },
  mounted() {
    this.fetchData();
  },
  methods:
    {
      async fetchData() {
        try {
          this.dayItems = await WanosApi.getWebcacheDates(this.activeOrg._id, this.activeDevice._id);
        } catch (err) {
          console.error(err);
        }
        this.currentYear = this.dayItems.length > 0 ? this.yearList[0] : null;
        this.currentMonth = null;
        this.currentDay = null;
        this.currentWeek = null;
      },
      setYear() {
        this.currentMonth = null;
        this.currentDay = null;
        this.currentWeek = null;
      },
      setMonth() {
        this.currentDay = null;
        this.currentWeek = null;
      },
      loadData() {
        this.$refs.cache_tab.fetchData();
      }
    }
}
</script>
