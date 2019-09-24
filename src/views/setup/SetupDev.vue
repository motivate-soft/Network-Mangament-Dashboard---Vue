<template>
  <div>
    <v-toolbar flat color="transparent">
      <v-toolbar-title>Devices</v-toolbar-title>
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
        <v-form ref="form" style="width: 100%;" lazy-validation @submit.prevent="save">
          <!-- without the IF datatable updates the pagination and this causes needless AJAX on first open -->
          <v-card v-if="dialog">
            <v-toolbar dense dark color="primary">
              <v-toolbar-title>Edit Device</v-toolbar-title>
            </v-toolbar>

            <v-card-text style="max-height: 75vh;">
              <v-card class="mb-3">
                <v-toolbar dense dark color="primary">
                  <v-toolbar-title>Location</v-toolbar-title>
                </v-toolbar>
                <v-card-text>
                  <v-text-field v-model.number="editedItem.loc.lng" label="GPS longitude" type="number" min="-180" max="+180" step="0.00001" :error-messages="serverValidation['loc.lng']"
                                validate-on-blur @focus="serverValidation['loc.lng'] = []" :rules="[rules.required]"/>
                  <v-text-field v-model.number="editedItem.loc.lat" label="GPS latitude" type="number" min="-90" max="+90" step="0.00001" :error-messages="serverValidation['loc.lat']"
                                validate-on-blur @focus="serverValidation['loc.lat'] = []" :rules="[rules.required]"/>
                  <v-select v-model="editedItem.orgId" label="Organization" :items="filteredOrgs" ref="orgName" item-text="name" item-value="_id"
                            :error-messages="serverValidation.orgId" :rules="[rules.required]" validate-on-blur @focus="serverValidation.orgId = []"/>
                </v-card-text>
              </v-card>
              <v-card class="mb-3">
                <v-toolbar dense dark color="primary">
                  <v-toolbar-title>Contact person</v-toolbar-title>
                </v-toolbar>
                <v-card-text>
                  <v-text-field v-model.trim="editedItem.contact.firstname" :error-messages="serverValidation['contact.firstname']" label="First name"
                                name="firstname" browser-autocomplete="given-name" maxlength="128" validate-on-blur @focus="serverValidation['contact.firstname'] = []"/>
                  <v-text-field v-model.trim="editedItem.contact.surname" :error-messages="serverValidation['contact.surname']" label="Surname"
                                name="surname" browser-autocomplete="family-name" maxlength="128" validate-on-blur @focus="serverValidation['contact.surname'] = []"/>
                  <v-text-field v-model.trim="editedItem.contact.email" :rules="[rules.email]" :error-messages="serverValidation['contact.email']" label="E-mail"
                                type="email" name="email" browser-autocomplete="email" maxlength="64" validate-on-blur @focus="serverValidation['contact.email'] = []"/>
                  <v-text-field v-model.trim="editedItem.contact.phone" :rules="[rules.phone]" :error-messages="serverValidation['contact.phone']" label="Phone"
                                type="tel" name="phone" browser-autocomplete="tel" maxlength="32" validate-on-blur @focus="serverValidation['contact.phone'] = []"/>
                </v-card-text>
              </v-card>
              <v-card class="mb-3">
                <v-toolbar dense dark color="primary">
                  <v-toolbar-title>Address</v-toolbar-title>
                </v-toolbar>
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
      :items="deviceList"
      :search="search"
      :pagination.sync="pagination"
      class="elevation-1"
      must-sort
    >
      <template slot="items" slot-scope="props">
        <tr align="center">
          <td align="left">{{ props.item.hostname }}</td>
          <td>{{ props.item.ip }}</td>
          <td>{{ props.item.wanosVersion }}</td>
          <td>{{ props.item.loc.lng }}</td>
          <td>{{ props.item.loc.lat }}</td>
          <td>
            <v-icon v-if="props.item.online" color="success">check_circle</v-icon>
            <v-icon v-if="!props.item.online" color="error">error</v-icon>
          </td>
          <td>{{ (orgMap[props.item.orgId] || {}).name }}</td>
          <td align="right" width="100">
            <v-icon v-if="canUpdate(props.item)" small class="mr-2 edit-icons" @click="editItem(props.item)">edit</v-icon>
            <v-icon v-if="canDelete(props.item)" small class="mr-2 edit-icons" @click="deleteItem(props.item)">delete</v-icon>
          </td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex"
import { WanosApi } from '@/api/wanos.api'
import config from '@/config'
import { merge } from '@/plugins/utils'
import countries from '@/json/countryList.json'
import ValidationRules from '@/plugins/validationRules'

export default
{
  name: 'SetupDevices',
  mixins: [ValidationRules],
  data() {
    return {
      search: '',
      dialog: false,
      deviceList: [],
      editedIndex: -1,
      editedItem: {
        loc:
          {
            lng: null,
            lat: null
          },
        orgId: null,
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
        loc:
        {
          lng: null,
          lat: null
        },
        orgId: null,
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
          'loc.lng': [],
          'loc.lat': [],
          orgId: [],
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
            text: 'Hostname',
            value: 'hostname'
          },
          {
            text: 'IP address',
            value: 'ip',
            align: 'center',
          },
          {
            text: 'Wanos',
            value: 'wanosVersion',
            align: 'center',
          },
          {
            text: 'Longitude',
            value: 'loc.lng',
            align: 'center',
          },
          {
            text: 'Latitude',
            value: 'loc.lat',
            align: 'center',
          },
          {
            text: 'Online',
            value: 'online',
            align: 'center',
          },
          {
            text: 'Organization',
            value: 'orgId',
            align: 'center',
          },
          {
            text: 'Actions',
            align: 'right',
            sortable:false
          }
        ]
    }
  },
  computed: {
    ...mapState(["orgs", "user"]),
    filteredOrgs() {
      if (this.user.role === 'su') return this.orgs;
      const userOrgs = this.user.orgs;
      return this.orgs.filter(org => userOrgs.includes(org._id));
    },
    orgMap() {
      const obj = {};
      this.filteredOrgs.forEach(item => {
        obj[item._id] = item;
      });
      return obj;
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
  mounted() {
    this.fetchData();
  },
  methods:
    {
      ...mapActions(['deleteDevice', 'updateDevice']),

      async fetchData() {
        try {
          this.deviceList = await WanosApi.getAllDevices();
        } catch (e) {
          console.error(e);
        }
      },

      editItem (item) {
        this.editedIndex = this.deviceList.indexOf(item);
        this.editedItem = merge({}, this.defaultItem, item);
        this.dialog = true
      },

      deleteItem (item) {
        if (confirm('Are you sure you want to delete this device?')) {
          this.deleteDevice(item).then(() => {
            const idx = this.deviceList.indexOf(item);
            this.deviceList.splice(idx, 1);
          });
        }
      },

      close () {
        this.dialog = false;
        this.$root.$off('validation', this.onValidation);
      },

      save () {
        if (!this.$refs.form.validate()) {
          return;
        }
        if (this.editedIndex !== -1) {
          this.updateDevice(this.editedItem).then(res => {
            if(res) {
              this.deviceList.splice(this.editedIndex, 1, this.editedItem);
              this.close();
            }
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

      canDelete (dev) {
        return this.canUpdate(dev) && !dev.online;
      },

      canUpdate (dev) {
        return (this.user.role === 'su' || this.user.orgs.includes(dev.orgId)) && this.user.accessRight === 'w';
      }
    }
}
</script>
