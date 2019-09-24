<template>
  <v-container grid-list-lg fluid class="pt-2">
    <!-- filters -->
    <v-layout row wrap>
      <v-flex xs12>
        <v-form ref="form" lazy-validation @submit.prevent="save">
          <v-card class="elevation-3">
            <v-card-title class="pa-2 ">
              <h6 class="subheading">Diagnostic Ping</h6>
            </v-card-title>
            <v-card-text>
              <v-layout row wrap justify-center align-center>
                <v-flex xs2>
                  <v-text-field :rules="[rules.required, rules.iphost]" :error-messages="serverValidation.host" v-model.trim="form.host" required
                                ref="host" label="Hostname or IP address" type="text" validate-on-blur @focus="serverValidation.host = []" hint="Ex: 10.10.20.30"/>
                </v-flex>
                <!--
                <v-flex xs1 justify-center class="center_checkbox">
                  <v-checkbox v-model="form.ipv6" label="IPv6" class="hide_messages"/>
                </v-flex>
                -->
                <v-flex xs2>
                  <v-slider v-model.number="form.count" label="Count" min="1" max="9" ticks :tick-labels="tickCount" hint="How many echo requests to make" persistent-hint/>
                </v-flex>
                <v-flex xs1 justify-center class="center_checkbox">
                  <v-btn color="primary" dark @click="fetchData">Ping</v-btn>
                </v-flex>
              </v-layout>
              <template v-if="list.length > 0">
                <h2>Results</h2>
                <code class="log_view">{{ list.join("\r\n") }}</code>
              </template>
            </v-card-text>
          </v-card>
        </v-form>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState } from "vuex"
import { WanosApi } from '@/api/wanos.api'
import ValidationRules from '@/plugins/validationRules'

export default
{
  name: 'DiagnosticPing',
  mixins: [ValidationRules],
  data() {
    return {
      form:
        {
          host: '',
          ipv6: false,
          count: 1,
        },
      tickCount: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      list: [],
      serverValidation:
        {
          host: [],
        },
    }
  },
  computed:
    {
      ...mapState(["activeOrg", "activeDevice"]),
    },
  mounted() {
    this.$refs.host.focus();
  },
  methods:
    {
      async fetchData() {
        try {
          if (!this.$refs.form.validate()) {
            return;
          }
          this.list = await WanosApi.getPingResult(this.activeOrg._id, this.activeDevice._id, this.form);
        } catch (err) {
          console.error(err);
        }
      }
    }
}
</script>

<style>
  .log_view
  {
    width: 100%;
    padding: 3px;
    box-shadow:
      0 0 1px -1px rgba(0,0,0,0.2),
      0 0 1px 1px rgba(0,0,0,0.14),
      0 0 3px 1px rgba(0,0,0,0.12);
  }

  .log_view::before
  {
    display: none;
  }

  .center_checkbox .v-input--checkbox
  {
    justify-content: center;
  }

  .hide_messages .v-input__slot
  {
    margin-bottom: 0 !important;
  }

  .hide_messages .v-messages
  {
    min-height: auto;
  }

  .center_checkbox .v-btn
  {
    display: flex;
    margin: auto;
  }
</style>
