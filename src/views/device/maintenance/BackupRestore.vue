<template>
  <v-container grid-list-lg fluid class="pt-2">
    <v-layout row wrap>
      <v-flex xs12 lg6>
        <v-card class="elevation-3 fill-height">
          <v-card-title class="pa-2 ">
            <h6 class="subheading">Backup</h6>
          </v-card-title>
          <v-card-text>
            <v-spacer class="text-xs-center">
              <v-btn color="primary" dark class="ma-2" @click="backupNow">Backup now</v-btn>
              <v-btn v-if="canUpdate" color="error" class="ma-2" :disabled="selected.length === 0" @click="deleteConfig">Delete selected</v-btn>
            </v-spacer>
            <v-data-table v-model="selected" :headers="headers" :items="backupList" :rows-per-page-items="rowsPerPage" :pagination.sync="pagination" item-key="_id"
                          must-sort select-all>
              <template slot="items" slot-scope="props">
                <td>
                  <v-checkbox v-model="props.selected" primary hide-details />
                </td>
                <td align="center">{{ props.item.version }}</td>
                <td>
                  <a :href="`/api/${activeOrg._id}/device/${activeDevice._id}/maintenance/backup/${props.item._id}`" target="_blank" :download="props.item.filename">{{ props.item.filename }}</a>
                </td>
                <td align="center">{{ props.item.stamp | stampLocale }}</td>
                <td align="center" nowrap>
                  <v-btn v-if="canUpdate" small light color="amber" @click="restoreOnline(props.item)">Restore</v-btn>
                </td>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12 lg6>
        <v-card class="elevation-3 fill-height">
          <v-card-title class="pa-2 ">
            <h6 class="subheading">Restore</h6>
          </v-card-title>
          <v-card-text>
            <v-layout row wrap>
              <v-flex xs12 lg6>
                <v-text-field type="file" ref="file" class="pt-0" hide-details @change.native="chooseFile"/>
              </v-flex>
              <v-flex xs12 lg6>
                <app-progress-linear :value="progress" :text="$options.filters.maxDecimalPoints(progress,1) + '%'" :height="18" :background-opacity="0" color="success" class="mt-3"/>
              </v-flex>
            </v-layout>
          </v-card-text>
          <v-card-actions>
            <v-spacer/>
            <v-btn color="primary" dark class="ma-2" @click="restoreConfig">Upload and restore configuration</v-btn>
            <v-spacer/>
          </v-card-actions>
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
import AppProgressLinear from "@/components/base/AppProgressLinear.vue"

export default
{
  name: 'BackupRestore',
  components:
    {
      AppProgressLinear,
    },
  data() {
    return {
      alertPanel: false,
      alertColor: '',
      alertMsg: '',
      backupList: [],
      selected: [],
      file: null,
      uploading: false,
      progress: 0,
      oldBackupCount: 0,
      timerPoll: null,
      headers:
      [
        {
          text: "Version",
          value: "version",
          class: "subheading",
          align: "center"
        },
        {
          text: "Filename",
          value: "filename",
          class: "subheading",
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
          width: 100
        },
      ],
      rowsPerPage: [
        {
          text: "$vuetify.dataIterator.rowsPerPageAll",
          value: -1
        }, 5, 10, 25],
      pagination: {
        sortBy: "uploadDate",
        descending: true,
        page: 1,
        rowsPerPage: -1 // must be defined or otherwise NextPage button is enabled even if the table is empty
      },
    }
  },
  computed:
    {
      ...mapState(["activeOrg", "activeDevice", "user"]),
      canUpdate () {
        return this.user.role === 'su' || this.user.accessRight === 'w';
      }
    },
  created () {
    this.getBackupList();
  },
  beforeDestroy() {
    if (this.timerPoll) clearTimeout(this.timerPoll);
  },
  methods:
    {
      async getBackupList() {
        try {
          const res = await WanosApi.getBackupList(this.activeOrg._id, this.activeDevice._id);
          if (res) {
            this.selected = [];
            this.pagination.page = 1;
            this.backupList = res.map(item => {
              item.stamp = new Date(item.uploadDate);
              return item;
            });
            if (this.timerPoll) {
              this.timerPoll = null;
              if (this.backupList.length <= this.oldBackupCount) this.timerPoll = setTimeout(this.getBackupList, 8000);
            }
          }
        } catch (err) {
          console.error(err);
        }
      },
      async restoreOnline(backup) {
        try {
          const res = await WanosApi.revertOnlineConfig(this.activeOrg._id, this.activeDevice._id, backup._id);
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
          const res = await WanosApi.deleteOnlineConfig(this.activeOrg._id, this.activeDevice._id, this.selected.map(item => item._id));
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
      async backupNow() {
        try {
          const res = await WanosApi.requestBackupNow(this.activeOrg._id, this.activeDevice._id);
          if (res) {
            this.alertMsg = 'The backup has been scheduled to run and will soon be available in the list of backups.';
            this.alertColor = 'success';
            this.alertPanel = true;
            this.oldBackupCount = this.backupList.length;
            this.timerPoll = setTimeout(this.getBackupList, 8000);
          }
        } catch (err) {
          console.error(err);
        }
      },
      async restoreConfig() {
        if(!this.file) return;
        try {
          this.uploading = true;
          const res = await WanosApi.restoreConfig(this.activeOrg._id, this.activeDevice._id, this.file, this.uploadProgress);
          this.uploading = false;
          this.progress = 0;
          if(res) {
            this.file = null;
            switch (res.compatible) {
              case 1:
                this.alertMsg = 'This configuration is different version so there might be some issues. Please check manually for anything unusual.';
                this.alertColor = 'warning';
                break;
              case 2:
                this.alertMsg = 'This configuration is incompatible with the device.';
                this.alertColor = 'error';
                break;
              default:
                this.alertMsg = 'Configuration has been applied on the device.';
                this.alertColor = 'success';
            }
            this.alertPanel = true;
          }
        } catch (err) {
          console.error(err);
          this.uploading = false;
        }
      },
      uploadProgress(evt) {
        this.progress = Math.round(100 * evt.loaded / evt.total);
      },
      chooseFile(evt) {
        this.file = (evt.dataTransfer || evt.target).files[0];
      }
    }
}
</script>
