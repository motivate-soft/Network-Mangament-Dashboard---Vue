<template>
  <v-container grid-list-lg fluid class="pt-2">
    <v-layout row wrap>
      <v-flex xs12>
        <v-card class="elevation-3">
          <v-card-title class="pa-2 ">
            <h6 class="subheading">TCP-X policies list</h6>
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
              <v-dialog v-if="policies.length < 100" v-model="dialog" max-width="500px" @keydown.esc="dialog = false">
                <template slot="activator" slot-scope="{on}">
                  <v-btn color="primary" dark class="mb-2" v-on="on">Create</v-btn>
                </template>
                <v-form ref="form" lazy-validation @submit.prevent="save">
                  <v-card>
                    <v-toolbar dark dense color="primary">
                      <v-toolbar-title>{{ formTitle }}</v-toolbar-title>
                    </v-toolbar>

                    <v-card-text>
                      <v-text-field :rules="[rules.required, rules.ipmask]" :error-messages="serverValidation.source" v-model.trim="editedItem.source" required
                                    ref="src" label="Source subnet and mask" type="text" validate-on-blur @focus="serverValidation.source = []" hint="Ex: 10.10.20.0/24"/>
                      <v-text-field :rules="[rules.required, rules.ipmask]" :error-messages="serverValidation.destination" v-model.trim="editedItem.destination" required
                                    label="Destination subnet and mask" type="text" validate-on-blur @focus="serverValidation.destination = []" hint="Ex: 10.10.20.0/24"/>
                      <v-text-field :rules="[rules.anyport]" :error-messages="serverValidation.port" v-model.number="editedItem.port"
                                    label="Port number" type="number" min="1" max="65535" hint="1 - 65535 (or empty for All)" placeholder="Any" validate-on-blur @focus="serverValidation.port = []" />
                      <v-checkbox v-model="editedItem.acceleration" label="TCP-X enabled" class="hide_messages"/>
                    </v-card-text>

                    <v-card-actions>
                      <v-spacer/>
                      <v-btn color="error" dark @click="close">Cancel</v-btn>
                      <v-btn color="success" dark type="submit">Save</v-btn>
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
                <td>{{ props.item.port || 'All-TCP' }}</td>
                <td :class="{'success--text' : props.item.acceleration, 'error--text': !props.item.acceleration}">{{ props.item.acceleration ? 'yes' : 'no' }}</td>
                <td align="center">
                  <template v-if="!props.item.readonly">
                    <div style="width:100px;">
                        <v-icon small class="mr-2 edit-icons" @click="editItem(props.item)">edit</v-icon>
                        <v-icon small class="mr-2 edit-icons" @click="deleteItem(props.item)">delete</v-icon>
                        <v-icon v-if="props.index && !sortedPolicies[props.index-1].readonly" small class="mr-2 edit-icons" @click="moveUp(props.item)">arrow_upward</v-icon>
                        <v-icon v-if="props.index + 1 < policies.length && !sortedPolicies[props.index+1].readonly" small class="mr-2 edit-icons" @click="moveDown(props.item)">arrow_downward</v-icon>
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

export default
{
  name: 'ConfigAcceleration',
  mixins: [ValidationRules],
  data() {
    return {
      search: '',
      dialog: false,
      policies: [],
      editedIndex: -1,
      editedItem: {
        ruleId: null,
        source: null,
        destination: null,
        port: null,
        acceleration: false
      },
      defaultItem: {
        ruleId: null,
        source: null,
        destination: null,
        port: null,
        acceleration: false
      },
      serverValidation:
        {
          source: [],
          destination: [],
          port: [],
        },
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
            text: 'TCP port',
            class: 'subheading',
            sortable: false,
          },
          {
            text: 'TCP-X',
            class: 'subheading',
            sortable: false,
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
    formTitle() {
      return this.editedIndex === -1 ? 'New rule' : 'Edit rule'
    },
    sortedPolicies() {
      return this.policies.slice().sort((a, b) => a.ruleId - b.ruleId);
    },
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
        try {
          this.policies = await WanosApi.getAccelerationRules(this.activeOrg._id, this.activeDevice._id);
        } catch (err) {
          console.error(err);
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
            await WanosApi.removeAccelerationRule(this.activeOrg._id, this.activeDevice._id, item.ruleId);
            this.policies.splice(this.policies.indexOf(item), 1);
          } catch (e) {
            console.error(e);
          }
        }
      },
      async moveUp (item) {
        try {
          await WanosApi.moveAccelerationRule(this.activeOrg._id, this.activeDevice._id, item.ruleId, true);
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
          await WanosApi.moveAccelerationRule(this.activeOrg._id, this.activeDevice._id, item.ruleId, false);
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
          this.editedIndex = -1;
        }, 250)
      },

      async save () {
        if (!this.$refs.form.validate()) {
          return;
        }
        try {
          if (this.editedIndex !== -1) {
            await WanosApi.updateAccelerationRule(this.activeOrg._id, this.activeDevice._id, this.editedItem);
            this.policies.splice(this.editedIndex, this.editedItem);
          } else {
            const res = await WanosApi.addAccelerationRule(this.activeOrg._id, this.activeDevice._id, this.editedItem);
            this.editedItem.ruleId = res.ruleId;
            this.policies.push(this.editedItem);
          }
        } catch (e) {
          console.error(e);
        }
        this.close();
      },

      setFocus () {
        this.$root.$on('validation', this.onValidation);
        this.$nextTick(() => {
          this.$refs.src.focus();
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
