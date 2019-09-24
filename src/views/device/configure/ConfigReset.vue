<template>
  <v-container grid-list-lg fluid class="pa-3">
    <v-layout row>
      <!-- reset counters -->
      <v-flex class="config_reset">
        <v-card class="elevation-3">
          <v-card-title class="pa-2 ">
            <h6 class="subheading">Reset Service</h6>
          </v-card-title>
          <v-card-text>
            <v-layout row justify-center class="ma-auto">
              <v-btn color="primary" class="ma-3" @click="resetCounter('service')">Service</v-btn>
              <v-btn color="primary" class="ma-3" @click="resetCounter('tcp')">TCP-X</v-btn>
              <v-btn color="primary" class="ma-3" @click="resetCounter('datastore')">Datastore</v-btn>
              <v-btn color="primary" class="ma-3" @click="resetCounter('stats')">Statistics</v-btn>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-flex>
      <!-- reset appliance -->
      <v-flex class="config_reset">
        <v-card class="elevation-3">
          <v-card-title class="pa-2 ">
            <h6 class="subheading">Reset Appliance</h6>
          </v-card-title>
          <v-card-text>
            <v-layout row justify-center class="ma-auto">
              <v-btn color="warning" class="ma-3" @click="resetDevice('factory')">Factory defaults</v-btn>
              <v-btn color="warning" class="ma-3" @click="resetDevice('reboot')">Reboot</v-btn>
              <v-btn color="warning" class="ma-3" @click="resetDevice('shutdown')">Shutdown</v-btn>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState } from "vuex"
import { WanosApi } from '@/api/wanos.api'

export default
{
  name: 'ConfigReset',
  computed:
    {
      ...mapState(["activeOrg", "activeDevice"]),
    },
  methods:
    {
      async resetCounter(kind) {
        try {
          await WanosApi.configResetCounter(this.activeOrg._id, this.activeDevice._id, kind);
        } catch (err) {
          console.error(err);
        }
      },
      async resetDevice(kind) {
        try {
          await WanosApi.configResetDevice(this.activeOrg._id, this.activeDevice._id, kind);
        } catch (err) {
          console.error(err);
        }
      },
    }
}
</script>

<style>
  .config_reset .v-card
  {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .config_reset .v-card__text
  {
    flex-grow: 1;
    display: flex;
  }
</style>
