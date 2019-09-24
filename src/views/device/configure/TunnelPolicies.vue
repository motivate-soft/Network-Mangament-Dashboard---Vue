<template>
  <v-container grid-list-lg fluid class="pt-2">
    <v-layout row wrap>
      <v-flex xs12>
        <v-card class="elevation-3">
          <v-card-title class="pa-2 ">
            <h6 class="subheading">Tunnel route policies</h6>
          </v-card-title>
          <v-card-text>
            <v-toolbar flat color="transparent">
              <v-spacer/>
              <v-text-field
                v-model="search"
                append-icon="search"
                label="Search"
                single-line
                hide-details
                clearable
                @keydown.esc="search = ''"
              />
              <v-spacer/>
              <v-dialog v-if="policies.length < 1000" v-model="dialog" max-width="500px" @keydown.esc="dialog = false">
                <template slot="activator" slot-scope="{on}">
                  <v-btn color="primary" dark class="mb-2" v-on="on">Create</v-btn>
                </template>
                <v-form ref="form" lazy-validation @submit.prevent="save">
                  <v-card>
                    <v-toolbar dark dense color="primary">
                      <v-toolbar-title>{{ formTitle }}</v-toolbar-title>
                    </v-toolbar>

                    <v-card-text>
                      <v-text-field :rules="[rules.required, rules.ipmask]" :error-messages="serverValidation.destination" v-model.trim="editedItem.destination" required
                                    ref="dest" label="Destination subnet and mask" type="text" validate-on-blur @focus="serverValidation.destination = []" hint="Ex: 10.10.20.0/24"/>
                      <v-select v-model="editedItem.tunnelId" :items="tunnelList" label="Tunnel ID" hint="Link multiple subnets"/>
                      <v-text-field v-model.trim="editedItem.peerIp" :rules="editedItem.tunnelId ? [rules.required, rules.ip] : []" :error-messages="serverValidation.peerIp" label="Remote Peer IP"
                                    validate-on-blur @focus="serverValidation.peerIp = []" :disabled="!editedItem.tunnelId"/>
                      <v-text-field v-model.trim="editedItem.sharedKey" :rules="requireKey ? [rules.required, rules.sharedKey] : []" :error-messages="serverValidation.sharedKey"
                                    label="Pre-Shared key" validate-on-blur @focus="serverValidation.sharedKey = []" :disabled="!requireKey"
                                    hint="35 character key. First 3 symbols must be unique for each tunnel ID"/>
                      <v-text-field v-model.trim="editedItem.description" label="Description" validate-on-blur hint="Name, comment or description"/>
                    </v-card-text>

                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="error" dark @click="close">Cancel</v-btn>
                      <v-btn color="success" dark type="submit">Save</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-form>
              </v-dialog>
            </v-toolbar>
            <v-data-table
              :headers="headers"
              :items="sortedPolicies"
              :search="search"
              hide-actions
              class="striped_table"
            >
              <template slot="items" slot-scope="props">
                <td>{{ props.item.destination }}</td>
                <td>{{ props.item.tunnelId || '-' }}</td>
                <td>{{ props.item.peerIp || 'Not Tunneled' }}</td>
                <td>{{ props.item.sharedKey || '-' }}</td>
                <td>{{ props.item.description }}</td>
                <td align="center">
                  <template v-if="props.item.ruleId !== 1000">
                    <div style="width:150px;">
                        <v-icon small @click="editItem(props.item)" class="mr-2 edit-icons">edit</v-icon>
                        <v-icon small @click="deleteItem(props.item)" class="mr-2 edit-icons">delete</v-icon>
                    </div>
                  </template>
                </td>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
        <v-snackbar top right v-model="snackbar" color="success">
          <div>Policy updated.</div>
        </v-snackbar>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { WanosApi } from '@/api/wanos.api'
import { mapState } from "vuex"
import config from '@/config'
import ValidationRules from '@/plugins/validationRules'

