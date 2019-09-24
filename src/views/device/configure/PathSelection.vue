<template>
  <v-container grid-list-lg fluid class="pt-2">
    <v-layout row wrap>
      <v-flex xs12 lg6>
        <v-card class="elevation-3">
          <v-card-title class="pa-2 ">
            <h6 class="subheading">Path selection link metrics</h6>
          </v-card-title>
          <v-card-text>
            <v-dialog v-model="dialog" scrollable max-width="500px" @keydown.esc="dialog = false">
              <v-form ref="frmLinks" style="width: 100%;" lazy-validation @submit.prevent="addLink">
                <v-card v-if="dialog">
                  <v-toolbar dense dark color="primary">
                    <v-toolbar-title>Edit Device</v-toolbar-title>
                  </v-toolbar>
                  <v-card-text>
                    <v-checkbox v-model="newGateway.primary" label="Primary" persistent-hint hint="Whether the gateway is Primary / Secondary"/>
                    <v-text-field v-model.trim="newGateway.address" :rules="[rules.required, rules.ip]" :error-messages="serverValidation.address" label="Gateway address"
                                  validate-on-blur @focus="serverValidation.address = []" hint="Ex: 192.168.0.1"/>
                    <v-text-field v-model.number="newGateway.latency" label="Max latency (ms)" type="number" min="1" max="5000" :error-messages="serverValidation.latency"
                                  validate-on-blur @focus="serverValidation.latency = []" :rules="[rules.required]" hint="Max round trip time in milliseconds"/>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer/>
                    <v-btn color="error" dark @click="close">Cancel</v-btn>
                    <v-btn color="success" dark type="submit">Save</v-btn>
                  </v-card-actions>
                </v-card>
              </v-form>
            </v-dialog>
            <v-data-table :headers="headers" :items="gateways" class="elevation-1" hide-actions>
              <template slot="items" slot-scope="props">
                <td>{{ props.item.primary ? 'primary' : 'secondary' }}</td>
                <td>{{ props.item.address }}</td>
                <td>{{ props.item.latency }}</td>
                <td align="right" width="100">
                    <v-icon small class="mr-2 edit-icons" @click="deleteGateway(props.item)">delete</v-icon>
                </td>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12 lg6>
        <v-form ref="frmOptions" style="width: 100%;" lazy-validation @submit.prevent="saveOptions">
          <v-card class="elevation-3">
            <v-card-title class="pa-2 ">
              <h6 class="subheading">Path selection options</h6>
            </v-card-title>
            <v-card-text>
              <v-layout row wrap>
                <v-flex xs12 lg6>
                  <v-checkbox v-model="params.multiWan" label="MultiWAN" persistent-hint hint="Multi WAN gateway feature"/>
                  <v-checkbox v-model="params.failOver" label="Fail over" persistent-hint hint="Allow traffic to fail over to Secondary gateway"/>
                  <v-checkbox v-model="params.preempt" label="Preempt" persistent-hint hint="Allow Primary to took over Secondary when path meets SLA thresholds"/>
                </v-flex>
                <v-flex xs12 lg6>
                  <v-select v-model="params.trackPeer" label="Track peer" :items="devicePeers" :error-messages="serverValidation.trackPeer"
                            validate-on-blur @focus="serverValidation.trackPeer = []" hint="Allow failing over to Secondary link"/>
                  <v-text-field v-model.number="params.timeout" label="Timeout (sec)" type="number" min="1" max="3600" :error-messages="serverValidation.timeout"
                                validate-on-blur @focus="serverValidation.timeout = []" :rules="[rules.required]" hint="Time in seconds to wait before declaring a link down"/>
                </v-flex>
              </v-layout>
            </v-card-text>
            <v-card-actions>
              <v-spacer/>
              <v-btn color="success" dark type="submit">Save</v-btn>
              <v-spacer/>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState } from "vuex"
import { WanosApi } from '@/api/wanos.api'
import config from '@/config'
import ValidationRules from '@/plugins/validationRules'

export default
{
  name: 'BackupRestore',
  mixins: [ValidationRules],
  data() {
    return {
      dialog: false,
      gateways: [],
      params: {},
      newGateway: {},
      defaultGateway:
        {
          primary: false,
          address: null,
          latency: null,
        },
      serverValidation:
        {
          address: [],
          latency: [],
          trackPeer: [],
          timeout: [],
        },
      headers:
      [
        {
          text: 'Type',
          class: 'subheading',
          sortable: false
        },
        {
          text: 'Gateway address',
          class: 'subheading',
          sortable: false
        },
        {
          text: 'Latency (ms)',
          class: 'subheading',
          sortable: false
        },
        {
          text: 'Remove',
          class: 'subheading',
          sortable: false
        },
      ]
    }
  },
  computed:
    {
      ...mapState(["activeOrg", "activeDevice", "devices"]),
      devicePeers() {
        return this.activeDevice.peersList.map(item => {
          return {
            text: item.hostname + ' (' + item.ip + ')',
            value: item.ip
          }
        });
      }
    },
  mounted() {
    this.fetchData();
  },
  watch: {
    dialog (val) {
      val ? this.setFocus() : this.close()
    }
  },
  methods:
    {
      fetchData() {
        WanosApi.getPathGateways(this.activeOrg._id, this.activeDevice._id).then(response => {
          this.gateways = response;
        });
        WanosApi.getPathConfig(this.activeOrg._id, this.activeDevice._id).then(response => {
          this.params = response;
        });
      },
      close () {
        this.dialog = false;
        this.$root.$off('validation', this.onValidation);
        // reset to allow creating new items
        setTimeout(() => {
          this.newGateway = Object.assign({}, this.defaultGateway);
        }, 250)
      },
      setFocus () {
        this.$root.$on('validation', this.onValidation);
        this.$nextTick(() => {
          this.$refs.orgName.focus();
        });
      },
      onValidation (err) {
        if (err.code === config.ERR_CODE.VALIDATION || err.validationErrors) {
          const msgs = this.serverValidation;
          for(const elem of err.fieldList || err.validationErrors) {
            msgs[elem.field] = [elem.message];
          }
        }
      },
      async deleteGateway(link) {
        if (confirm('Are you sure you want to remove this gateway?')) {
          try {
            const res = await WanosApi.removePathGateway(this.activeOrg._id, this.activeDevice._id, link.primary ? 'primary' : 'secondary');
            if(res) this.gateways.splice(this.gateways.indexOf(link), 1);
          } catch (err) {
            console.error(err);
          }
        }
      },
      async saveOptions() {
        if(!this.$refs.frmOptions.validate()) {
          return;
        }
        try {
          await WanosApi.savePathConfig(this.activeOrg._id, this.activeDevice._id, this.params);
        } catch (err) {
          console.error(err);
        }
      },
      async addLink() {
        if(!this.$refs.frmLinks.validate()) {
          return;
        }
        try {
          await WanosApi.addPathGateway(this.activeOrg._id, this.activeDevice._id, this.newGateway);
        } catch (err) {
          console.error(err);
        }
      }
    }
}
</script>
