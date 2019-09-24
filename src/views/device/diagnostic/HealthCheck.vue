<template>
  <v-container grid-list-lg fluid class="pt-2">
    <!-- details -->
    <v-layout row wrap>
      <v-flex xs12>
        <v-card class="elevation-3">
          <v-card-title class="pa-2 ">
            <h6 class="subheading">System Health Status</h6>
          </v-card-title>
          <v-card-text>
            <v-data-table :headers="headers" :items="checks" hide-actions class="striped_table">
              <template slot="items" slot-scope="props">
                <tr>
                  <td>{{ props.item.name }}</td>
                  <td :class="(props.item.color || 'success') + '--text'"><strong>{{ props.item.status }}</strong></td>
                </tr>
              </template>
            </v-data-table>
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
  name: 'DiagnosticHealth',
  data() {
    return {
      checks: [],
      headers:
      [
        {
          text: 'Check',
          class: 'title',
          sortable: false,
        },
        {
          text: 'Status',
          class: 'title',
          sortable: false,
        },
      ]
    }
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
          this.checks = await WanosApi.getDiagnosticHealth(this.activeOrg._id, this.activeDevice._id);
        } catch (err) {
          console.error(err);
        }
      }
    }
}
</script>
