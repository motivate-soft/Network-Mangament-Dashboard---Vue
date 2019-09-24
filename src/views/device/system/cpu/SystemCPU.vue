<template>
  <v-container grid-list-lg fluid class="pt-2">
    <v-layout row wrap>
      <v-flex xs12>
        <v-tabs v-model="curTab" fixed-tabs class="elevation-3" slider-color="primary">
          <v-tab v-for="tab in tabs" :key="tab.id" :href="`#${tab.id}`">{{ tab.title }}</v-tab>
        </v-tabs>
        <CPUBase :period="currentTab.period"/>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState } from "vuex"
import CPUBase from './CPUBase'

export default
{
  name: 'SystemCPU',
  components:
    {
      CPUBase,
    },
  data() {
    return {
      curTab: 'cpu-hour',
      tabs:
        [
          {
            id: 'cpu-hour',
            title: 'Last Hour',
            period: 'Hour'
          },
          {
            id: 'cpu-day',
            title: 'Last Day',
            period: 'Day'
          },
          {
            id: 'cpu-week',
            title: 'Last Week',
            period: 'Week'
          },
          {
            id: 'cpu-month',
            title: 'Last Month',
            period: 'Month'
          },
          {
            id: 'cpu-year',
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
