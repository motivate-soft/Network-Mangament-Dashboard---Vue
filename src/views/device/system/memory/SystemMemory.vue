<template>
  <v-container grid-list-lg fluid class="pt-2">
    <v-layout row wrap>
      <v-flex xs12>
        <v-tabs v-model="curTab" fixed-tabs class="elevation-3" slider-color="primary">
          <v-tab v-for="tab in tabs" :key="tab.id" :href="`#${tab.id}`">{{ tab.title }}</v-tab>
        </v-tabs>
        <MemoryBase :period="currentTab.period"/>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState } from "vuex"
import MemoryBase from './MemoryBase'

export default
{
  name: 'SystemMemory',
  components:
    {
      MemoryBase,
    },
  data() {
    return {
      curTab: 'memory-hour',
      tabs:
        [
          {
            id: 'memory-hour',
            title: 'Last Hour',
            period: 'Hour'
          },
          {
            id: 'memory-day',
            title: 'Last Day',
            period: 'Day'
          },
          {
            id: 'memory-week',
            title: 'Last Week',
            period: 'Week'
          },
          {
            id: 'memory-month',
            title: 'Last Month',
            period: 'Month'
          },
          {
            id: 'memory-year',
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
