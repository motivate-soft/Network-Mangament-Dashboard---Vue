<template>
  <v-container grid-list-lg fluid class="pt-2">
    <v-layout row wrap>
      <v-flex xs12>
        <v-card class="elevation-3">
          <v-card-title class="pa-2 ">
            <h6 class="subheading">Static routes</h6>
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
              <v-dialog v-model="dialog" max-width="500px" @keydown.esc="dialog = false">
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
                      <v-text-field v-model.trim="editedItem.gateway" :rules="[rules.required, rules.ip]" :error-messages="serverValidation.gateway" label="Next hop IP"
                                    validate-on-blur @focus="serverValidation.gateway = []" required/>
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
              :items="policies"
              :search="search"
              hide-actions
              class="striped_table"
            >
              <template slot="items" slot-scope="props">
                <td>{{ props.item.destination }}</td>
                <td>{{ props.item.gateway }}</td>
                <td align="center">
                  <template v-if="!props.item.readonly">
                    <div style="width:150px;">
                        <v-icon small class="mr-2 edit-icons" @click="editItem(props.item)">edit</v-icon>
                        <v-icon small class="mr-2 edit-icons" @click="deleteItem(props.item)">delete</v-icon>
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
  name: 'RoutePolicies',
  mixins: [ValidationRules],
  data() {
    return {
      search: '',
      dialog: false,
      policies: [],
      editedIndex: -1,
      editedItem: {
        ruleId: null,
        destination: null,
        gateway: null,
      },
      defaultItem: {
        ruleId: null,
        destination: null,
        gateway: null,
      },
      serverValidation:
        {
          destination: [],
          gateway: [],
        },
      headers:
        [
          {
            text: 'Network subnet',
            class: 'subheading',
            sortable: false,
          },
          {
            text: 'Gateway IP',
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
    formTitle () {
      return this.editedIndex === -1 ? 'New rule' : 'Edit rule'
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
          this.policies = await WanosApi.getStaticRoutes(this.activeOrg._id, this.activeDevice._id);
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
            await WanosApi.removeStaticRoute(this.activeOrg._id, this.activeDevice._id, item.ruleId);
            this.policies.splice(this.policies.indexOf(item), 1);
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
            await WanosApi.updateStaticRoute(this.activeOrg._id, this.activeDevice._id, this.editedItem);
            this.policies.splice(this.editedIndex, this.editedItem);
          } else {
            const res = await WanosApi.addStaticRoute(this.activeOrg._id, this.activeDevice._id, this.editedItem);
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
