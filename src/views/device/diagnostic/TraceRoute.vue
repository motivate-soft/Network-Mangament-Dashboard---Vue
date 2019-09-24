<template>
  <v-container grid-list-lg fluid class="pt-2">
    <!-- filters -->
    <v-layout row wrap>
      <v-flex xs12>
        <v-form ref="form" lazy-validation @submit.prevent="save">
          <v-card class="elevation-3">
            <v-card-title class="pa-2 ">
              <h6 class="subheading">Diagnostic Traceroute</h6>
            </v-card-title>
            <v-card-text>
              <v-layout row wrap justify-center align-center>
                <v-flex xs2>
                  <v-text-field :rules="[rules.required, rules.iphost]" :error-messages="serverValidation.host" v-model.trim="form.host" required
                                ref="host" label="Hostname or IP address" type="text" validate-on-blur @focus="serverValidation.host = []" hint="Ex: 10.10.20.30"/>
                </v-flex>
                <v-flex xs2 justify-center d-flex>
                  <div class="center_checkgroup">
                    <v-checkbox v-model="form.ipv6" label="IPv6" class="hide_messages"/>
                    <v-checkbox v-model="form.icmp" label="Use ICMP" class="hide_messages"/>
                    <v-checkbox v-model="form.lookup" label="Reverse address lookup" class="hide_messages"/>
                  </div>
                </v-flex>
                <v-flex xs1>
                  <v-select v-model="form.hops" :items="hopValues" label="TTL" hint="Max number of hops" persistent-hint/>
                </v-flex>
                <v-flex xs1 justify-center class="center_checkbox">
                  <v-btn color="primary" dark @click="fetchData">Trace route</v-btn>
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
  name: 'DiagnosticTraceroute',
  mixins: [ValidationRules],
  data() {
    return {
      form:
        {
          host: '',
          ipv6: false,
          hops: '20',
          icmp: false,
          lookup: true,
        },
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
      hopValues() {
        const result = [];
        for(let i=1; i<=64; i++) result.push(i.toString());
        return result;
      }
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
          this.list = await WanosApi.getTracerouteResult(this.activeOrg._id, this.activeDevice._id, this.form);
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

  .center_checkgroup
  {
    display: inline-flex;
    flex-direction: column;
    flex: 0 1 auto !important;
    margin: auto;
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