export default
{
  name: 'TunnelPolicies',
  mixins: [ValidationRules],
  data() {
    return {
      search: '',
      dialog: false,
      policies: [],
      requireKey: false,
      snackbar: false,
      editedIndex: -1,
      editedItem: {
        ruleId: null,
        destination: null,
        tunnelId: 1,
        peerIp: null,
        sharedKey: null,
        description: null,
      },
      defaultItem: {
        ruleId: null,
        destination: null,
        tunnelId: 1,
        peerIp: null,
        sharedKey: null,
        description: null,
      },
      serverValidation:
        {
          destination: [],
          tunnelId: [],
          peerIp: [],
          sharedKey: [],
        },
      headers:
        [
          {
            text: 'Tunnel Destination Subnets',
            class: 'subheading',
            sortable: false,
            value: 'destination',
          },
          {
            text: 'Tunnel ID',
            class: 'subheading',
            sortable: false,
            value: 'tunnelId',
          },
          {
            text: 'Tunnel Peer IP',
            class: 'subheading',
            sortable: false,
            value: 'peerIp',
          },
          {
            text: 'Pre-Shared Key',
            class: 'subheading',
            sortable: false,
            value: 'sharedKey',
          },
          {
            text: 'Description',
            class: 'subheading',
            sortable: false,
            value: 'description',
          },
          {
            text: 'Actions',
            align: 'center',
            class: 'subheading',
            sortable: false,
          }
        ],
    }
  },
  computed: {
    ...mapState(["activeOrg", "activeDevice"]),
    formTitle () {
      return this.editedIndex === -1 ? 'New rule' : 'Edit rule'
    },
    sortedPolicies() {
      return this.policies.slice().sort((a, b) => {
        if (a.tunnelId && b.tunnelId) return a.tunnelId - b.tunnelId;
        if (a.tunnelId && !b.tunnelId) return -1;
        if (!a.tunnelId && b.tunnelId) return 1;
        const d1 = a.description.toLowerCase();
        const d2 = b.description.toLowerCase();
        if (d1 === 'default' && d2 !== 'default') return 1;
        if (d1 !== 'default' && d2 === 'default') return -1;
        return 0;
      });
    },
    tunnelList() {
      let maxId = 0;
      const tunnels = this.policies.map(item => item.tunnelId).filter((value, index, self) => {
        if(value > maxId) maxId = value;
        return self.indexOf(value) === index;
      });
      return tunnels.sort().map(item => {
        return {
          value: item,
          text: item ? item : 'None (excluded)'
        }
      }).concat([{
        value: maxId + 1,
        text: (maxId + 1) + ' (New)'
      },
        {
          value: 0,
          text: 'None (excluded)'
        }]);
    }
  },
  watch: {
    dialog (val) {
      val ? this.setFocus() : this.close()
    },
    'editedItem.tunnelId' (val) {
      this.editedItem.peerIp = val && this.editedIndex >= 0 ? this.policies[this.editedIndex].peerIp : 'Not Tunneled';
    }
  },
  mounted() {
    this.fetchData();
  },
  methods:
    {
      async fetchData() {
        try {
          const res = await WanosApi.getTunnelRules(this.activeOrg._id, this.activeDevice._id);
          this.policies = res.ruleList;
          this.requireKey = res.requireKey;
        } catch (e) {
          console.error(e);
        }
      },
      editItem (item) {
        this.editedIndex = this.policies.indexOf(item);
        this.editedItem = Object.assign({}, item);
        this.dialog = true
      },

      async deleteItem (item) {
        if (confirm('Are you sure you want to delete this rule?')) {
          try {
            await WanosApi.removeTunnelRule(this.activeOrg._id, this.activeDevice._id, item.ruleId);
            this.policies.splice(this.policies.indexOf(item), 1);
            this.snackbar = true;
          } catch (e) {
            console.error(e);
          }
        }
      },

      close () {
        this.dialog = false;
        this.$root.$off('validation', this.onValidation);
        // reset to allow creating new items
        setTimeout(() => {
          this.editedItem = Object.assign({}, this.defaultItem);
          this.editedIndex = -1;
        }, 250)
      },

      async save () {
        if (!this.$refs.form.validate()) {
          return;
        }
        try {
          if (this.editedIndex !== -1) {
            await WanosApi.updateTunnelRule(this.activeOrg._id, this.activeDevice._id, this.editedItem);
            this.policies.splice(this.editedIndex, this.editedItem);
          } else {
            const res = await WanosApi.addTunnelRule(this.activeOrg._id, this.activeDevice._id, this.editedItem);
            this.editedItem.ruleId = res.ruleId;
            this.policies.push(this.editedItem);
          }
          this.snackbar = true;
        } catch (e) {
          console.error(e);
        }
        this.close();
      },

      setFocus () {
        this.$root.$on('validation', this.onValidation);
        this.$nextTick(() => {
          this.$refs.dest.focus();
        });
      },

      onValidation (err) {
        if (err.code === config.ERR_CODE.VALIDATION || err.validationErrors) {
          const msgs = this.serverValidation;
          for(const elem of err.fieldList || err.validationErrors) {
            msgs[elem.field] = [elem.message];
          }
        }
      }
    }
}
</script>
