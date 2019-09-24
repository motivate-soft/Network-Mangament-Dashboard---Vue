<template>
  <v-container grid-list-lg fluid class="pt-2">
    <v-layout row wrap class="pb-2">
      <v-flex xs12>
        <OverviewStatic />
      </v-flex>
    </v-layout>
    <v-layout row wrap>
      <v-flex xs12>
        <v-tabs v-model="curTab" fixed-tabs class="elevation-3" slider-color="primary">
          <v-tab v-for="tab in tabs" :key="tab.id" :href="`#${tab.id}`">{{ tab.title }}</v-tab>
        </v-tabs>
        <OverviewBase :period="currentTab.period"/>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState } from "vuex"
import OverviewBase from './OverviewBase'
import OverviewStatic from './OverviewStatic'

export default
{
  name: 'SystemOverview',
  components:
    {
      OverviewBase,
      OverviewStatic,
    },
  data() {
    return {
      curTab: 'overview-hour',
      tabs:
        [
          {
            id: 'overview-hour',
            title: 'Last Hour',
            period: 'Hour'
          },
          {
            id: 'overview-day',
            title: 'Last Day',
            period: 'Day'
          },
          {
            id: 'overview-week',
            title: 'Last Week',
            period: 'Week'
          },
          {
            id: 'overview-month',
            title: 'Last Month',
            period: 'Month'
          },
          {
            id: 'overview-year',
            title: 'Last Year',
            period: 'Year'
          },
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
    },
}
</script>
