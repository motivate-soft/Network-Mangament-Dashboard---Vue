<template>
  <v-layout justify-center>
    <v-card class="elevation-3 mt-5" width="300px">
      <v-card-title class="primary white--text elevation-1">
        <span class="subheading">Change Password</span>
      </v-card-title>
      <v-form ref="form" @submit.prevent="submit">
        <v-card-text>
          <v-layout row wrap>
            <v-flex xs12>
              <v-text-field
                :rules="[rules.required]"
                :error-messages="serverValidation.currentPassword"
                v-model="changePassword.currentPassword"
                ref="pass"
                type="password"
                label="Current password"
                validate-on-blur
                @focus="serverValidation.currentPassword = []"
              />
            </v-flex>
            <v-flex xs12>
              <v-text-field
                :rules="[rules.required]"
                :error-messages="serverValidation.newPassword"
                v-model="changePassword.newPassword"
                label="New password"
                type="password"
                validate-on-blur
                @focus="serverValidation.newPassword = []"
              />
            </v-flex>
            <v-flex xs12>
              <v-text-field
                :rules="[rules.required, rules.passwordMatch]"
                :error-messages="serverValidation.confirmPassword"
                v-model="changePassword.confirmPassword"
                label="Confirm password"
                type="password"
                @focus="serverValidation.confirmPassword = []"
              />
            </v-flex>
          </v-layout>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn color="success" type="submit">Save</v-btn>
          <v-spacer/>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-layout>
</template>

<script>
import { mapState } from "vuex";
import { WanosApi } from "@/api/wanos.api";
import config from '@/config'
import ValidationRules from '@/plugins/validationRules'

export default {
  name: "ChangePassword",
  mixins: [ValidationRules],
  data() {
    return {
      changePassword:
      {
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      },
      serverValidation:
      {
        currentPassword: [],
        newPassword: [],
        confirmPassword: []
      },
      rules:
      {
        passwordMatch: value =>
          value === this.changePassword.newPassword || "Confirm password does not match new password."
      }
    };
  },

  computed: {
    ...mapState(["user"])
  },

  created() {
    this.$root.$on('validation', this.onValidation);
  },
  beforeDestroy() {
    this.$root.$off('validation', this.onValidation);
  },
  mounted() {
    this.$refs.pass.focus();
  },
  methods:
  {
    onValidation(err) {
      if (err.code === config.ERR_CODE.VALIDATION || err.validationErrors) {
        const msgs = this.serverValidation;
        for(const elem of err.fieldList || err.validationErrors) {
          msgs[elem.field] = [elem.message];
        }
      }
    },
    submit() {
      if (!this.$refs.form.validate()) {
        return;
      }
      WanosApi.changePassword(this.user._id, this.changePassword);
    }
  }
};
</script>
