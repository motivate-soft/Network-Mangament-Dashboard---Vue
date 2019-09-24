<template>
  <v-container grid-list-lg fluid class="pt-2">
    <v-layout row wrap>
      <v-flex xs12>
        <v-card class="elevation-3">
          <v-card-title class="pa-2 ">
            <h6 class="subheading">Netstat current TCP sessions</h6>
            <v-spacer/>
            <v-btn small flat icon class="ma-0" @click.stop="showSessions = !showSessions">
              <v-icon>{{ showSessions ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text v-if="showSessions">
            <v-card class="elevation-0">
              <v-card-title>
                <v-spacer/>
                <v-text-field v-model.trim="search" append-icon="search" label="Search" single-line hide-details clearable @keydown.esc="search = ''" />
                <v-spacer/>
              </v-card-title>
              <v-data-table :headers="headers" :items="sessions.sessionList" :search="search" :pagination.sync="pagination" :rows-per-page-items="pageList" must-sort class="striped_table">
                <template slot="items" slot-scope="props">
                  <tr>
                    <td align="right">{{ props.index + 1 }}</td>
                    <td>{{ props.item.address1 }}</td>
                    <td>{{ props.item.address2 }}</td>
                    <td>{{ props.item.status }}</td>
                  </tr>
                </template>
                <!--
                  Vuetify does not provide the scoped slot "pageText" when both "totalItems" and "search" props are being set
                -->
                <template slot="pageText" slot-scope="props">
                  {{ props.pageStart }} - {{ props.pageStop }} of {{ props.itemsLength }}
                </template>
              </v-data-table>
            </v-card>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState } from "vuex"
import { WanosApi } from '@/api/wanos.api'

export default
{
  name: 'DiagnosticNetstat',
  data() {
    return {
      showSessions: true,
      sessions: {
        sessionList: [],
        totalItems: 0,
      },
      search: '',
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
            text: 'Address',
            align: 'left',
            class: 'subheading',
            value: 'address1',
          },
          {
            text: 'Address',
            align: 'left',
            class: 'subheading',
            value: 'address2',
          },
          {
            text: 'Status',
            align: 'left',
            class: 'subheading',
            value: 'status',
          },
        ],
      pageList:
        [
          10,
          25,
          50,
          100,
          {
            text: "$vuetify.dataIterator.rowsPerPageAll",
            value: -1
          }
        ],
      pagination:
        {
          sortBy: 'status',
          descending: false,
          rowsPerPage: 50,
          page: 1
        },
    };
  },
  computed:
    {
      ...mapState(["activeOrg", "activeDevice"]),
    },
  mounted() {
    this.fetchData();
  },
  methods:
    {
      async fetchData() {
        try {
          this.pagination.page = 1;
          this.search = '';
          this.sessions = await WanosApi.getNetstatSessions(this.activeOrg._id, this.activeDevice._id);
        } catch (err) {
          console.error(err);
        }
      },
    }
}
</script>
