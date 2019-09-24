<template>
  <v-container grid-list-lg fluid class="pt-2">
    <!-- filters -->
    <v-layout row wrap>
      <v-flex xs12>
        <v-card class="elevation-3">
          <v-card-title class="pa-2">
            <h6 class="subheading">Log information</h6>
          </v-card-title>
          <v-card-text>
            <v-layout row wrap justify-center align-center>
              <v-flex xs1>
                <v-select :items="logLevels" v-model="level" label="Display log level"/>
              </v-flex>
              <v-btn color="primary" dark small @click="fetchData">Refresh</v-btn>
            </v-layout>
            <code class="log_view">
                  <span v-for="error in list" v-bind:key="error"
                  v-bind:class="{ text_red: error.includes(': Error :'),
                                  text_orange: error.includes(': Alert :'),
                                  text_black: error.includes(': Info :') || error.includes(': Warn :')}">{{ error.trim() + "\r\n" }}</span>
            </code>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState } from "vuex"
import { WanosApi } from '@/api/wanos.api'
import config from '@/config'

export default
{
  name: 'DiagnosticLog',
  data() {
    return {
      list: [],
      level: this.$route.params.level || 'info',
      logLevels: config.LOG_LEVELS
    }
  },
  computed:
    {
      ...mapState(["activeOrg", "activeDevice", "devices"]),
    },
  created() {
    if(this.$route.params.level) {
      const level = this.$route.params.level;
      if(!this.logLevels.find(item => item.value === level)) this.level = 'info';
    }
  },
  mounted() {
    this.fetchData();
  },
  watch:
    {
      level: 'fetchData'
    },
  methods:
    {
      async fetchData() {
        try {
          this.list = await WanosApi.getDiagnosticLog(this.activeOrg._id, this.activeDevice._id, this.level);
          this.$router.replace({name: 'diagnosticLogLevel', params: {level: this.level}});
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

  div.elevation-3.theme--dark code {
    background-color:#F8F8F8;
  }

  .text_black {
    color: black;
  }

  .text_orange{
    color: orange;
  }

  .text_red{
    color: red;
  }
</style>
