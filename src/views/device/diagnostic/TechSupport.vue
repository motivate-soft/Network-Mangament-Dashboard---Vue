<template>
  <v-container grid-list-lg fluid class="pt-2">
    <v-layout row wrap>
      <v-flex xs12>
        <v-card class="elevation-3">
          <v-card-title class="pa-2 ">
            <h6 class="subheading">Support information</h6>
          </v-card-title>
          <v-card-text>
            <v-layout row wrap justify-center align-center>
              <v-flex xs2>
                <v-btn :loading="loading" color="primary" dark @click="fetchData">Generate tech support information</v-btn>
              </v-flex>
            </v-layout>
            <div v-if="loading">Collecting data. This may take a while ...</div>
            <div v-else-if="link">
              Tech support information is ready for download:
              <a :href="link" download="showtech.tar.gz">showtech.tar.gz</a>
            </div>
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
  name: 'DiagnosticTech',
  data() {
    return {
      link: null,
      loading: false,
    }
  },
  computed:
    {
      ...mapState(["activeOrg", "activeDevice"]),
    },
  methods:
    {
      async fetchData() {
        try {
          this.loading = true;
          const res = await WanosApi.getSupportInfo(this.activeOrg._id, this.activeDevice._id);
          this.link = res.link;
          this.loading = false;
        } catch (err) {
          console.error(err);
          this.loading = false;
        }
      }
    }
}
</script>
