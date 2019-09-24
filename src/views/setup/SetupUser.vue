<template>
  <div>
    <v-toolbar flat color="transparent">
      <v-toolbar-title>Users</v-toolbar-title>
      <v-spacer/>
      <v-text-field
        v-model="search"
        append-icon="search"
        placeholder="Search"
        single-line
        hide-details
        clearable
        @keydown.esc="search = ''"
      />
      <v-spacer/>
      <v-dialog v-model="dialog" scrollable max-width="500px" persistent>
        <template slot="activator" slot-scope="{on}">
          <v-btn v-if="canUpdate" color="primary" dark class="mb-2" v-on="on">Create</v-btn>
        </template>
        <v-form ref="form" style="width: 100%;" lazy-validation @submit.prevent="save">
          <!-- without the IF datatable updates the pagination and this causes needless AJAX on first open -->
          <v-card v-if="dialog">
            <v-toolbar dense dark color="primary">
              <v-toolbar-title>{{ formTitle }}</v-toolbar-title>
            </v-toolbar>

            <v-card-text style="max-height: 75vh;">
              <v-text-field :rules="[rules.required, rules.email]" :error-messages="serverValidation.email" v-model.trim="editedItem.email" maxlength="65"
                            ref="email" label="E-mail address" type="email" name="email" validate-on-blur browser-autocomplete="email" @focus="serverValidation.email = []"/>
              <v-text-field v-model.trim="editedItem.password" :rules="editedIndex !== -1 ? [] : [rules.required]" :error-messages="serverValidation.password"
                            :append-icon="showPassword ? 'visibility' : 'visibility_off'" :type="showPassword ? 'text' : 'password'" label="New Password"
                            name="password" browser-autocomplete="new-password" maxlength="128" validate-on-blur @focus="serverValidation.password = []" @click:append="showPassword = !showPassword"/>
              <v-text-field v-model.trim="editedItem.confirmPassword" :rules="editedIndex !== -1 ? [] : [rules.required, rules.passwordMatch]" :error-messages="serverValidation.confirmPassword"
                            :append-icon="showPassword ? 'visibility' : 'visibility_off'" :type="showPassword ? 'text' : 'password'" label="Confirm Password" name="confirmPassword"
                            maxlength="128" validate-on-blur @focus="serverValidation.confirmPassword = []" @click:append="showPassword = !showPassword"/>
              <v-text-field v-model.trim="editedItem.firstname" label="First name" name="firstname" :error-messages="serverValidation.firstname" browser-autocomplete="given-name"
                            :rules="[rules.required]" maxlength="128" validate-on-blur @focus="serverValidation.firstname = []"/>
              <v-text-field v-model.trim="editedItem.surname" label="Last name" name="lastname" :error-messages="serverValidation.surname" browser-autocomplete="family-name"
                            :rules="[rules.required]" maxlength="128" validate-on-blur @focus="serverValidation.surname = []"/>
              <v-layout row wrap xs12>
                <v-flex xs6>
                  <v-radio-group v-model="editedItem.role">
                    <v-radio label="Restricted account" value="org"/>
                    <v-radio label="Super-user" value="su"/>
                  </v-radio-group>
                </v-flex>
                <v-flex xs6>
                  <v-radio-group v-model="editedItem.accessRight">
                    <v-radio label="Read-only access" value="r"/>
                    <v-radio label="Write access" value="w"/>
                  </v-radio-group>
                </v-flex>
              </v-layout>
              <v-select v-model="editedItem.orgs" label="Organizations" :items="orgs" item-text="name" item-value="_id" multiple chips :error-messages="serverValidation.orgs"
                        :rules="editedItem.role !== 'su' ? [rules.atLeastOne] : []" validate-on-blur @focus="serverValidation.orgs = []" :disabled="editedItem.role === 'su'"/>
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
      :items="users"
      :search="search"
      :pagination.sync="pagination"
      class="elevation-1"
      must-sort
    >
      <template slot="items" slot-scope="props">
        <td>{{ props.item.email }}</td>
        <td>{{ props.item.firstname }}</td>
        <td>{{ props.item.surname }}</td>
        <td>{{ props.item.role === 'su' ? 'Super-user' : 'Restricted' }}</td>
        <td>{{ props.item.accessRight === 'w' ? 'Write' : 'Read-only' }}</td>
        <td>
          <ul v-if="props.item.orgs && props.item.orgs.length > 1">
            <li v-for="org in props.item.orgs" :key="org">{{ (orgMap[org] || {}).name }}</li>
          </ul>
          <span v-else-if="props.item.orgs && props.item.orgs.length === 1">{{ (orgMap[props.item.orgs[0]] || {}).name }}</span>
        </td>
        <td align="right" width="100">
          <v-icon v-if="canUpdate" small class="mr-2 edit-icons" @click="editItem(props.item)">edit</v-icon>
          <v-icon v-if="props.item._id !== user._id && canUpdate" small class="mr-2 edit-icons" @click="deleteItem(props.item)">delete</v-icon>
        </td>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { WanosApi } from '@/api/wanos.api'
