<template>
  <v-container grid-list-lg fluid class="pt-2">
    <v-layout row wrap>
      <v-flex xs12>
        <v-card class="elevation-3">
          <v-card-title class="pa-2 ">
            <h6 class="subheading">Network interfaces</h6>
            <v-spacer/>
            <v-btn small flat icon class="ma-0" @click.stop="showStatus = !showStatus">
              <v-icon>{{ showStatus ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text v-if="showStatus">
            <v-data-table :headers="headers" :items="interfaces" hide-actions class="elevation-1">
              <template slot="items" slot-scope="props">
                <tr>
                  <td align="center">
                    <figure>
                      <img v-if="props.item.online" src="@/assets/eth_on.png" width="31" height="26">
                      <img v-else src="@/assets/eth_off.png" width="31" height="26">
                      <figcaption>{{ props.item.name }}</figcaption>
                    </figure>
                  </td>
                  <td>
                    <table class="tbl_no_padding">
                      <tr>
                        <td>MAC:</td>
                        <td>{{ props.item.mac }}</td>
                      </tr>
                      <tr>
                        <td>Driver:</td>
                        <td>{{ props.item.driver }}</td>
                      </tr>
                    </table>
                  </td>
                  <td>
                    <table class="tbl_no_padding">
                      <tr>
                        <td>Duplex:</td>
                        <td>{{ props.item.duplex }}</td>
                      </tr>
                      <tr>
                        <td>Speed:</td>
                        <td>{{ props.item.speed }} Mbps</td>
                      </tr>
                      <tr>
                        <td>MTU:</td>
                        <td>{{ props.item.mtu }}</td>
                      </tr>
                    </table>
                  </td>
                  <td>
                    <table class="tbl_no_padding">
                      <tr>
                        <td>MBytes:</td>
                        <td>{{ props.item.receive.bytes | traffic }}</td>
                      </tr>
                      <tr>
                        <td>Errors:</td>
                        <td>{{ props.item.receive.errors }}</td>
                      </tr>
                      <tr>
                        <td>Dropped:</td>
                        <td>{{ props.item.receive.dropped }}</td>
                      </tr>
                    </table>
                  </td>
                  <td>
                    <table class="tbl_no_padding">
                      <tr>
                        <td>MBytes:</td>
                        <td>{{ props.item.transmit.bytes | traffic }}</td>
                      </tr>
                      <tr>
                        <td>Errors:</td>
                        <td>{{ props.item.transmit.errors }}</td>
                      </tr>
                      <tr>
                        <td>Dropped:</td>
                        <td>{{ props.item.transmit.dropped }}</td>
                      </tr>
                    </table>
                  </td>
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
  name: 'NetworkInterfaces',
  data() {
    return {
      showStatus: true,
      interfaces: [],
      headers:
        [
          {
            text: 'Status',
            align: 'center',
            class: 'subheading',
            sortable: false,
          },
          {
            text: 'Interface',
            align: 'left',
            class: 'subheading',
            sortable: false,
          },
          {
            text: 'Link',
            align: 'left',
            class: 'subheading',
            sortable: false,
          },
          {
            text: 'Receive',
            align: 'left',
            class: 'subheading',
            sortable: false,
          },
          {
            text: 'Transmit',
            align: 'left',
            class: 'subheading',
            sortable: false,
          },
        ],
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
          this.interfaces = await WanosApi.getNetworkInterfaces(this.activeOrg._id, this.activeDevice._id);
        } catch (err) {
          console.error(err);
        }
      },
    }
}
</script>

<style>
  .tbl_no_padding td
  {
    padding: 2px !important;
    height: auto !important;
  }

  .tbl_no_padding td:first-child
  {
    font-weight: bold;
  }
</style>
