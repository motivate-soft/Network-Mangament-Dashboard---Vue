<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-card class="elevation-3">
        <v-card-title class="pa-2 ">
          <h6 class="subheading">User Statistics on {{ chosenPeriod }}</h6>
          <v-spacer/>
          <v-btn small flat icon class="ma-0"
                 @click.stop="showStats = !showStats">
            <v-icon>{{ showStats ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text v-if="showStats">
          <user-detail :users="users" :period-name="chosenPeriod" :year="year" :month="month"
                       :day="day" :week="week" @fetch="newSorting" @detail="updateUser"/>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapState } from "vuex"
import { WanosApi } from '@/api/wanos.api'
import UserDetail from './UserPanel'

export default
{
  name: 'CacheUsers',
  components:
    {
      UserDetail
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
      sortedBy: 'bytes',
      users: [],
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
          const users = await WanosApi.getWebcacheUsers(this.activeOrg._id, this.activeDevice._id, this.year, this.month, this.day, this.week,
            this.sortedBy);
          this.users = users.map(item => {
            item.largest = item.largestFileBytes;
            return item;
          });
        } catch (e) {
          console.error(e);
        }
      },
      newSorting(col) {
        this.sortedBy = col;
        this.fetchData();
      },
      updateUser(user,details) {
        const found = this.users.find(item => item.user === user);
        if(found) {
          this.$set(found, 'urlList', details.urlList);
          this.$set(found, 'periodList', details.periodList);
        }
      }
    }
}
</script>
