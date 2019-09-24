<template>
  <div>
    <v-toolbar flat color="transparent">
      <v-toolbar-title>System Settings</v-toolbar-title>
    </v-toolbar>

    <v-layout row wrap>
      <v-flex xs12 sm6>
        <v-card>
          <v-subheader>Network</v-subheader>
            <div v-for="(iface, i) in interfaces" :key="i">
              <v-subheader v-if="interfaces.length > 1">Configuration for {{iface.name}} interface</v-subheader>
              <v-divider/>

              <div class="pl-3">
                <v-switch v-model="iface.dhcp" label="DHCP" hint="Obtain an IP address automatically" persistent-hint/>
              </div>

              <v-slide-y-transition>
                <v-list subheader three-line v-show="!iface.dhcp">
                  <v-card flat>
                    <v-card-text>
                      <v-form ref="form" lazy-validation @submit.prevent="submit">
                        <v-text-field
                          v-model="iface.ip"
                          :rules="[rules.required, rules.ip]"
                          label="IP address"
                          validate-on-blur
                          required/>
                        <v-text-field
                          v-model="iface.netmask"
                          :rules="[rules.required, rules.ip]"
                          label="Subnet mask"
                          validate-on-blur
                          required/>
                        <v-text-field
                          v-model="iface.gateway"
                          :rules="[rules.required, rules.ip]"
                          label="Default Gateway"
                          class="mb-4"
                          validate-on-blur
                          required/>

                        <v-text-field
                          v-model="iface.ns1"
                          :rules="[rules.required, rules.ip]"
                          label="Primary DNS Server"
                          validate-on-blur
                          required/>
                        <v-text-field
                          v-model="iface.ns2"
                          :rules="[rules.ip]"
                          label="Secondary DNS Server"
                          validate-on-blur/>
                      </v-form>
                    </v-card-text>
                  </v-card>
                </v-list>
              </v-slide-y-transition>
            </div>

          <v-card-actions>
            <v-layout align-center justify-end>
              <v-btn color="primary" dark class="ma-2" @click="saveNetworkConfig">Apply now</v-btn>
            </v-layout>
          </v-card-actions>
        </v-card>
      </v-flex>

      <v-flex xs12 sm6>
        <v-card>
          <v-subheader>Administration</v-subheader>
          <v-list three-line>
            <v-list-tile @click="factoryReset">
              <v-list-tile-action><v-icon color="error">restore</v-icon></v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Factory Reset</v-list-tile-title>
                <v-list-tile-sub-title>
                  Restore WCM to factory defaults.<br/>
                  All data including configuration will be lost.
                </v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>

            <v-list-tile @click="restartNow">
              <v-list-tile-action><v-icon color="warning">loop</v-icon></v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Restart Now</v-list-tile-title>
                <v-list-tile-sub-title>
                  The server will be restarted immediately.<br/>
                  Settings and data will be saved.
                </v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>

            <v-list-tile @click="shutdownNow">
              <v-list-tile-action><v-icon color="warning">power_off</v-icon></v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Shutdown Now</v-list-tile-title>
                <v-list-tile-sub-title>The server will be powered off immediately.</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-card>
      </v-flex>
    </v-layout>

    <v-dialog v-model="confirmPopup" max-width="390">
      <v-card>
        <v-card-title class="headline">Confirmation</v-card-title>

        <v-card-text> {{alertMessage}}<br/>Are you sure to continue?</v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="warning darken-1" text @click="confirm">Yes</v-btn>
          <v-btn color="green darken-1" text @click="reject">No</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex"
import { WanosApi } from '@/api/wanos.api'
import ValidationRules from '@/plugins/validationRules'

export default
{
  name: 'SetupSystem',
  mixins: [ValidationRules],
  data() {
    return {
      alertMessage: '',
      confirmPopup: false,
      interfaces: [{
        interface: 'eth0',
        dhcp: true,
        ip: '192.168.0.100',
        netmask: '255.255.255.0',
        gateway: '192.168.0.1',
        ns1: '8.8.8.8',
        ns2: '8.8.4.4',
      }]
    }
  },
  computed: {
    ...mapState(["orgs", "user"]),
  },
  watch: {
  },
  mounted() {
    this.fetchData();
  },
  methods:
    {
      ...mapActions(['deleteDevice', 'updateDevice']),

      async fetchData() {
        let interfaces = await WanosApi.getLocalNetwork();
        if (interfaces && interfaces.length > 0) {
          this.interfaces = interfaces;
        }
      },

      confirm() {
        this.confirmed = true;
        this.confirmPopup = false;
      },

      reject() {
        this.confirmed = false;
        this.confirmPopup = false;
      },

      factoryReset() {
        this.alertMessage = "All of data and configuration settings will be lost."
        this.confirmPopup = true;
        let unwatch = this.$watch('confirmPopup', ()=> {
          unwatch();
          if (this.confirmed) {
            WanosApi.sysFactoryReset();
          }
        });
      },

      restartNow() {
        this.alertMessage = "WCM server will restart and be temporally unavailable."
        this.confirmPopup = true;
        let unwatch = this.$watch('confirmPopup', ()=> {
          unwatch();
          if (this.confirmed) {
            WanosApi.sysReboot();
          }
        });
      },

      shutdownNow() {
        this.alertMessage = "WCM server will be turned off and thus become unavailable."
        this.confirmPopup = true;
        let unwatch = this.$watch('confirmPopup', ()=> {
          unwatch();
          if (this.confirmed) {
            WanosApi.sysPowerOff();
          }
        });
      },

      saveNetworkConfig() {
        WanosApi.setLocalNetwork({network: this.interfaces});
      },

    }
}
</script>
