<template>
  <div>
    <v-toolbar flat color="transparent">
      <v-toolbar-title>Organizations</v-toolbar-title>
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
      <v-dialog v-model="dialog" scrollable max-width="500px" persistent>
        <template slot="activator" slot-scope="{on}">
          <v-btn v-if="canCreate" color="primary" dark class="mb-2" v-on="on">Create</v-btn>
        </template>
        <v-form ref="form" style="width: 100%;" lazy-validation @submit.prevent="save">
          <!-- without the IF datatable updates the pagination and this causes needless AJAX on first open -->
          <v-card v-if="dialog">
            <v-toolbar dense dark color="primary">
              <v-toolbar-title>{{ formTitle }}</v-toolbar-title>
            </v-toolbar>

            <v-card-text style="max-height: 75vh;">
              <v-text-field v-model="editedItem.name" :rules="[rules.required]" :error-messages="serverValidation.name" label="Organization name" ref="orgName"
                            required validate-on-blur @focus="serverValidation.name = []"/>
              <v-card class="elevation-0">
                <v-toolbar dense flat color="transparent">
                  <v-toolbar-title>Contact person</v-toolbar-title>
                </v-toolbar>
                <v-divider />
                <v-card-text>
                  <v-text-field v-model.trim="editedItem.contact.firstname" :rules="[rules.required]" :error-messages="serverValidation['contact.firstname']" label="First name"
                                name="firstname" browser-autocomplete="given-name" maxlength="128" validate-on-blur @focus="serverValidation['contact.firstname'] = []"/>
                  <v-text-field v-model.trim="editedItem.contact.surname" :rules="[rules.required]" :error-messages="serverValidation['contact.surname']" label="Surname"
                                name="surname" browser-autocomplete="family-name" maxlength="128" validate-on-blur @focus="serverValidation['contact.surname'] = []"/>
                  <v-text-field v-model.trim="editedItem.contact.email" :rules="[rules.required,rules.email]" :error-messages="serverValidation['contact.email']" label="E-mail"
                                type="email" name="email" browser-autocomplete="email" maxlength="64" validate-on-blur @focus="serverValidation['contact.email'] = []"/>
                  <v-text-field v-model.trim="editedItem.contact.phone" :rules="[rules.phone]" :error-messages="serverValidation['contact.phone']" label="Phone"
                                type="tel" name="phone" browser-autocomplete="tel" maxlength="32" validate-on-blur @focus="serverValidation['contact.phone'] = []"/>
                </v-card-text>
              </v-card>
              <v-card class="elevation-0">
                <v-toolbar dense flat color="transparent">
                  <v-toolbar-title >Address</v-toolbar-title>
                </v-toolbar>
                <v-divider />
                <v-card-text>
                  <v-text-field v-model.trim="editedItem.address.line1" :error-messages="serverValidation['address.line1']" label="Line 1"
                                name="address1" browser-autocomplete="address-line1" maxlength="128" validate-on-blur @focus="serverValidation['address.line1'] = []"/>
                  <v-text-field v-model.trim="editedItem.address.line2" :error-messages="serverValidation['address.line2']" label="Line 2"
                                name="address2" browser-autocomplete="address-line2" maxlength="128" validate-on-blur @focus="serverValidation['address.line2'] = []"/>
                  <v-text-field v-model.trim="editedItem.address.line3" :error-messages="serverValidation['address.line3']" label="Line 3"
                                name="address3" browser-autocomplete="address-line3" maxlength="128" validate-on-blur @focus="serverValidation['address.line3'] = []"/>
                  <v-text-field v-model.trim="editedItem.address.city" :error-messages="serverValidation['address.city']" label="City"
                                name="city" browser-autocomplete="address-level2" maxlength="128" validate-on-blur @focus="serverValidation['address.city'] = []"/>
                  <v-autocomplete :error-messages="serverValidation['address.country']" v-model="editedItem.address.country" label="Country"
                                  name="country" browser-autocomplete="country-name" :items="listCountry" prepend-icon="language" validate-on-blur @focus="serverValidation['address.country'] = []"/>
                </v-card-text>
              </v-card>
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
      :items="orgs"
      :search="search"
      :pagination.sync="pagination"
      class="elevation-1"
      must-sort
    >
      <template slot="items" slot-scope="props">
        <td>{{ props.item.name }}</td>
        <td class="text-xs-center">{{ props.item.userCount }}</td>
        <td class="text-xs-center">{{ props.item.deviceCount }}</td>
        <td>{{ props.item.contact ? props.item.contact.firstname : '' }}</td>
        <td>{{ props.item.contact ? props.item.contact.surname : '' }}</td>
        <td>{{ props.item.contact ? props.item.contact.email : '' }}</td>
        <td>{{ (props.item.address ? [props.item.address.line1,props.item.address.line2,props.item.address.line3] : []) | adrLines }}</td>
        <td>{{ props.item.address ? props.item.address.city : '' }}</td>
        <td>{{ props.item.address ? props.item.address.country : '' }}</td>
        <td align="right" width="100">
          <template v-if="props.item.name !== 'Global'">
            <v-icon v-if="canUpdate(props.item)" small class="mr-2 edit-icons" @click="editItem(props.item)">edit</v-icon>
            <v-icon v-if="canUpdate(props.item)" small class="mr-2 edit-icons" @click="deleteItem(props.item)">delete</v-icon>
          </template>
        </td>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex"
