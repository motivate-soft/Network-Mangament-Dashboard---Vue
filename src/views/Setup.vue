<template>
  <v-container grid-list-lg fluid class="pt-2">
    <v-layout row>
      <v-flex xs12>
        <v-tabs v-model="curTab" fixed-tabs class="elevation-3" slider-color="primary">
          <v-tab v-for="tab in tabs" :key="tab.id" :href="'#' + tab.id">{{ tab.title }}</v-tab>
        </v-tabs>
      </v-flex>
    </v-layout>
    <v-layout row wrap>
      <v-flex xs12>
        <v-slide-x-transition mode="out-in">
          <component :is="currentTab.component"/>
        </v-slide-x-transition>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import SetupOrg from './setup/SetupOrg'
import SetupUser from './setup/SetupUser'
import SetupDev from './setup/SetupDev'
import SetupSystem from './setup/SetupSystem'

export default
{
  name: 'Setup',
  components:
    {
      SetupOrg,
      SetupUser,
      SetupDev,
      SetupSystem
    },
  data() {
    return {
      curTab: 'setup_org',
      tabs:
        [
          {
            id: 'setup_org',
            title: 'Organizations',
            component: 'setup-org'
          },
          {
            id: 'setup_user',
            title: 'Users',
            component: 'setup-user'
          },
          {
            id: 'setup_dev',
            title: 'Devices',
            component: 'setup-dev'
          },
          {
            id: 'setup_system',
            title: 'System',
            component: 'setup-system'
          },
        ]
    }
  },
  computed:
    {
      currentTab() {
        const id = this.curTab;
        return this.tabs.find(item => item.id === id);
      }
    }
}
</script>
