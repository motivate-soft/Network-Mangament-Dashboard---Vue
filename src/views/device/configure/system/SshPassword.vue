<template>
  <v-layout justify-center>
    <v-form ref="form" lazy-validation @submit.prevent="submit">
      <v-card class="elevation-3" min-width="500px">
        <v-card-title class="pa-2 ">
          <h6 class="subheading">Change SSH password</h6>
        </v-card-title>
        <v-card-text>
          <v-text-field
            :rules="[rules.required]"
            :error-messages="serverValidation.newPassword"
            v-model="changePassword.newPassword"
            :append-icon="showPassword ? 'visibility' : 'visibility_off'"
            :type="showPassword ? 'text' : 'password'"
            label="New password"
            validate-on-blur
            @focus="serverValidation.newPassword = []"
            @click:append="showPassword = !showPassword"
          />
          <v-text-field
            :rules="[rules.required, rules.passwordMatch]"
            :error-messages="serverValidation.confirmPass"
            v-model="changePassword.confirmPass"
            :append-icon="showPassword ? 'visibility' : 'visibility_off'"
            :type="showPassword ? 'text' : 'password'"
            label="Confirm password"
            validate-on-blur
            @focus="serverValidation.confirmPass = []"
            @click:append="showPassword = !showPassword"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn color="success" dark type="submit">Save</v-btn>
          <v-spacer/>
        </v-card-actions>
      </v-card>
    </v-form>
    <v-snackbar top multi-line v-model="alert" color="green">
      <div><b>Success!</b>&nbsp;SSH password was changed.</div>
    </v-snackbar>
  </v-layout>
</template>

<script>
import { mapState } from "vuex";
import { WanosApi } from "@/api/wanos.api";
import config from '@/config'
import ValidationRules from '@/plugins/validationRules'

export default
{
  name: "SshPassword",
  mixins: [ValidationRules],

  data() {
    return {
      showPassword: false,
      alert: false,
      changePassword:
        {
          newPassword: "",
          confirmPass: ""
        },
      serverValidation:
        {
          newPassword: [],
          confirmPass: []
        },
      rules:
        {
          required: value => !!value || "Required.",
          passwordMatch: value =>
            value === this.changePassword.newPassword || "Confirm password does not match new password."
        }
    };
  },

  computed: {
    ...mapState(["activeOrg", "activeDevice"]),
  },

  created() {
    this.$root.$on('validation', this.onValidation);
  },
  beforeDestroy() {
    this.$root.$off('validation', this.onValidation);
  },
  methods:
    {
      async submit() {
        if (!this.$refs.form.validate()) {
          return;
        }
        try {
          await WanosApi.configChangePassword(this.activeOrg._id, this.activeDevice._id, this.changePassword);
          this.changePassword = {
            newPassword: null,
            confirmPass: null
          };
          this.alert = true;
        } catch (err) {
          console.error(err);
        }
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
};
</script>
