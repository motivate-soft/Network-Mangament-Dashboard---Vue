<template>
  <v-container grid-list-lg fluid class="pt-2">
    <v-layout row wrap>
      <v-flex xs12>
        <v-card class="elevation-3">
          <v-card-title class="pa-2 ">
            <h6 class="subheading">Traffic Policies</h6>
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
              <!-- the "overflow-y: visible" is needed for Vue-MultiSelect or otherwise it looks ugly clipped -->
              <v-dialog v-if="policies.length < 1000" v-model="dialog" max-width="800px" style="overflow-y: visible;" persistent>
                <template slot="activator" slot-scope="{on}">
                  <v-btn color="primary" class="mb-2" v-on="on">Create</v-btn>
                </template>
                <!-- we can not use @submit.prevent because clicking ENTER interferes with the Application multi-select -->
                <v-form ref="form" lazy-validation>
                  <v-card>
                    <v-toolbar dark dense color="primary">
                      <v-toolbar-title>{{ formTitle }}</v-toolbar-title>
                    </v-toolbar>

                    <v-card-text>
                      <v-container grid-list-xl style="padding: 0; padding-top:16px;">
                        <v-layout row wrap>
                          <v-flex xs12 lg6>
                            <v-toolbar flat dark color="primary" height=32px>
                              <h6 class="subheading">Match</h6>
                            </v-toolbar>
                            <v-text-field :rules="[rules.required,validRuleId]" :error-messages="serverValidation.ruleId" v-model.trim="editedItem.ruleId"
                                          ref="rule" label="Rule ID" type="number" min="1" max="999" validate-on-blur @focus="serverValidation.ruleId = []" hint="1 - 999"/>
                            <v-text-field :rules="[rules.ipmask]" :error-messages="serverValidation.source" v-model.trim="editedItem.match.source" placeholder="Any"
                                          label="Source subnet and mask" type="text" validate-on-blur @focus="serverValidation.source = []" hint="Ex: 10.10.20.0/24"/>
                            <v-text-field :rules="[rules.ipmask]" :error-messages="serverValidation.destination" v-model.trim="editedItem.match.destination" placeholder="Any"
                                          label="Destination subnet and mask" type="text" validate-on-blur @focus="serverValidation.destination = []" hint="Ex: 10.10.20.0/24"/>
                            <v-select v-model="editedItem.match.type" :items="matchTypes" label="Match type" hint="Layer 7 application, or Layer 4 port, or DSCP"/>
                            <!-- Application -->
                            <template v-if="editedItem.match.type === 'application'">
                              <multi-select v-model="selectedApplications" :options="applications" label="name" track-by="id" :allow-empty="false"
                                             hide-selected placeholder="Any" multiple @close="appTouch"/>
                              <label v-show="missingApplication" class="v-messages__message error--text">Required field</label>
                            </template>
                            <!--
                            <v-autocomplete v-if="editedItem.match.type === 'application'" v-model="editedItem.match.applicationList" :items="applications" item-text="name" item-value="id"
                                            label="Application" :rules="[rules.required]" :errors="serverValidation.matchValue" @focus="serverValidation.matchValue = []" placeholder="Any"
                                            multiple chips/>
                            -->
                            <!-- Protocol -->
                            <v-select v-if="editedItem.match.type === 'protocol'" v-model="editedItem.match.kind" :items="protocolTypes" label="Protocol" :rules="[rules.required]"/>
                            <v-text-field v-if="editedItem.match.type === 'protocol'" :rules="[rules.arrayPortRanges]" :error-messages="serverValidation.port" v-model.trim="editedItem.match.protocolValue"
                                          label="Port number(s) or a single range" hint="1 - 65535; separate values with comma; use dash for a range" placeholder="Any"
                                          validate-on-blur @focus="serverValidation.port = []" />
                            <!-- DSCP -->
                            <v-select v-if="editedItem.match.type === 'dscp'" v-model="editedItem.match.dscpList" :items="dscpValues" label="DSCP" hint="Match on DSCP marking" :rules="[rules.required]" multiple/>
                          </v-flex>
                          <v-flex xs12 lg6>
                            <v-toolbar flat dark color="primary" height=32px>
                              <h6 class="subheading">Action</h6>
                            </v-toolbar>
                            <v-radio-group v-model="editedItem.action.deny">
                              <v-radio label="Permit packet" :value="false"/>
                              <v-radio label="Deny packet" :value="true"/>
                            </v-radio-group>
                            <v-select v-model="editedItem.action.dscp" :items="dscpValues" label="DSCP" hint="Change DSCP value - default is to preserve it"/>
                            <v-select v-model.number="editedItem.action.group" :items="groupList" label="Class" hint="Group policies to perform a common QoS action" @change="updateQosRate"/>
                            <v-select v-model.number="editedItem.action.qos" :items="('qos' in groups[editedItem.action.group]) ? [currentQos] : qosList"
                                      :disabled="('qos' in groups[editedItem.action.group])" label="QoS" hint="High = low latency, Low = best effort. Each class group has 1 QoS action"/>
                            <v-text-field :rules="editedItem.action.qos === 'shape' ? [rules.required] : []" :error-messages="serverValidation.rate" v-model.number="editedItem.action.rate" label="Rate"
                                          validate-on-blur @focus="serverValidation.rate = []" type="number" min="1" max="100000000" :disabled="editedItem.action.qos !== 'shape'"
                                          :readonly="('qos' in groups[editedItem.action.group])" hint="Rate in Kilobits/sec (kbps) - 1 rate per shaper"/>
                            <v-select v-model="editedItem.action.gateway" :items="pathValues" label="Path selection" hint="Direct traffic out Primary/Secondary gateway. Default makes no change to traffic"/>
                            <v-checkbox v-model="editedItem.action.bypass" label="Bypass" class="hide_messages"/>
                          </v-flex>
                        </v-layout>
                      </v-container>
                    </v-card-text>

                    <v-card-actions>
                      <v-spacer/>
                      <v-btn color="error" dark @click="close">Cancel</v-btn>
                      <v-btn color="success" dark @click="save">Save</v-btn>
                      <v-spacer/>
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
                <td>{{ props.item.ruleId > 0 ? props.item.ruleId : '' }}</td>
                <td>{{ props.item.match.source }}</td>
                <td>{{ props.item.match.destination }}</td>
                <td>{{ props.item.match | appName }}</td>
                <td>{{ props.item.action.deny ? 'deny' : 'permit' }}</td>
                <td>{{ props.item.action.dscp || '-' }}</td>
                <td>{{ props.item.action.group }}</td>
                <td>{{ props.item.action.qos || '-' }}</td>
                <td>
                  <template v-if="props.item.action.qos === 'shape'">{{ props.item.action.rate }} Kbps</template>
                  <template v-else>-</template>
                </td>
                <td>{{ props.item.action.bypass ? '✔' : '' }}</td>
                <td>{{ props.item.action.gateway || '-' }}</td>
                <td>
                    <template v-if="!props.item.readonly">
                      <div style="width:100px">
                          <v-icon small @click="editItem(props.item)" class="mr-2 edit-icons">edit</v-icon>
                          <v-icon small @click="deleteItem(props.item)" class="mr-2 edit-icons">delete</v-icon>
                          <v-icon v-if="props.index && !sortedPolicies[props.index-1].readonly" small @click="moveUp(props.item)" class="mr-2 edit-icons">arrow_upward</v-icon>
                          <v-icon v-if="props.index + 1 < policies.length && !sortedPolicies[props.index+1].readonly" small @click="moveDown(props.item)" class="mr-2 edit-icons">arrow_downward</v-icon>
                      </div>
                    </template>
                </td>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { WanosApi } from '@/api/wanos.api'
