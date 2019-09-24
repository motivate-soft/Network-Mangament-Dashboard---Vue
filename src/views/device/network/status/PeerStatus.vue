<template>
  <v-container grid-list-lg fluid class="pt-2">
    <!-- details -->
    <v-layout row wrap>
      <v-flex xs12>
        <v-card class="elevation-3">
          <v-card-title class="pa-2 ">
            <h6 class="subheading">Peer Status</h6>
            <v-spacer/>
            <v-btn small flat icon class="ma-0" @click.stop="showStatus = !showStatus">
              <v-icon>{{ showStatus ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text v-if="showStatus">
            <v-data-table :headers="headers" :items="peers" hide-actions class="striped_table">
              <template slot="items" slot-scope="props">
                <tr>
                  <td align="center">{{ props.index + 1 }}</td>
                  <td>{{ props.item.hostname }} ({{ props.item.ip }})</td>
                  <td>{{ props.item.status }}</td>
                  <td>{{ props.item.datastore }}</td>
                  <td>{{ props.item.plr }}</td>
                  <td>
                    <app-progress-linear :value="props.item.reductionRx"
                                         :text="props.item.reductionRx | maxDecimalPoints(1) + '%'"
                                         :height="18"
                                         :background-opacity="0"
                                         color="primary"
                    />
                  </td>
                  <td>
                    <app-progress-linear :value="props.item.reductionTx"
                                         :text="props.item.reductionTx | maxDecimalPoints(1) + '%'"
                                         :height="18"
                                         :background-opacity="0"
                                         color="primary"
                    />
                  </td>
                  <td align="center">
                    <v-btn flat icon :to="{name: 'networkOptimization', query: {peer: props.item.ip}}">
                      <v-icon smalli class="mr-2 edit-icons" >poll</v-icon>
                    </v-btn>
                  </td>
                  <td align="center">
                      <v-icon small class="mr-2 edit-icons" @click="deletePeer(props.item)">delete</v-icon>
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
import AppProgressLinear from "@/components/base/AppProgressLinear.vue"
import config from '@/config'

export default
{
  name: 'NetworkPeerStatus',
  components:
    {
      AppProgressLinear,
    },
  data() {
    return {
      showFilters: true,
      showStatus: true,
      peers: [],
      headers:
        [
          {
            text: 'Site #',
            align: 'center',
            class: 'subheading',
            sortable: false,
            width: '50px'
          },
          {
            text: 'Site name',
            align: 'left',
            class: 'subheading',
            sortable: true,
            value: 'hostname',
          },
          {
            text: 'Peer status',
            align: 'left',
            class: 'subheading',
            sortable: true,
            value: 'status',
          },
          {
            text: 'Datastore',
            align: 'left',
            class: 'subheading',
            sortable: true,
            value: 'datastore',
          },
          {
            text: 'PLR',
            align: 'left',
            class: 'subheading',
            sortable: true,
            value: 'plr',
          },
          {
            text: 'Wan Rx reduction (last 2h)',
            align: 'left',
            class: 'subheading',
            sortable: true,
            value: 'reductionRx',
          },
          {
            text: 'Wan Tx reduction (last 2h)',
            align: 'left',
            class: 'subheading',
            sortable: true,
            value: 'reductionTx',
          },
          {
            text: 'Graph',
            align: 'center',
            class: 'subheading',
            sortable: false,
            width: '80px'
          },
          {
            text: 'Remove peer',
            align: 'center',
            class: 'subheading',
            sortable: false,
            width: '80px'
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
          this.peers = await WanosApi.getPeerStatus(this.activeOrg._id, this.activeDevice._id);
        } catch (err) {
          console.error(err);
        }
      },
      async deletePeer(peer) {
        if (confirm('Are you sure you want to remove this peer?')) {
          try {
            const res = await WanosApi.removePeer(this.activeOrg._id, this.activeDevice._id, peer.ip);
            if(res) {
              this.peers.splice(this.peers.indexOf(peer), 1);
              this.$root.errMsg = '';
              this.$store.commit('pushError', {
                code: config.ERR_CODE.PEER_REMOVED,
                message: 'Peer ' + peer.hostname + ' removed. Service Reset Initiated.<br>Warning: Manually remove this peer <strong>' + this.activeDevice.hostname + '</strong> on <strong>' + peer.hostname + '</strong>'
              });
            }
          } catch (err) {
            console.error(err);
          }
        }
      }
    }
}
</script>
