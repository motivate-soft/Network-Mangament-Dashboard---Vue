<template>
  <v-navigation-drawer :mini-variant="miniVariant"
                       clipped
                       v-model="drawer"
                       persistent
                       enable-resize-watcher
                       fixed
                       app
                       dark
                       width="250">
    <scroll-bar style="max-height: 100%;">
      <v-list dense>
        <!-- NETWORK -->
        <v-list-group v-model="topLevelNetwork" no-action>
          <v-list-tile slot="activator">
            <v-list-tile-action>
              <v-icon>public</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Network</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>

          <!-- CM settings -->
          <template v-for="item in CMItems">
            <sidebar-group v-if="item.items" :key="item.title" :group="item" @toggle="collapseSiblings(CMItems,item)" />
            <sidebar-item v-else-if="!item.hidden" :key="item.title" :caption="item.title" :icon="item.icon" :route="item.path" class="subitem" />
          </template>
        </v-list-group>
        <!-- DEVICES -->
        <v-list-group v-model="topLevelDevice" no-action>
          <v-list-tile slot="activator">
            <v-list-tile-action>
              <v-icon>router</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Devices</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>

          <!-- Device selector -->
          <v-list-tile class="subitem">
            <v-list-tile-action>
              <v-icon>router</v-icon>
            </v-list-tile-action>
            <v-list-tile-content class="device_selector">
              <v-list-tile-title>
                <v-menu content-class="menu_devices" left offset-y>
                  <v-btn slot="activator" small block color="transparent" @click="searchDevice = ''">
                    {{ (activeDevice || {}).hostname || '\xA0' }}
                    <v-icon>arrow_drop_down</v-icon>
                  </v-btn>
                  <v-list class="pt-0 pb-0">
                    <v-list-tile>
                      <v-list-tile-content @click.stop.prevent>
                        <v-text-field v-model="searchDevice" placeholder="Search ..." clearable single-line hide-details @keydown.esc="searchDevice = ''"/>
                      </v-list-tile-content>
                    </v-list-tile>
                    <v-list-tile v-for="dev in filteredDevices" :key="dev._id" ripple :disabled="!dev.online" @click="updateActiveDevice(dev)">
                      <v-list-tile-content>{{ dev.hostname + (dev.online ? '' : ' (offline)') }}</v-list-tile-content>
                    </v-list-tile>
                  </v-list>
                </v-menu>
              </v-list-tile-title>
              <!--
              <v-select :items="devices"
                        :value="activeDevice"
                        :item-disabled="(item) => !item.online"
                        :item-text="(item) => item.hostname + (item.online ? '' : ' (offline)')"
                        return-object
                        item-value="_id"
                        hide-details
                        style="margin-top: 0;"
                        @input="updateActiveDevice"/>
                        -->
            </v-list-tile-content>
          </v-list-tile>

          <template v-if="activeDevice">
            <template v-for="item in deviceNavigationItems">
              <sidebar-group v-if="item.items" :key="item.title" :group="item" @toggle="collapseSiblings(deviceNavigationItems,item)" />
              <sidebar-item v-else-if="!item.hidden" :key="item.title" :caption="item.title" :icon="item.icon" :route="item.path" class="subitem" />
            </template>
            <!-- SUPPORT -->
            <sidebar-item href="http://wanos.co/support/" caption="Support" icon="contact_support" class="subitem" />
          </template>
        </v-list-group>
      </v-list>
    </scroll-bar>
  </v-navigation-drawer>
</template>

<script>
import SidebarItem from "@/components/base/SidebarItem";
import sidebarGroup from '@/components/base/SidebarGroup'
import scrollBar from '@/components/scrollbar/vue-scrollbar'
import events from '@/events'
import { mapState, mapMutations } from 'vuex'

