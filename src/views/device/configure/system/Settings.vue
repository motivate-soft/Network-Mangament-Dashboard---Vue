<template>
  <v-container grid-list-lg fluid class="pt-2">
    <v-layout row wrap>
      <v-flex xs12>
        <v-tabs v-model="curTab" centered class="elevation-3" slider-color="primary">
          <v-tab v-for="tab in tabs" :key="tab.id" :href="`#${tab.id}`">{{ tab.title }}</v-tab>
        </v-tabs>
      </v-flex>
    </v-layout>
    <v-slide-x-transition mode="out-in">
      <component :is="currentTab.component" ref="system_tab"/>
    </v-slide-x-transition>
  </v-container>
</template>

<script>
import ConfigSystem from './SystemSettings'
import ConfigNetwork from './NetworkSettings'
import ConfigOptimize from './OptimizationSettings'
import ConfigMonitor from './MonitoringSettings'
import sshPassword from './SshPassword'
import systemReset from '../ConfigReset'
import { mapState } from "vuex"

export default {
  name: 'ConfigureSystem',
  components:
    {
      ConfigSystem,
      ConfigNetwork,
      ConfigOptimize,
      ConfigMonitor,
      sshPassword,
      systemReset,
    },
  data() {
    return {
      curTab: 'config-system',
      tabs:
        [
          {
            id: 'config-system',
            title: 'System settings',
            component: 'config-system'
          },
          {
            id: 'config-network',
            title: 'Network settings',
            component: 'config-network'
          },
          {
            id: 'config-optimize',
            title: 'Optimization settings',
            component: 'config-optimize'
          },
          {
            id: 'config-monitor',
            title: 'Monitoring settings',
            component: 'config-monitor'
          },
          {
            id: 'ssh-password',
            title: 'SSH password',
            component: 'ssh-password'
          },
          {
            id: 'system-reset',
            title: 'Reset',
            component: 'system-reset'
          },
        ]
    }
  },
  computed:
    {
      ...mapState(["activeOrg", "activeDevice"]),
      currentTab() {
        const id = this.curTab;
        return this.tabs.find(item => item.id === id);
      },
    },
}
</script>

<style>
  .hide_messages .v-input__slot
  {
    margin-bottom: 0 !important;
  }

  .hide_messages .v-messages
  {
    min-height: auto;
  }
</style>
