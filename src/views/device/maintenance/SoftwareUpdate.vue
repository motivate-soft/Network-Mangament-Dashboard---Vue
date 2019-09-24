<template>
  <v-layout justify-center>
    <v-card class="elevation-3 mt-3" width="500px">
      <v-card-title class="">
        <h6 class="subheading">Software update &mdash; upload, install and reboot</h6>
      </v-card-title>
      <v-card-text>
        <v-layout row wrap>
          <v-flex xs12>
            <v-text-field type="file" ref="file" class="pt-0" hide-details @change.native="chooseFile"/>
          </v-flex>
          <v-flex xs12 v-if="uploading">
            <app-progress-linear :value="progress" :text="progress | maxDecimalPoints(1) + '%'" :height="18" :background-opacity="0" color="success" class="mt-4"/>
          </v-flex>
        </v-layout>
      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn color="success" dark class="mb-2" @click="updateSoftware">Upload system image</v-btn>
        <v-spacer/>
      </v-card-actions>
    </v-card>
    <v-snackbar top multi-line v-model="alert" color="green">
      <div><b>Success!</b>&nbsp;The device will reboot now.</div>
    </v-snackbar>
  </v-layout>
</template>

<script>
import { mapState } from "vuex"
import { WanosApi } from '@/api/wanos.api'
import AppProgressLinear from "@/components/base/AppProgressLinear.vue"

export default
{
  name: 'SoftwareUpdate',
  components:
    {
      AppProgressLinear,
    },
  data() {
    return {
      alert: false,
      file: null,
      uploading: false,
      progress: 0,
    }
  },
  computed:
    {
      ...mapState(["activeOrg", "activeDevice"]),
    },
  methods:
    {
      async updateSoftware() {
        if(!this.file) return;
        try {
          this.uploading = true;
          const res = await WanosApi.updateSoftware(this.activeOrg._id, this.activeDevice._id, this.file, this.uploadProgress);
          this.uploading = false;
          this.progress = 0;
          if(res) {
            this.file = null;
            this.alert = true;
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
