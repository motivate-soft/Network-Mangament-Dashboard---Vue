<template>
  <div v-show="$root.alerts.benchmarkWaiting">
    Benchmarking ... <spinner show/>
    <v-snackbar top right v-model="$root.alerts.benchmarkReady" :timeout="0">
      <div>
        Benchmarking completed. <v-btn color="primary" @click="viewBenchmark">View results</v-btn>
      </div>
    </v-snackbar>
  </div>
</template>

<script>
import events from '@/events'
import spinner from '@/components/base/spinnerBalls'
import config from '@/config'
import { mapState } from 'vuex'
import { WanosApi } from '@/api/wanos.api'

export default
{
  name: 'BenchmarkSpinner',
  components:
    {
      spinner,
    },
  data() {
    return {
      timerBenchmark: null,
    }
  },
  computed:
    {
      ...mapState(['artiveOrg', 'activeDevice', 'user']),
    },
  created() {
    events.$on('poll_benchmark', this.startBenchmarkPoll);
  },
  beforeDestroy() {
    events.$off('poll_benchmark', this.startBenchmarkPoll);
    if (this.timerBenchmark) clearTimeout(this.timerBenchmark);
  },
  methods:
    {
      viewBenchmark() {
        this.$root.alerts.benchmarkReady = false;
        if (this.$route.name !== 'configBenchmark') this.$router.push({name: 'configBenchmark'});
        else events.$emit('benchmark_ended');
      },
      startBenchmarkPoll() {
        this.$root.alerts.benchmarkWaiting = true;
        this.$root.alerts.benchmarkReady = false;
        if (this.user) this.timerBenchmark = setTimeout(this.benchmarkPoller, config.pollingBenchmark);
      },
      async benchmarkPoller() {
        try {
          const res = await WanosApi.pollBenchmark(this.activeOrg._id, this.activeDevice._id);
          this.timerBenchmark = null;
          if (res) {
            if (res.status === 'scheduled') {
              this.$root.alerts.benchmarkWaiting = true;
              this.timerBenchmark = setTimeout(this.benchmarkPoller, config.pollingBenchmark);
            } else {
              // if we have been waiting - then show a snackbar, otherwise do not show
              this.$root.alerts.benchmarkReady = this.$root.alerts.benchmarkWaiting;
              // hide the spinner in top toolbar
              this.$root.alerts.benchmarkWaiting = false;
              if (this.$root.alerts.benchmarkReady && this.$route.name === 'configBenchmark') {
                this.$root.alerts.benchmarkReady = false;
                events.$emit('benchmark_ended');
              }
            }
          }
        } catch (err) {
          console.error(err);
        }
      },
    }
}
</script>