import { mapState } from "vuex"
import config from '@/config'
import ValidationRules from '@/plugins/validationRules'

export default
{
  name: 'SetupUsers',
  mixins: [ValidationRules],
  data() {
    return {
      search: '',
      dialog: false,
      showPassword: false,
      users: [],
      emptyOrg:
      [
        {
          _id: '0',
          name: 'NONE'
        }
      ],
      editedIndex: -1,
      editedItem: {
        email: '',
        password: '',
        confirmPassword: '',
        firstname: '',
        surname: '',
        role: 'org',
        accessRight: 'r',
        orgs: []
      },
      defaultItem: {
        email: '',
        password: '',
        confirmPassword: '',
        firstname: '',
        surname: '',
        role: 'org',
        accessRight: 'r',
        orgs: []
      },
      serverValidation:
        {
          email: [],
          password: [],
          confirmPassword: [],
          firstname: [],
          surname: [],
          orgs: [],
        },
      pagination:
        {
          rowsPerPage: 25
        },
      headers:
        [
          {
            text: 'E-mail',
            value: 'email'
          },
          {
            text: 'First name',
            value: 'firstname',
          },
          {
            text: 'Last name',
            value: 'surname',
          },
          {
            text: 'Role',
            value: 'role',
          },
          {
            text: 'Access rights',
            value: 'accessRight',
          },
          {
            text: 'Organizations',
            value: 'orgs'
          },
          {
            text: 'Actions',
            align: 'right',
            sortable:false
          }
        ],
      rules:
        {
          passwordMatch: value =>
            value === this.editedItem.password || "Confirm password does not match new password.",
          atLeastOne: value => value.length > 0 || "Select at least 1 item."
        }
    }
  },
  computed: {
    ...mapState(["orgs", "user"]),
    formTitle () {
      return this.editedIndex === -1 ? 'New User' : 'Edit User'
    },
    orgMap() {
      const obj = {};
      this.orgs.forEach(item => {
        obj[item._id] = item;
      });
      return obj;
    },
    canUpdate () {
      return this.user.role === 'su' || this.user.accessRight === 'w';
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
        try {
          this.users = await WanosApi.getUsers();
        } catch (e) {
          console.error(e);
        }
      },

      editItem (item) {
        this.editedIndex = this.users.indexOf(item);
        this.editedItem = Object.assign({confirmPassword: ''}, item);
        this.dialog = true
      },

      async deleteItem (item) {
        if (confirm('Are you sure you want to delete this user?')) {
          try {
            const res = await WanosApi.removeUser(item._id);
            if(res) this.users.splice(this.editedIndex, 1);
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
            if(this.editedItem.role === 'su') this.editedItem.orgs = [];
            const res = await WanosApi.updateUser(this.editedItem);
            if(res) {
              this.users.splice(this.editedIndex, 1, this.editedItem);
              this.close();
            }
          } else {
            const res = await WanosApi.addUser(this.editedItem);
            if(res) {
              this.users.push(res.data);
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
          this.$refs.email.focus();
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

    }
}
</script>
