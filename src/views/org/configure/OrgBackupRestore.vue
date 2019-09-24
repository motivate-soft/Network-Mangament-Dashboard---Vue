<template>
  <v-container grid-list-lg fluid class="pt-2">
    <v-layout column>
      <v-flex>
        <v-form ref="frm">
          <v-card class="elevation-3 pb-3">
            <v-card-title class="pa-2 ">
              <h6 class="subheading">Scheduling</h6>
            </v-card-title>
            <v-card-text class="text-xs-center">
              <v-layout class="d-inline-flex" wrap>
                <v-flex xs4>
                  <v-select v-model="period" :items="periodList" label="Period"/>
                </v-flex>
                <v-flex xs4>
                  <v-text-field v-model.number="count" label="Count" hint="How many periods to skip between backups" :rules="[rules.required]"/>
                </v-flex>
                <v-flex xs4>
                  <v-select v-model="time" :items="hourList" label="Time" hint="At what time of the day to take backups"/>
                </v-flex>
              </v-layout>
            </v-card-text>
            <v-card-actions>
              <v-spacer/>
              <v-btn color="primary" dark class="ma-2" @click="saveSchedule">Change</v-btn>
              <v-spacer/>
            </v-card-actions>
            <v-spacer v-if="nextBackup" class="text-xs-center">
              Next backup time &nbsp;&mdash;&nbsp; {{ nextBackup | stampLocale }}
            </v-spacer>
          </v-card>
        </v-form>
      </v-flex>
      <v-flex>
        <v-card class="elevation-3 fill-height">
          <v-card-title class="pa-2 ">
            <h6 class="subheading">Device backups</h6>
          </v-card-title>
          <v-card-text>
            <v-layout>
              <v-spacer/>
              <!--
              <v-btn color="error" class="ma-2" :disabled="selected.length === 0" @click="deleteConfig">Delete selected</v-btn>
              -->
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
            </v-layout>
            <v-data-table :headers="headersMain" :items="backupDevices" :search="search" must-sort item-key="deviceId" class="tbl_backups" hide-actions>
              <template slot="items" slot-scope="row">
                <tr style="cursor: pointer;" @click="row.expanded = !row.expanded">
                  <td>{{ row.item.hostname }}</td>
                  <td align="center">{{ row.item.backups.length }}</td>
                  <td align="center">
                    <v-btn small color="primary" @click.stop="row.expanded = !row.expanded">
                      <v-icon small class="mr-2">{{ row.expanded ? 'arrow_upward' : 'arrow_downward' }}</v-icon>
                      {{ row.expanded ? 'Collapse' : 'Expand'}}
                    </v-btn>
                    <v-btn small color="blue" :disabled="isOffline(row.item.deviceId)" @click.stop="backupNow(row.item)">Backup now</v-btn>
                  </td>
                </tr>
              </template>
              <template slot="expand" slot-scope="props">
                <v-data-table dis-v-model="selected" :headers="headersDetail" :items="props.item.backups" dis-item-key="_id" must-sort dis-select-all hide-actions>
                  <template slot="items" slot-scope="props">
                    <!--
                    <td>
                      <v-checkbox v-model="props.selected" primary hide-details />
                    </td>
                    -->
                    <td align="center">{{ props.item.version }}</td>
                    <td align="center">{{ props.item.stamp | stampLocale }}</td>
                    <td align="center">
                      <v-btn small light color="primary" :href="`/api/${activeOrg._id}/device/${props.item.deviceId}/maintenance/backup/${props.item._id}`" target="_blank" :download="props.item.filename">Download</v-btn>
                      <v-btn v-if="canUpdate" small light color="amber" @click="restoreOnline(props.item)">Restore</v-btn>
                      <v-btn v-if="canUpdate" small light color="error" @click="deleteConfig(props.item)">Delete</v-btn>
                    </td>
                  </template>
                </v-data-table>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-snackbar top multi-line v-model="alertPanel" :color="alertColor">
        <div>{{ alertMsg }}</div>
      </v-snackbar>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState } from "vuex"
import { WanosApi } from '@/api/wanos.api'
import validationRules from '@/plugins/validationRules'

