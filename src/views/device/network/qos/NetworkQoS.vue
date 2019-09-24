<template>
  <v-container grid-list-lg fluid class="pt-2">
    <!-- filters -->
    <v-layout column>
      <v-flex>
        <v-card class="elevation-3">
          <v-card-title class="pa-2">
            <h6 class="subheading">Display options</h6>
            <v-spacer/>
            <v-btn small flat icon class="ma-0" @click.stop="showFilters = !showFilters">
              <v-icon>{{ showFilters ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text v-if="showFilters">
            <v-layout row wrap justify-center align-center>
              <v-flex xs2>
                <v-select v-model="group" :items="qosList" label="Graph" hide-details />
              </v-flex>
              <v-flex xs1>
                <v-select v-model="period" :items="tabs" label="Period" hide-details item-text="title" item-value="period"/>
              </v-flex>
              <v-flex xs2>
                <v-btn color="primary" dark @click="refreshData">Submit</v-btn>
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-flex>
    <!-- tabs for periods -->
      <v-flex>
        <!--
        <v-tabs v-model="curTab" fixed-tabs class="elevation-3" slider-color="primary">
          <v-tab v-for="tab in tabs" :key="tab.id" :href="`#${tab.id}`">{{ tab.title }}</v-tab>
        </v-tabs>
        -->
        <qosBase :period="newPeriod" :group="newGroup" ref="tile"/>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState } from "vuex"
import qosBase from './QoSBase'

export default
{
  name: 'NetworkQoS',
  components:
    {
      qosBase,
    },
  data() {
    return {
      showFilters: true,
      group: null,
      newGroup: null,
      period: 'Hour',
      newPeriod: 'Hour',
      tabs:
        [
          {
            id: 'qos-hour',
            title: 'Last Hour',
            period: 'Hour'
          },
          {
            id: 'qos-day',
            title: 'Last Day',
            period: 'Day'
          },
          {
            id: 'qos-week',
            title: 'Last Week',
            period: 'Week'
          },
          {
            id: 'qos-month',
            title: 'Last Month',
            period: 'Month'
          },
          {
            id: 'qos-year',
            title: 'Last Year',
            period: 'Year'
          },
        ]
    };
  },
  computed:
    {
      ...mapState(["activeOrg", "activeDevice"]),
      qosList() {
        const result = [
          {
            text: 'All',
            value: null
          }
        ];
        for(let i = 0; i <= 17; i++) result.push({
          text: 'QoS class ' + i,
          value: i
        });
        return result;
      },
      /*
      currentTab() {
        const id = this.curTab;
        return this.tabs.find(item => item.id === id);
      },
      */
    },
  mounted() {
    this.refreshData();
  },
  methods:
    {
      refreshData() {
        this.newGroup = this.group;
        this.newPeriod = this.period;
        this.$refs.tile.fetchData(this.group, this.period);
      },
    }
}
</script>
