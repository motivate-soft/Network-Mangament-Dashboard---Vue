<template>
  <v-container grid-list-lg fluid class="pt-2">
    <v-layout row wrap>
      <v-flex xs12>
        <v-card class="elevation-3">
          <v-card-title class="pa-2 ">
            <h6 class="subheading">System benchmark</h6>
          </v-card-title>
          <v-card-text>
            <div v-if="status === 'none'" class="text-xs-center pa-4">
              A benchmark has never been run on this device. Do you want to run it now?
              <br>
              Benchmark will take a considerable amount of time - you can either sit and wait,
              <br>
              or you can navigate to other screens and when the results are ready - you will see a popup notification.
              <br><br>
              <v-btn :loading="testing" color="primary" dark @click="runBenchmark">Run benchmark now?</v-btn>
            </div>
            <div v-else-if="status === 'complete'" class="text-xs-center pa-3">
              <p>The last benchmark has been run on {{ stamp | stampLocale }} and the results are below:</p>
              <v-btn :loading="testing" color="primary" dark @click="runBenchmark">Run benchmark again?</v-btn>
            </div>
            <div v-else class="text-xs-center pa-4">
              The benchmark is currently running ... &nbsp; <spinner/>
            </div>
            <code v-if="list.length > 0" class="log_view">{{ list.join("\r\n") }}</code>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState } from "vuex"
import { WanosApi } from '@/api/wanos.api'
import spinner from '@/components/base/spinnerBall'
import events from '@/events'

export default
{
  name: 'ConfigBenchmark',
  components: {
    spinner,
  },
  data() {
    return {
      testing: null,
      status: null,
      stamp: null,
      list: [],
    }
  },
  computed:
    {
      ...mapState(["activeOrg", "activeDevice", "devices"]),
    },
  created () {
    events.$on('benchmark_ended', this.fetchData);
    this.fetchData();
  },
  beforeDestroy() {
    events.$off('benchmark_ended', this.fetchData);
  },
  methods:
    {
      async fetchData() {
        try {
          const res = await WanosApi.getBenchmark(this.activeOrg._id, this.activeDevice._id);
          if (res) {
            this.status = res.status; // none | scheduled | complete
            this.list = res.lineList;
            this.stamp = res.reportTime ? new Date(res.reportTime) : null;
            if (res.status === 'scheduled') events.$emit('poll_benchmark');
            else {
              // if we have been waiting - then show a snackbar, otherwise do not show
              this.$root.alerts.benchmarkReady = this.$root.alerts.benchmarkWaiting;
              // hide the spinner in top toolbar
              this.$root.alerts.benchmarkWaiting = false;
            }
          }
        } catch (err) {
          console.error(err);
        }
      },
      async runBenchmark () {
        try {
          await WanosApi.runBenchmark(this.activeOrg._id, this.activeDevice._id);
          this.status = 'scheduled';
          events.$emit('poll_benchmark');
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
</style>