export default
{
  name: 'OrgBackupSchedule',
  mixins: [validationRules],
  data() {
    return {
      alertPanel: false,
      alertColor: '',
      alertMsg: '',
      backupList: [],
      selected: [],
      period: null,
      count: null,
      time: 0,
      nextBackup: null,
      search: '',
      headersMain:
      [
        {
          text: "Device",
          value: "hostname",
          class: "subheading",
        },
        {
          text: "Backups",
          value: "backups",
          class: "subheading",
          align: "center"
        },
        {
          text: "Actions",
          sortable: false,
          class: "subheading",
          align: "center",
        },
      ],
      headersDetail:
        [
          {
            text: "Version",
            value: "version",
            class: "subheading",
            align: "center"
          },
          {
            text: "Date",
            value: "uploadDate",
            class: "subheading",
            align: "center"
          },
          {
            text: "Actions",
            sortable: false,
            class: "subheading",
            align: "center",
          },
        ],
      periodList:
      [
        {
          text: 'None',
          value: 'none'
        },
        {
          text: 'Hourly',
          value: 'hour'
        },
        {
          text: 'Daily',
          value: 'day'
        },
        {
          text: 'Weekly',
          value: 'week'
        },
        {
          text: 'Monthly',
          value: 'month'
        },
      ]
    }
  },
  computed:
    {
      ...mapState(["activeOrg", "activeDevice", "user", 'devicesStats']),
      hourList() {
        const result = [];
        for(let i = 0; i < 24; i++) {
          result.push({
            text: String(i).padStart(2, '0') + ':00',
            value: i
          });
        }
        return result;
      },
      canUpdate () {
        return this.user.role === 'su' || this.user.accessRight === 'w';
      },
      backupDevices() {
        const deviceMap = {};
        const result = [];
        this.backupList.forEach(item => {
          let dev;
          if (!deviceMap[item.deviceId]) {
            dev = {
              backups: [],
              hostname: item.hostname,
              deviceId: item.deviceId,
            };
            deviceMap[item.deviceId] = dev;
            result.push(dev);
          } else dev = deviceMap[item.deviceId];
          dev.backups.push(item);
        });
        return result;
      }
    },
  created () {
    this.getBackupList();
    this.getSchedule();
  },
  methods:
    {
      async getBackupList() {
        try {
          const res = await WanosApi.getOnlineBackups(this.activeOrg._id);
          if (res) {
            this.selected = [];
            this.backupList = res.map(item => {
              item.stamp = new Date(item.uploadDate);
              return item;
            });
          }
        } catch (err) {
          console.error(err);
        }
      },
      async getSchedule() {
        try {
          const res = await WanosApi.getBackupSchedule(this.activeOrg._id);
          if (res) {
            this.period = res.period;
            this.count = res.count;
            this.time = res.time;
            const next = new Date(res.nextBackupTime);
            this.nextBackup = next.getTime() + 1000 * 3600 * 24 * 500 < Date.now() ? null : next;
          }
        } catch (err) {
          console.error(err);
        }
      },
      async saveSchedule() {
        if (!this.$refs.frm.validate()) return;
        try {
          const res = await WanosApi.setBackupSchedule(this.activeOrg._id, this.period, this.count, this.time);
          if (res) {
            this.alertMsg = 'The scheduling settings have been updated.';
            this.alertColor = 'success';
            this.alertPanel = true;
          }
        } catch (err) {
          console.error(err);
        }
      },
      async restoreOnline(backup) {
        try {
          const res = await WanosApi.revertOnlineConfig(this.activeOrg._id, backup.deviceId, backup._id);
          if (res) {
            this.alertMsg = 'The restore procedure has been scheduled on the device.';
            this.alertColor = 'success';
            this.alertPanel = true;
          }
        } catch (err) {
          console.error(err);
        }
      },
      async deleteConfig() {
        try {
          const res = await WanosApi.deleteBackups(this.activeOrg._id, this.selected.map(item => item._id));
          if (res) {
            const deleted = this.selected;
            this.selected = [];
            deleted.forEach(item => {
              const idx = this.backupList.indexOf(item);
              if (idx !== -1) this.backupList.splice(idx, 1);
            });
          }
        } catch (err) {
          console.error(err);
        }
      },
      async backupNow(backup) {
        try {
          const res = await WanosApi.requestBackupNow(this.activeOrg._id, backup.deviceId);
          if (res) {
            this.alertMsg = 'The backup has been scheduled to run and will soon be available in the list of backups.';
            this.alertColor = 'success';
            this.alertPanel = true;
          }
        } catch (err) {
          console.error(err);
        }
      },
      isOffline (deviceId) {
        return !((this.devicesStats || []).find(dev => dev._id === deviceId) || {}).online;
      }
    }
}
</script>

<style>
  .tbl_backups .v-datatable__expand-row .theme--dark.v-table tbody tr
  {
    border-bottom: 1px solid rgba(255,255,255,0.12) !important;
  }

  .tbl_backups .v-datatable__expand-row .theme--light.v-table tbody tr
  {
    border-bottom: 1px solid rgba(0,0,0,0.12) !important;
  }
</style>
