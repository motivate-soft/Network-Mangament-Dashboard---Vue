<template>
  <v-content>
    <v-container fluid fill-height>
      <v-layout align-center justify-center>
        <v-card class="elevation-3" min-width="300">
          <v-card-title>
            <v-img :src="require('@/assets/wanos-logo.png')" aspect-ratio="5" contain/>
            <!-- <v-spacer/> -->
          </v-card-title>
            <h6 class="pa-3 subheading font-weight-medium text-xs-center">Central Manager Login</h6>
          <v-form ref="form"
                  lazy-validation
                  @submit.prevent="submit">
            <v-card-text class="pt-0 pb-0 pl-4 pr-4">
              <v-text-field
                ref="email"
                :rules="[rules.required, rules.email]"
                v-model="credentials.email"
                prepend-icon="person"
                name="email"
                label="Email"
                type="text"
                validate-on-blur
              />
              <v-text-field
                id="password"
                :rules="[rules.required]"
                v-model="credentials.password"
                prepend-icon="lock"
                name="password"
                label="Password"
                type="password"
                validate-on-blur
              />
            </v-card-text>
            <v-card-actions class="pa-3">
              <v-spacer class="text-xs-center">
                <v-btn small color="primary" type="submit">Login</v-btn>
              </v-spacer>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-layout>
    </v-container>
  </v-content>
</template>

<script>
import { mapState, mapActions } from "vuex";
import ValidationRules from '@/plugins/validationRules'

export default {
  name: "Login",
  mixins: [ValidationRules],

  data() {
    return {
      credentials:
      {
        email: "",
        password: ""
      },
    };
  },
  computed:
    {
      ...mapState(['activeDevice']),
    },
  mounted () {
    this.$refs.email.focus();
  },
  methods: {
    ...mapActions(["login"]),
    submit() {
      if (!this.$refs.form.validate()) {
        return;
      }
      this.login(this.credentials);
    }
  }
};
</script>