export default
{
  name: 'SidebarDrawer',
  components:
    {
      SidebarItem,
      sidebarGroup,
      scrollBar,
    },
  props:
    {
      miniVariant:
        {
          type: Boolean,
          default: false
        },
    },
  data() {
    return {
      drawer: true,
      topLevelNetwork: true,
      topLevelDevice: false,
      searchDevice: '',
      CMItems: [
        {
          icon: 'dashboard',
          title: 'Dashboard',
          path: '/',
        },
        {
          icon: 'supervisor_account',
          title: 'Administration',
          path: '/setup',
        },
        {
          icon: "settings",
          title: "Configuration",
          active: false,
          items: [
            {
              title: "Templates",
              path: "/bad_route1",
              hidden: true
            },
            {
              title: "Updates",
              path: "/bad_route2",
              hidden: true
            },
            {
              title: "Device backups",
              path: "/backup",
            }
          ]
        },
      ],
      deviceNavigationItems: [
        {
          icon: "dashboard",
          title: "Dashboard",
          active: false,
          items: [
            {
              title: "Network",
              path: "/device/dashboard"
            },
            {
              title: "System",
              path: "/device/system_overview"
            }
          ]
        },
        {
          icon: "poll",
          title: "Reports",
          active: false,
          items: [
            {
              title: "Sessions",
              path: "/device/network/sessions"
            },
            {
              title: "Applications",
              path: "/device/network/applications"
            },
            {
              title: "Optimization",
              path: "/device/network/optimization"
            },
            {
              title: "Interface Traffic",
              path: "/device/network/interface_traffic"
            },
            {
              title: "Interfaces",
              path: "/device/network/network_interfaces"
            },
            {
              title: "QoS Classes",
              path: "/device/network/qos_classes"
            },
            {
              title: "Peer Status",
              path: "/device/network/peer_status"
            },
            {
              title: "Webcache",
              path: "/device/network/webcache"
            },
            {
              title: "System",
              path: "/device/system/overview"
            },
          ]
        },
        {
          icon: "settings",
          title: "Configure",
          active: false,
          items: [
            {
              title: "System Settings",
              path: "/device/configure/system"
            },
            {
              title: "Traffic Policies",
              path: "/device/configure/traffic"
            },
            {
              title: "TCP-X Policies",
              path: "/device/configure/tcpx",
              hidden: false 
            },
            {
              title: "Routes",
              path: "/device/configure/routes",
              hidden: false 
            },
            {
              title: "Tunnels",
              path: "/device/configure/tunnels"
            },
            {
              title: "Path Selection",
              path: "/device/configure/paths",
              hidden: false 
            },
            {
              title: "Webcache Settings",
              path: "/device/configure/webcache",
              hidden: false 
            }
          ]
        },
        {
          icon: "insert_chart_outlined",
          title: "Diagnostics",
          active: false,
          items: [
            {
              title: "Logging",
              path: "/device/diagnostics/logging"
            },
            {
              title: "Health Status",
              path: "/device/diagnostics/health"
            },
            {
              title: "Show Tech",
              path: "/device/diagnostics/show_tech",
              hidden: true
            },
            {
              title: "Benchmark",
              path: "/device/diagnostics/benchmark"
            },
            {
              title: "Netstat",
              path: "/device/diagnostics/netstat"
            },
            {
              title: "Ping",
              path: "/device/diagnostics/ping"
            },
            {
              title: "Traceroute",
              path: "/device/diagnostics/traceroute",
            }
          ]
        },
        {
          icon: "build",
          title: "Maintenance",
          active: false,
          items: [
            {
              title: "Backup & Restore",
              path: "/device/maintenance/backup_restore",
              hidden: true
            },
            {
              title: "Software Update",
              path: "/device/maintenance/software_update"
            }
          ]
        },
        {
          icon: "blur_on",
          title: "License",
          path: "/license",
          hidden: true
        }
      ],
    }
  },
  computed:
    {
      ...mapState(['devices', 'activeDevice']),
      filteredDevices () {
        const term = this.searchDevice.toLowerCase();
        return term ? this.devices.filter(item => item.hostname.toLowerCase().indexOf(term) !== -1) : this.devices;
      }
    },
  created() {
    events.$on('new_route', this.updateSidebar);
    events.$on('toggle_drawer', this.toggleDrawer);
  },
  beforeDestroy() {
    events.$off('new_route', this.updateSidebar);
    events.$off('toggle_drawer', this.toggleDrawer);
  },
  methods:
    {
      ...mapMutations(['setActiveDevice']),
      toggleDrawer() {
        this.drawer = !this.drawer;
      },
      updateSidebar() {
        // expand the panel which contains the current route
        // the main purpose is to restore the "expanded" state of the panel after page reload - but I am unable
        // to find a reliable way to detect this as VueRouter always starts with "/" and since our routes are often
        // async - the route is still "/" both in created() and mounted() hooks
        const path = this.$route.path;
        this.CMItems.every(panel => {
          let result = true;
          if (panel.items) {
            panel.items.every(item => {
              if(path.indexOf(item.path) === 0) {
                result = false;
                return false;
              } else return true;
            });
          } else {
            result = path.indexOf(panel.path) !== 0;
          }
          if(!result) {
            panel.active = true;
            this.topLevelNetwork = true;
            this.topLevelDevice = false;
          }
          return result;
        });
        this.deviceNavigationItems.every(panel => {
          let result = true;
          if (panel.items) {
            panel.items.every(item => {
              if (path.indexOf(item.path) === 0) {
                result = false;
                return false;
              } else return true;
            });
          } else {
            result = path.indexOf(panel.path) !== 0;
          }
          if(!result) {
            panel.active = true;
            this.topLevelNetwork = false;
            this.topLevelDevice = true;
          }
          return result;
        });
      },
      updateActiveDevice(device) {
        this.setActiveDevice(device);
      },
      collapseSiblings(list, item) {
        if (item.active) return;
        for(let sibling of list) {
          if (sibling !== item) sibling.active = false;
        }
      }
    }
}
</script>

<style>
  .v-list__group__items--no-action .subitem .v-list__tile
  {
    padding-left: 40px;
  }

  .subitem .v-list__tile__action
  {
    min-width: 0;
    padding-right: 12px;
  }

  .device_selector
  {
    flex-direction: row !important;
    justify-content: normal !important;
    align-items: center !important;
  }

  .device_selector .v-menu--inline
  {
    display: block;
  }

  .device_selector .v-btn
  {
    height: 24px;
    margin: 0;
    padding: 0;
  }

  .device_selector .v-btn__content
  {
    justify-content: space-between !important;
  }

  .menu_devices .v-list
  {
    max-height: 400px;
    overflow: auto;
  }
</style>
