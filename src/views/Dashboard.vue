<template>
  <v-container grid-list-lg fluid class="pt-2">
    <v-layout row wrap>
      <v-flex xs12>
        <v-card class="elevation-3">
          <v-card-title class="pa-2">
            <h6 class="subheading">Map</h6>
            <v-spacer/>
            <v-btn small flat icon class="ma-0"
                   @click.stop="toggleShowDeviceMap">
              <v-icon v-if="showDeviceMap">keyboard_arrow_up</v-icon>
              <v-icon v-else>keyboard_arrow_down</v-icon>
            </v-btn>
          </v-card-title>
          <v-divider/>
          <v-card-text v-if="showDeviceMap">
            <device-map/>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12>
        <v-card class="elevation-3">
          <v-card-title class="pa-2">
            <h6 class="subheading">Devices</h6>
            <v-spacer/>
            <v-btn small flat icon class="ma-0"
                   @click.stop="toggleShowDevices">
              <v-icon v-if="showDeviceMap">keyboard_arrow_up</v-icon>
              <v-icon v-else>keyboard_arrow_down</v-icon>
            </v-btn>
          </v-card-title>
          <v-divider/>
          <v-card-text v-if="showDevices" class="pt-2">
            <devices-table/>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<style scoped>
</style>

<script>
import DeviceMap from "@/components/DeviceMap.vue";
import DevicesTable from "@/components/DevicesTable.vue";

export default {
  name: "Dashboard",

  components:
  {
    DeviceMap,
    DevicesTable
  },

  data() {
    return {
      showDeviceMap: true,
      showDevices: true
    };
  },

  methods:
  {
    toggleShowDeviceMap() {
      this.showDeviceMap = !this.showDeviceMap;
    },
    toggleShowDevices() {
      this.showDevices = !this.showDevices;
    }
  }
};
</script>