import config from '@/config'
import { merge, clone } from '@/plugins/utils'
import countries from '@/json/countryList.json'
import ValidationRules from '@/plugins/validationRules'

export default
{
  name: 'SetupOrganizations',
  mixins: [ValidationRules],
  data() {
    return {
      search: '',
      dialog: false,
      editedIndex: -1,
      editedItem: {
        name: '',
        contact: {
          firstname: null,
          surname: null,
          email: null,
          phone: null
        },
        address: {
          line1: null,
          line2: null,
          line3: null,
          city: null,
          country: null
        }
      },
      defaultItem: {
        name: '',
        contact: {
          firstname: null,
          surname: null,
          email: null,
          phone: null
        },
        address: {
          line1: null,
          line2: null,
          line3: null,
          city: null,
          country: null
        }
      },
      serverValidation:
        {
          name: [],
          'contact.firstname': [],
          'contact.surname': [],
          'contact.email': [],
          'contact.phone': [],
          'address.line1': [],
          'address.line2': [],
          'address.line3': [],
          'address.city': [],
          'address.country': [],
        },
      pagination:
        {
          rowsPerPage: 25
        },
      headers:
      [
        {
          text: 'Org Name',
          value: 'name'
        },
        {
          text: 'Users',
          value: 'users',
          align: 'center',
        },
        {
          text: 'Devices',
          value: 'devices',
          align: 'center',
        },
        {
          text: 'First name',
          value: 'contact.firstname'
        },
        {
          text: 'Surname',
          value: 'contact.surname'
        },
        {
          text: 'E-mail',
          value: 'contact.email'
        },
        {
          text: 'Address',
          sortable: false
        },
        {
          text: 'City',
          value: 'contact.city'
        },
        {
          text: 'Country',
          value: 'contact.country'
        },
        {
          text: 'Actions',
          align: 'right',
          sortable:false
        }
      ]
    }
  },
  filters:
    {
      adrLines(values) {
        return values.filter(item => !!item).join(', ');
      }
    },
  computed: {
    ...mapState(["orgs", "user"]),
    formTitle () {
      return this.editedIndex === -1 ? 'New Organization' : 'Edit Organization'
    },
    canCreate () {
      return this.user.role === 'su' && this.user.accessRight === 'w';
    },
    listCountry() {
      return countries;
    }
  },
  watch: {
    dialog (val) {
      val ? this.setFocus() : this.close()
    }
  },
  methods:
    {
      ...mapActions(['deleteOrg', 'updateOrg', 'addOrg']),
      editItem (item) {
        this.editedIndex = this.orgs.indexOf(item);
        this.editedItem = merge({}, this.defaultItem, item); // Object.assign does not deep-copy - otherwise we mutate Vuex outside of any mutation
        this.dialog = true
      },

      deleteItem (item) {
        if (confirm('Are you sure you want to delete this organization?')) {
          this.deleteOrg(item);
        }
      },

      close () {
        this.dialog = false;
        this.$root.$off('validation', this.onValidation);
        // reset to allow creating new items
        setTimeout(() => {
          this.editedItem = clone(this.defaultItem); // Object.assign does not deep-copy - otherwise we mutate Vuex outside of any mutation
          this.editedIndex = -1;
        }, 250)
      },

      save () {
        if (!this.$refs.form.validate()) {
          return;
        }
        if (this.editedIndex !== -1) {
          this.updateOrg(this.editedItem).then(res => {
            if(res) this.close();
          });
        } else {
          this.addOrg(this.editedItem).then(res => {
            if(res) this.close();
          });
        }
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

      canUpdate (org) {
        return (this.user.role === 'su' || this.user.orgs.includes(org._id)) && this.user.accessRight === 'w';
      }

    }
}
</script>
