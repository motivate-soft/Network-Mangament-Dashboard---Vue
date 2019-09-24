<template>
  <v-container grid-list-lg fluid class="pt-2 flow_sessions">
    <!-- filters -->
    <v-layout row wrap class="session_filters">
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
            <v-container grid-list-lg fluid class="pa-0">
              <v-layout row wrap justify-center align-center>
                <v-flex>
                  <v-select v-model="current.peer" :items="listPeers" label="Peer" hide-details item-text="hostname" item-value="ip"/>
                </v-flex>
                <v-flex>
                  <v-autocomplete v-model="current.app" :items="listApps" label="Application" dense hide-details item-text="name" item-value="id" @change="current.port = null"/>
                </v-flex>
                <v-flex>
                  <v-text-field v-model.number="current.port" label="Port" hide-details @input="current.app = 0"/>
                </v-flex>
                <v-flex>
                  <v-text-field v-model.number="current.minKB" label="Min KB" hide-details/>
                </v-flex>
                <v-flex>
                  <v-select v-model="current.direction" :items="direction" label="Direction" hide-details/>
                </v-flex>
                <v-flex>
                  <v-select v-model="current.period" :items="periods" label="Period" hide-details/>
                </v-flex>
                <v-flex>
                  <v-layout justify-center align-center fill-height>
                    <v-btn color="primary" dark @click="submit">Submit</v-btn>
                  </v-layout>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <!-- sessions -->
    <v-layout row class="sessions_body">
      <v-card class="elevation-3 sessions_body_card">
        <v-card-title class="pa-2">
          <h6 class="subheading">Sessions</h6>
          <v-spacer/>
          <v-btn small flat icon class="ma-0" @click.stop="showSessions = !showSessions">
            <v-icon>{{ showSessions ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</v-icon>
          </v-btn>
        </v-card-title>
        <v-layout v-if="showSessions" class="pb-3 sessions_body_table">
          <v-card class="elevation-0 sessions_body_card" style="min-width: 0;">
            <v-card-title class="pt-0">
              <v-spacer/>
                <v-text-field v-model="search" append-icon="search" placeholder="Search" single-line hide-details clearable @keydown.esc="search = ''" />
              <v-spacer/>
              <v-flex xs2>
                <v-select v-model="pagination.rowsPerPage" :items="pageList" label="Rows per page" hide-details/>
              </v-flex>
            </v-card-title>
            <scroll-bar>
              <v-data-table :headers="headers" :items="filteredSessions" :pagination.sync="pagination"
                            :total-items="sessions.totalItems" :rows-per-page-items="pageList" must-sort class="striped_table">
                <template slot="items" slot-scope="props">
                  <tr>
                    <td align="right">{{ props.index + 1 }}</td>
                    <td>{{ props.item.source }}:{{ props.item.sourcePort }}</td>
                    <td>{{ props.item.destination }}:{{ props.item.destinationPort }}</td>
                    <td align="right">{{ props.item.bytesLan | megabyte | maxDecimalPoints(2) | thousand }} MB</td>
                    <td align="right">{{ props.item.bytesWan | megabyte | maxDecimalPoints(2) | thousand }} MB</td>
                    <td>{{ props.item.appId | appName }}</td>
                    <td>
                      <app-progress-linear :value="props.item.reduction"
                                           :text="$options.filters.maxDecimalPoints(props.item.reduction,1) + '%'"
                                           :height="18"
                                           :background-opacity="0"
                                           color="primary"
                      />
                    </td>
                    <td align="right">
                      <v-btn icon flat color="primary" @click="showDetail(props.item)"><v-icon>search</v-icon></v-btn>
                    </td>
                  </tr>
                </template>
                <!--
                  Vuetify does not provide the scoped slot "pageText" when both "totalItems" and "search" props are being set
                -->
                <template slot="pageText" slot-scope="props">
                  {{ props.pageStart }} - {{ props.pageStop }} of {{ props.itemsLength }}
                </template>
              </v-data-table>
            </scroll-bar>
          </v-card>
          <v-flex xs4 class="chord_panel">
            <div>
              <chord-diagram :points="lan_wan ? chordPointsWan : chordPointsLan" style="height: calc(100% - 24px);"/>
              <div class="chord_selector">
                <label class="subheading" @click="lan_wan = false">Lan MB</label>
                <v-switch id="lan_wan" v-model="lan_wan" class="pl-3 mt-0 pt-0" hide-details/>
                <label class="subheading" @click="lan_wan = true">Wan MB</label>
              </div>
            </div>
          </v-flex>
        </v-layout>
      </v-card>
    </v-layout>
    <!-- session details -->
    <v-dialog v-model="showDetails" content-class="session_details" scrollable @keydown.esc="showDetails = false">
      <v-card>
        <v-card-title class="primary title white--text" dark>Additional session info</v-card-title>
        <v-divider/>
        <v-layout>
          <v-spacer/>
          <v-text-field v-model="searchDetails" append-icon="search" placeholder="Search" single-line hide-details clearable @keydown.esc="searchDetails = ''" />
          <v-spacer/>
        </v-layout>
        <v-card-text style="max-height: 80vh; min-height: 250px;">
          <v-data-table v-if="showDetails" :headers="detailsHeaders" :items="filteredDetails" :pagination.sync="detailsPagination"
                        :total-items="details.totalItems" :rows-per-page-items="pageList" must-sort class="elevation-1">
            <template slot="items" slot-scope="props">
              <tr>
                <td align="right">{{ props.index + 1 }}</td>
                <td>{{ props.item.source }}:{{ props.item.sourcePort }}</td>
                <td>{{ props.item.destination }}:{{ props.item.destinationPort }}</td>
                <td align="right">{{ props.item.bytesLan | megabyte | maxDecimalPoints(2) | thousand }} MB</td>
                <td align="right">{{ props.item.bytesWan | megabyte | maxDecimalPoints(2) | thousand }} MB</td>
                <td>{{ props.item.protocol }}</td>
                <td>{{ props.item.appId | appName }}</td>
                <td>{{ props.item.port }}</td>
                <td>{{ props.item.time | stampLocale }}</td>
                <td>
                  <app-progress-linear :value="props.item.reduction"
                                       :text="$options.filters.maxDecimalPoints(props.item.reduction,1) + '%'"
                                       :height="18"
                                       :background-opacity="0"
                                       color="success"
                  />
                </td>
              </tr>
            </template>
            <!--
              Vuetify does not provide the scoped slot "pageText" when both "totalItems" and "search" props are being set
            -->
            <template slot="pageText" slot-scope="props">
              {{ props.pageStart }} - {{ props.pageStop }} of {{ props.itemsLength }}
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn color="primary" @click="showDetails = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapState } from "vuex"
import { WanosApi } from '@/api/wanos.api'
import AppProgressLinear from "@/components/base/AppProgressLinear.vue"
import chordDiagram from '@/components/base/chordDiagram'
import scrollBar from '@/components/scrollbar/vue-scrollbar'

let protocolsMap = {};

export default
{
  name: 'NetworkSessions',
  components:
    {
      AppProgressLinear,
      chordDiagram,
      scrollBar,
    },
  data() {
    return {
      showFilters: true,
      showSessions: true,
      showDetails: false,
      lan_wan: false,
      flow_id: {},
      details: {
        sessionList: [],
        totalItems: 0
      },
      applications: [],
      protocols: {},
      sessions: {
        sessionList: [],
        totalItems: 0,
      },
      search: '',
      searchDetails: '',
      direction:
      [
        {
          text: 'Both',
          value: ''
        },
        {
          text: 'Wan In',
          value: 'IN'
        },
        {
          text: 'Wan Out',
          value: 'OUT'
        },
      ],
      periods:
      [
        {
          text: 'Last 2 min',
          value: 120,
        },
        {
          text: 'Last 5 min',
          value: 300,
        },
        {
          text: 'Last 15 min',
          value: 900,
        },
        {
          text: 'Last 30 min',
          value: 1800,
        },
        {
          text: 'Last 60 min',
          value: 3600,
        },
        {
          text: 'Last 2 hours',
          value: 7200,
        },
        {
          text: 'Last 8 hours',
          value: 28800,
        },
        {
          text: 'Last 24 hours',
          value: 86400,
        },
      ],
      current:
        {
          peer: null,
          app: 0,
          port: null,
          minKB: 10,
          direction: '',
          period: 1800,
        },
      headers:
      [
        {
          text: '#',
          align: 'right',
          class: 'subheading',
          sortable: false,
          width: '80px'
        },
        {
          text: 'Source',
          align: 'left',
          class: 'subheading',
          sortable: false,
          value: 'source',
        },
        {
          text: 'Destination',
          align: 'left',
          class: 'subheading',
          sortable: false,
          value: 'destination',
        },
        {
          text: 'LAN MB',
          align: 'right',
          class: 'subheading',
          sortable: true,
          value: 'bytesLan',
        },
        {
          text: 'WAN MB',
          align: 'right',
          class: 'subheading',
          sortable: true,
          value: 'bytesWan',
        },
        {
          text: 'Application',
          align: 'left',
          class: 'subheading',
          sortable: true,
          value: 'appId',
        },
        {
          text: 'Reduction',
          align: 'left',
          class: 'subheading',
          sortable: true,
          value: 'reduction',
        },
        {
          text: 'Detail',
          align: 'right',
          class: 'subheading',
          sortable: false
        },
      ],
      detailsHeaders:
      [
        {
          text: '#',
          align: 'right',
          class: 'subheading',
          sortable: false,
          width: '80px'
        },
        {
          text: 'Source',
          align: 'left',
          class: 'subheading',
          sortable: false,
          value: 'source',
        },
        {
          text: 'Destination',
          align: 'left',
          class: 'subheading',
          sortable: false,
          value: 'destination',
        },
        {
          text: 'LAN KB',
          align: 'right',
          class: 'subheading',
          sortable: true,
          value: 'bytesLan',
        },
        {
          text: 'WAN KB',
          align: 'right',
          class: 'subheading',
          sortable: true,
          value: 'bytesWan',
        },
        {
          text: 'Protocol',
          align: 'left',
          class: 'subheading',
          sortable: true,
          value: 'protocol',
        },
        {
          text: 'Application',
          align: 'left',
          class: 'subheading',
          sortable: true,
          value: 'appId',
        },
        {
          text: 'Port',
          align: 'center',
          class: 'subheading',
          sortable: true,
          value: 'port',
        },
        {
          text: 'Time',
          align: 'center',
          class: 'subheading',
          sortable: true,
          value: 'time',
        },
        {
          text: 'Reduction',
          align: 'left',
          class: 'subheading',
          sortable: true,
          value: 'reduction',
          width: '150px'
        },
      ],
      pageList:
      [
        10,
        25,
        50,
        100,
        {
          text: 'ALL',
          value: -1
        }
      ],
      pagination:
        {
          sortBy: 'reduction',
          descending: true,
          rowsPerPage: 10,
          page: 1,
          totalItems: 0,
        },
      detailsPagination:
        {
          sortBy: 'reduction',
          descending: true,
          rowsPerPage: 10,
          page: 1,
          totalItems: 0,
        }
    };
  },
  filters:
    {
      appName(value) {
        return value ? protocolsMap[value] : '';
      }
    },
  computed:
    {
      ...mapState(["activeOrg", "activeDevice", "devices"]),
      listPeers () {
        return [
          {
            hostname: 'All',
            ip: null
          }
        ].concat((this.activeDevice.peersList || []).map(item => {
          return {
            hostname: item.hostname + ' (' + item.ip + ')',
            ip: item.ip
          }
        }));
      },
      listApps () {
        return [
          {
            name: 'All',
            id: 0
          }
        ].concat(this.applications.slice().sort((a, b) => {
          if (a.name < b.name) return -1;
          if (a.name > b.name) return 1;
          return 0;
        }));
      },
      filteredSessions () {
        const flt = (this.search || '').toLowerCase();
        if (!flt) return this.sessions.sessionList;
        const app = this.$options.filters.appName;
        return this.sessions.sessionList.filter(item => {
          return item.source.indexOf(flt) !== -1 ||
            item.destination.indexOf(flt) !== -1 ||
            app(item.app_id).toLowerCase().indexOf(flt) !== -1
        });
      },
      filteredDetails () {
        const flt = (this.searchDetails || '').toLowerCase();
        if (!flt) return this.details.sessionList;
        const app = this.$options.filters.appName;
        return this.details.sessionList.filter(item => {
          return item.source.indexOf(flt) !== -1 ||
            item.destination.indexOf(flt) !== -1 ||
            app(item.app_id).toLowerCase().indexOf(flt) !== -1 ||
            item.protocol.indexOf(flt) !== -1
        });
      },
      chordPointsWan() {
        const flt = this.$options.filters;
        return this.sessions.sessionList.map(item => {
          return {
            source: item.source + ':' + item.sourcePort,
            destination: item.destination + ':' + item.destinationPort,
            value: item.bytesWan,
            tooltip: flt.thousand(flt.maxDecimalPoints(flt.megabyte(item.bytesWan), 2)) + ' MB'
          }
        });
      },
      chordPointsLan() {
        const flt = this.$options.filters;
        return this.sessions.sessionList.map(item => {
          return {
            source: item.source + ':' + item.sourcePort,
            destination: item.destination + ':' + item.destinationPort,
            value: item.bytesLan,
            tooltip: flt.thousand(flt.maxDecimalPoints(flt.megabyte(item.bytesLan), 2)) + ' MB'
          }
        });
      },
    },
  watch:
    {
      pagination:
        {
          deep: true,
          handler(newVal, oldVal) {
            if (newVal.sortBy !== oldVal.sortBy) this.pagination.descending = true;
            else this.submit(false);
          }
        },
      detailsPagination:
        {
          deep: true,
          handler() {
            this.getDetailPage(false);
          }
        }
    },
  mounted() {
    this.fetchData();
  },
  methods:
    {
      async fetchData() {
        try {
          this.applications = await WanosApi.getNetworkProtocols(this.activeOrg._id, this.activeDevice._id);
          protocolsMap = {};
          this.applications.forEach(item => {
            protocolsMap[item.id] = item.name;
          });
        } catch (err) {
          console.error(err);
        }
      },
      async submit(reset) {
        try {
          if (reset) {
            this.pagination.page = 1;
            this.search = '';
          }
          this.sessions = await WanosApi.getFlowSessions(this.activeOrg._id, this.activeDevice._id, this.current, this.pagination);
        } catch (err) {
          console.error(err);
        }
      },
      showDetail (row) {
        this.flow_id = {
          src: row.source,
          dst: row.destination,
        };
        this.detailsPagination.page = 1;
        this.searchDetails = '';
        this.showDetails = true;
      },
      async getDetailPage (reset) {
        try {
          if (reset) {
            this.detailsPagination.page = 1;
            this.searchDetails = '';
          }
          this.details = await WanosApi.getSessionDetails(this.activeOrg._id, this.activeDevice._id, this.flow_id, this.detailsPagination);
        } catch (err) {
          console.error(err);
        }
      },
    }
}
</script>

<style>
  .session_details.v-dialog--active
  {
    width: auto;
  }

  .flow_sessions
  {
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .session_filters
  {
    flex: 0 0 auto !important;
  }

  .sessions_body
  {
    flex: 1 1 0;
    overflow: hidden;
    margin: 0 !important;
  }

  .chord_panel
  {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 0 !important;
  }

  .chord_panel > *
  {
    margin: auto 0;
    flex: 1 1 auto;
  }

  .chord_selector
  {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .chord_selector label
  {
    cursor: pointer;
  }

  .chord_selector > *
  {
    flex: 0 0 auto;
  }

  .sessions_body_card
  {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .sessions_body_table
  {
    overflow: hidden;
  }

</style>
