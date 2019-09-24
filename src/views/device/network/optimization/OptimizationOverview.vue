<template>
  <v-container grid-list-lg fluid class="pt-2">
    <!-- filters -->
    <v-layout row wrap>
      <v-flex xs12>
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
                <v-select v-model="peer" :items="peerList" label="Peer" hide-details item-text="hostname" item-value="ip" return-object/>
              </v-flex>
              <v-flex xs2>
                <v-btn color="primary" dark @click="refreshData">Submit</v-btn>
              </v-flex>
              <v-flex xs12>
                <v-tabs v-model="period" fixed-tabs slider-color="primary">
                  <v-tab v-for="tab in tabs" :key="tab.id" :href="`#${tab.period}`">{{ tab.title }}</v-tab>
                </v-tabs>
              </v-flex>
              <!--
              <v-flex xs1>
                <v-select v-model="period" :items="tabs" label="Period" hide-details item-text="title" item-value="period"/>
              </v-flex>
              -->
            </v-layout>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <!-- tabs for periods -->
    <v-layout row wrap>
      <v-flex xs12>
        <!--
        <v-tabs v-model="curTab" fixed-tabs class="elevation-3" slider-color="primary">
          <v-tab v-for="tab in tabs" :key="tab.id" :href="`#${tab.id}`">{{ tab.title }}</v-tab>
        </v-tabs>
        -->
        <OptimizationBase :period="period" :peer="peer" ref="tile"/>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState } from "vuex"
import { WanosApi } from '@/api/wanos.api'
import OptimizationBase from './OptimizationBase'

export default
{
  name: 'NetworkOptimization',
  components:
    {
      OptimizationBase,
    },
  data() {
    return {
      showFilters: true,
      peer: {},
      newPeer: {},
      peerList: [],
      period: 'Hour',
      newPeriod: 'Hour',
      tabs:
        [
          {
            id: 'optimize-hour',
            title: 'Last Hour',
            period: 'Hour'
          },
          {
            id: 'optimize-day',
            title: 'Last Day',
            period: 'Day'
          },
          {
            id: 'optimize-week',
            title: 'Last Week',
            period: 'Week'
          },
          {
            id: 'optimize-month',
            title: 'Last Month',
            period: 'Month'
          },
          {
            id: 'optimize-year',
            title: 'Last Year',
            period: 'Year'
          },
        ]
    };
  },
  computed:
    {
      ...mapState(["activeOrg", "activeDevice"]),
      /*
      currentTab() {
        const id = this.curTab;
        return this.tabs.find(item => item.id === id);
      },
      */
    },
  watch:
    {
      period(newVal, oldVal) {
        this.$nextTick(() => {
          if(oldVal) this.refreshData();
        });
      }
    },
  mounted() {
    this.fetchData();
  },
  methods:
    {
      async fetchData() {
        try {
          const res = await WanosApi.getPeerStatus(this.activeOrg._id, this.activeDevice._id);
          if(!res) return;
          this.peerList = [{ip: '', hostname: 'Total'}].concat(res.map(item => {
            return {
              hostname: item.hostname + ' (' + item.ip + ')',
              ip: item.ip
            }
          }));
          if(this.$route.query.peer) {
            const ip = this.$route.query.peer;
            const peer = this.peerList.find(item => item.ip === ip);
            if(peer) this.peer = peer;
            else this.peer = this.peerList[0];
          } else this.peer = this.peerList[0];
          this.$nextTick(() => {
            this.refreshData();
          });
        } catch (err) {
          console.error(err);
        }
      },
      refreshData() {
        this.$refs.tile.fetchData();
      },
    }
}
</script>