import { mapState } from "vuex"
import config from '@/config'
import ValidationRules from '@/plugins/validationRules'
import multiSelect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css'

let protocolsMap = {};

export default
{
  name: 'ConfigTraffic',
  mixins: [ValidationRules],
  components:
    {
      multiSelect,
    },
  data() {
    return {
      search: '',
      dialog: false,
      gateways: [],
      applications: [],
      policies: [],
      selectedApplications: [],
      isTouched: false,
      editedIndex: -1,
      editedItem: {
        ruleId: null,
        match:
          {
            source: null,
            destination: null,
            type: null, // OSI layer
            applicationList: [],
            dscpList: [],
            protocolValue: null,
            kind: null, // TCP/UDP/src/dst (layer 4)
          },
        action:
          {
            deny: false,
            dscp: null,
            group: 0, // class (0 - 16)
            qos: null,
            rate: null,
            gateway: null,
            bypass: false,
          }
      },
      defaultItem: {
        ruleId: null,
        match:
          {
            source: null,
            destination: null,
            type: 'application', // OSI layer
            applicationList: [],
            dscpList: [],
            protocolValue: null,
            kind: null, // TCP/UDP/src/dst (layer 4)
          },
        action:
          {
            deny: false,
            dscp: null,
            group: 0, // class (0 - 16)
            qos: null,
            rate: null,
            gateway: null,
            bypass: false,
          }
      },
      serverValidation:
        {
          source: [],
          destination: [],
          matchValue: [],
          port: [],
          rate: [],
          ruleId: [],
        },
      matchTypes:
      [
        {
          text: 'Application',
          value: 'application'
        },
        {
          text: 'TCP or UDP protocol',
          value: 'protocol'
        },
        {
          text: 'DSCP',
          value: 'dscp'
        }
      ],
      protocolTypes:
      [
        {
          text: 'tcp',
          value: 'tcp'
        },
        {
          text: 'udp',
          value: 'udp'
        },
        {
          text: 'src tcp',
          value: 'src tcp'
        },
        {
          text: 'dst tcp',
          value: 'dst tcp'
        },
        {
          text: 'src udp',
          value: 'src udp'
        },
        {
          text: 'dst udp',
          value: 'dst udp'
        },
      ],
      qosList:
      [
        {
          text: 'Default priority',
          value: null
        },
        {
          text: 'High priority',
          value: 'high'
        },
        {
          text: 'Low priority',
          value: 'low'
        },
        {
          text: 'Shape',
          value: 'shape'
        }
      ],
      headers:
        [
          {
            text: 'Rule #',
            class: 'subheading',
            sortable: false,
          },
          {
            text: 'Source',
            class: 'subheading',
            sortable: false,
          },
          {
            text: 'Destination',
            class: 'subheading',
            sortable: false,
          },
          {
            text: 'Application',
            class: 'subheading',
            sortable: false,
          },
          {
            text: 'Firewall',
            class: 'subheading',
            sortable: false,
          },
          {
            text: 'DSCP',
            class: 'subheading',
            sortable: false,
          },
          {
            text: 'Class',
            class: 'subheading',
            sortable: false,
          },
          {
            text: 'QoS',
            class: 'subheading',
            sortable: false,
          },
          {
            text: 'Rate',
            class: 'subheading',
            sortable: false,
          },
          {
            text: 'Bypass',
            class: 'subheading',
            sortable: false,
          },
          {
            text: 'Gateway',
            class: 'subheading',
            sortable: false,
          },
          {
            text: 'Edit',
            align: 'center',
            class: 'subheading',
            sortable: false,
          }
        ],
      validRuleId: value => {
        return (value > 0 && value < 1000) || 'Rule ID must be between 1 and 999';
      }
    }
  },
  filters:
    {
      appName(value) {
        switch(value.type) {
          case 'application': // Layer 7 application
            return (value.applicationList || []).map(appId => protocolsMap[appId] || appId).join(', ');
          case 'protocol': // TCP or UDP (layer 3)
            return value.kind + ' ' + (value.protocolValue || '');
          case 'dscp':
            return (value.dscpList || []).join(', ');
          case 'interactive':
            return 'Interactive';
          case 'encrypted':
            return 'Encrypted';
          default:
            return 'Any';
        }
      }
    },
  computed: {
    ...mapState(["activeOrg", "activeDevice"]),
    formTitle() {
      return this.editedIndex === -1 ? 'New rule' : 'Edit rule'
    },
    sortedPolicies() {
      return this.policies.slice().sort((a, b) => a.ruleId - b.ruleId);
    },
    dscpValues() {
      return [{text: '-', value: null}].concat(config.DSCP_VALUES.map(value => {
        return {
          text: value,
          value: value
        }
      }));
    },
    groupList() {
      const result = [{text: '-', value: 0}];
      for(let i=1; i<=16; i++) result.push({text: i.toString() + (('qos' in this.groups[i]) ? ' (used)' : ''), value: i});
      return result;
    },
    pathValues() {
      return [{text: 'Default', value: null}].concat(this.gateways);
    },
    groups() {
      const classes = {};
      for (let i=0; i<=16; i++) classes[i] = {};
      this.policies.forEach(policy => {
        if (!classes[policy.action.group]) classes[policy.action.group] = {};
        classes[policy.action.group].qos = policy.action.qos;
        classes[policy.action.group].rate = policy.action.rate;
      });
      return classes;
    },
    currentQos() {
      return this.qosList.find(item => item.value === (this.editedItem && this.editedItem.action ? (this.groups[this.editedItem.action.group] || {}).qos : null));
    },
    nextRuleId() {
      // find the max ruleID
      let maxId = 0;
      this.policies.forEach(item => {
        if(item.ruleId > maxId && !item.readonly) maxId = item.ruleId;
      });
      if(maxId < 999) return maxId + 1;
      const rules = this.sortedPolicies;
      const len = rules.length;
      for(let i = len - 1; i >= 0; i--) {
        if(rules[i].ruleId < rules[i+1].ruleId - 1) {
          return rules[i+1].ruleId - 1;
        }
      }
      return null;
    },
    missingApplication() {
      return this.isTouched && this.selectedApplications.length === 0;
    }
  },
  watch: {
    dialog (val) {
      val ? this.setFocus() : this.close()
    }
  },
  mounted() {
    this.fetchData();
  },
  methods:
    {
      async fetchData() {
        WanosApi.getNetworkProtocols(this.activeOrg._id, this.activeDevice._id).then(response => {
          if (response) {
            this.applications = response;
            protocolsMap = {};
            this.applications.forEach(item => {
              protocolsMap[item.id] = item.name;
            });
          }
        }).catch(err => {
          console.error(err);
        });
        WanosApi.getTrafficRules(this.activeOrg._id, this.activeDevice._id).then(response => {
          if (response) {
            this.policies = response.policyList;
            this.gateways = response.gatewayList;
            this.editedItem.ruleId = this.nextRuleId;
          }
        }).catch(err => {
          console.error(err);
        });
      },
      editItem (item) {
        this.editedIndex = this.policies.indexOf(item);
        this.editedItem = Object.assign({}, item);
        const appList = this.editedItem.match.applicationList;
        this.selectedApplications = this.applications.filter(app => appList.includes(app.id));
        this.isTouched = false;
        this.dialog = true;
      },

      async deleteItem (item) {
        if (confirm('Are you sure you want to delete this rule?')) {
          try {
            await WanosApi.removeTrafficRule(this.activeOrg._id, this.activeDevice._id, item.ruleId);
            this.policies.splice(this.policies.indexOf(item), 1);
          } catch (e) {
            console.error(e);
          }
        }
      },
      async moveUp (item) {
        try {
          await WanosApi.moveTrafficRule(this.activeOrg._id, this.activeDevice._id, item.ruleId, true);
          const rules = this.sortedPolicies;
          const idx = rules.indexOf(item);
          const tmpId = rules[idx-1].ruleId;
          rules[idx-1].ruleId = item.ruleId;
          item.ruleId = tmpId;
        } catch (e) {
          console.error(e);
        }
      },

      async moveDown (item) {
        try {
          await WanosApi.moveTrafficRule(this.activeOrg._id, this.activeDevice._id, item.ruleId, false);
          const rules = this.sortedPolicies;
          const idx = rules.indexOf(item);
          const tmpId = rules[idx+1].ruleId;
          rules[idx+1].ruleId = item.ruleId;
          item.ruleId = tmpId;
        } catch (e) {
          console.error(e);
        }
      },

      close () {
        this.dialog = false;
        this.$root.$off('validation', this.onValidation);
        // reset to allow creating new items
        setTimeout(() => {
          this.editedItem = Object.assign({}, this.defaultItem);
          this.editedItem.ruleId = this.nextRuleId;
          this.selectedApplications = [];
          this.editedIndex = -1;
        }, 250)
      },

      async save () {
        if (!this.$refs.form.validate()) {
          return;
        }
        if (this.editedItem.match.type === 'application' && this.selectedApplications.length === 0) {
          this.isTouched = true;
          return;
        }
        try {
          this.editedItem.match.source = this.editedItem.match.source || '0.0.0.0/0';
          this.editedItem.match.destination = this.editedItem.match.destination || '0.0.0.0/0';
          const data = Object.assign({}, this.editedItem);
          data.match.applicationList = this.selectedApplications.map(item => item.id);
          if (this.editedIndex !== -1) {
            await WanosApi.updateTrafficRule(this.activeOrg._id, this.activeDevice._id, data);
            this.policies.splice(this.editedIndex, data);
            this.close();
          } else {
            const res = await WanosApi.addTrafficRule(this.activeOrg._id, this.activeDevice._id, data);
            if (res) {
              this.policies.push(res);
              this.close();
            }
          }
        } catch (e) {
          console.error(e);
        }
      },

      setFocus () {
        this.$root.$on('validation', this.onValidation);
        this.$nextTick(() => {
          this.$refs.rule.focus();
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

      updateQosRate () {
        this.editedItem.action.qos = (this.groups[this.editedItem.action.group] || {}).qos;
        this.editedItem.action.rate = (this.groups[this.editedItem.action.group] || {}).rate;
      },

      appTouch() {
        this.isTouched = true;
      }
    }
}
</script>

<style>
  .hide_messages .v-input__slot
  {
    margin-bottom: 0 !important;
  }

  .hide_messages .v-messages
  {
    min-height: auto;
  }
</style>
