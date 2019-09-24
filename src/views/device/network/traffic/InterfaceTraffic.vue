<template>
  <v-container grid-list-lg fluid class="pt-2">
    <v-layout row wrap>
      <v-flex xs12>
        <v-tabs v-model="curTab" fixed-tabs class="elevation-3" slider-color="primary">
          <v-tab v-for="tab in tabs" :key="tab.id" :href="`#${tab.id}`">{{ tab.title }}</v-tab>
        </v-tabs>
        <TrafficBase :period="currentTab.period"/>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState } from "vuex"
import TrafficBase from './TrafficBase'

export default
{
  name: 'NetworkTraffic',
  components:
    {
      TrafficBase,
    },
  data() {
    return {
      curTab: 'traffic-hour',
      tabs:
        [
          {
            id: 'traffic-hour',
            title: 'Last Hour',
            period: 'Hour'
          },
          {
            id: 'traffic-day',
            title: 'Last Day',
            period: 'Day'
          },
          {
            id: 'traffic-week',
            title: 'Last Week',
            period: 'Week'
          },
          {
            id: 'traffic-month',
            title: 'Last Month',
            period: 'Month'
          },
          {
            id: 'traffic-year',
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
