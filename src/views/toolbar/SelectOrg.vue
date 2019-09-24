<template>
  <v-menu v-model="showOrgSelector" left offset-y :close-on-content-click="false">
    <v-btn slot="activator" flat style="text-transform: none;" @click="getStats">
      <v-icon left>account_balance</v-icon>
      {{ (activeOrg || {}).name }}
    </v-btn>
    <v-card flat>
      <v-card-title>
        <v-text-field v-model="search" append-icon="search" label="Search" single-line hide-details clearable/>
      </v-card-title>
    </v-card>
    <v-card-text class="org_selector">
      <scroll-bar style="max-height: 100%;">
        <v-data-table :headers="headers" :items="orgsList" :search="search" item-key="_id" hide-actions must-sort>
          <template slot="items" slot-scope="props">
            <tr align="center" @click="updateActiveOrg(props.item)">
              <td>
                <v-icon :color="props.item._id === activeOrg._id ? '' : 'transparent'">check</v-icon>
              </td>
              <td align="left">{{ props.item.name }}</td>
              <td>{{ props.item.total }}</td>
              <td>
                <v-progress-circular v-if="props.item.total" :size="36" :width="3" :rotate="-90" :value="props.item.red * 100 / props.item.total" class="ml-2 caption" color="red">
                  {{ Math.round(props.item.red * 100 / props.item.total) }}
                </v-progress-circular>
              </td>
              <td>
                <v-progress-circular v-if="props.item.total" :size="36" :width="3" :rotate="-90" :value="props.item.orange * 100 / props.item.total" class="caption ml-2" color="orange">
                  {{ Math.round(props.item.orange * 100 / props.item.total) }}
                </v-progress-circular>
              </td>
              <td>
                <v-progress-circular v-if="props.item.total" :size="36" :width="3" :rotate="-90" :value="props.item.green * 100 / props.item.total" class="caption ml-2" color="green">
                  {{ Math.round(props.item.green * 100 / props.item.total) }}
                </v-progress-circular>
              </td>
            </tr>
          </template>
        </v-data-table>
      </scroll-bar>
    </v-card-text>
  </v-menu>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import { WanosApi } from '@/api/wanos.api'
import events from '@/events'
import scrollBar from '@/components/scrollbar/vue-scrollbar'

export default
{
  name: 'SelectOrg',
  components:
    {
      scrollBar,
    },
  data() {
    return {
      showOrgSelector: false,
      search: '',
      deviceList: [],
      headers:
      [
        {
          text: '',
          sortable: false,
          width: 50,
        },
        {
          text: "Organization",
          value: 'name',
        },
        {
          text: "Total devices",
          value: 'total',
        },
        {
          text: "Alerts",
          value: 'red',
          align: 'center',
        },
        {
          text: "Degraded",
          value: 'orange',
          align: 'center',
        },
        {
          text: "OK",
          value: 'green',
          align: 'center',
        },
      ]
    }
  },
  computed:
    {
      ...mapState(['activeOrg', 'orgs']),
      orgsList () {
        // we can not use the "devices" array because it contains only the devices of the currently chosen org, not all the possible devices
        const devices = this.deviceList;
        return this.orgs.map(org => {
          const devs = devices.filter(dev => dev.orgId === org._id);
          const red = devs.filter(dev => !dev.online);
          const orange = devs.filter(dev => red.indexOf(dev) === -1 && (/unlicensed/i.test((dev.wanosLicense || '').trim() || 'unlicensed') || Object.values(dev.alert || {}).reduce((acc, value) => acc + Number(value), 0) > 0));
          return {
            _id: org._id,
            name: org.name,
            red: red.length,
            orange: orange.length,
            green: devs.length - red.length - orange.length,
            total: devs.length
          }
        });
      },
    },
  methods:
    {
      ...mapMutations(['setActiveOrg', 'setActiveDevice', 'setDevices']),
      ...mapActions(['getDevices']),
      updateActiveOrg(org) {
        let updateDevices = org !== this.activeOrg;
        this.setActiveOrg(org);
        if (updateDevices) {
          this.setDevices(this.deviceList.filter(dev => dev.orgId === org._id));
          this.setActiveDevice(null); // Antonie does not want a device to be auto-selected
          this.$router.push({name: 'dashboard'}, () => {
            events.$emit('new_route'); // update the sidebar - collapse Devices and expand Network group
          });
        }
        this.showOrgSelector = false;
      },
      async getStats() {
        this.deviceList = [];
        this.search = '';
        try {
          this.deviceList = await WanosApi.getAllDevices();
        } catch (err) {
          console.error(err);
        }
      }
    },
}
</script>

<style>
  .org_selector
  {
    max-height: 40vh;
    overflow: hidden;
    display: flex;
    padding: 0 !important;
  }

  .org_selector td:first-child,
  .org_selector th:first-child
  {
    padding: 0 8px !important;
  }
</style>
