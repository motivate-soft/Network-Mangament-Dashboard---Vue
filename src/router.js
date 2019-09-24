import Vue from 'vue'
import Router from 'vue-router'
import Dashboard from "./views/Dashboard.vue"
import Setup from './views/Setup'

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard
    },
    {
      path: '/setup',
      name: 'setup',
      component: Setup,
      meta:
        {
          access: 'w'
        }
    },
    {
      path: '/backup',
      name: 'orgBackup',
      component: () => import(/* webpackChunkName: "OrgBackup" */ './views/org/configure/OrgBackupRestore.vue'),
      meta:
        {
          access: 'w'
        }
    },
    {
      path: '/device/dashboard',
      name: 'deviceDashboard',
      // route level code-splitting
      // this generates a separate chunk for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "DeviceDashboard" */ './views/device/Dashboard.vue')
    },
    {
      path: '/user/changepassword',
      name: 'userchangePassword',
      // route level code-splitting
      // this generates a separate chunk for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "UserChangePassword" */ './views/ChangePassword.vue')
    },
    {
      path: '/device/network/webcache',
      name: 'webCache',
      component: () => import(/* webpackChunkName: "NetworkWebcache" */ './views/device/network/webcache/Webcache.vue')
    },
    {
      path: '/device/network/sessions',
      name: 'networkSessions',
      component: () => import(/* webpackChunkName: "NetworkSessions" */ './views/device/network/sessions/FlowSessions.vue')
    },
    {
      path: '/device/network/applications',
      name: 'networkApplications',
      component: () => import(/* webpackChunkName: "NetworkApplications" */ './views/device/network/applications/NetworkApplications.vue')
    },
    {
      path: '/device/network/optimization',
      name: 'networkOptimization',
      component: () => import(/* webpackChunkName: "NetworkOptimization" */ './views/device/network/optimization/OptimizationOverview.vue')
    },
    {
      path: '/device/network/interface_traffic',
      name: 'networkTraffic',
      component: () => import(/* webpackChunkName: "NetworkTraffic" */ './views/device/network/traffic/InterfaceTraffic.vue')
    },
    {
      path: '/device/network/peer_status',
      name: 'peerStatus',
      component: () => import(/* webpackChunkName: "NetworkPeerStatus" */ './views/device/network/status/PeerStatus.vue')
    },
    {
      path: '/device/system/overview',
      name: 'systemOverview',
      component: () => import(/* webpackChunkName: "SystemOverview" */ './views/device/system/overview/SystemOverview.vue')
    },
    {
      path: '/device/system_overview',
      name: 'systemOverview2',
      component: () => import(/* webpackChunkName: "SystemOverview" */ './views/device/system/overview/SystemOverview.vue')
    },
    {
      path: '/device/system/memory',
      name: 'systemMemory',
      component: () => import(/* webpackChunkName: "SystemMemory" */ './views/device/system/memory/SystemMemory.vue')
    },
    {
      path: '/device/system/load',
      name: 'systemLoad',
      component: () => import(/* webpackChunkName: "SystemLoad" */ './views/device/system/load/SystemLoad.vue')
    },
    {
      path: '/device/system/cpu',
      name: 'systemCPU',
      component: () => import(/* webpackChunkName: "SystemCPU" */ './views/device/system/cpu/SystemCPU.vue')
    },
    {
      path: '/device/system/disk',
      name: 'systemDisk',
      component: () => import(/* webpackChunkName: "SystemDisk" */ './views/device/system/disk/SystemDisk.vue')
    },
    {
      path: '/device/configure/system',
      name: 'configSystem',
      component: () => import(/* webpackChunkName: "ConfigureSystem" */ './views/device/configure/system/Settings.vue')
    },
    {
      path: '/device/configure/tunnels',
      name: 'configTunnels',
      component: () => import(/* webpackChunkName: "ConfigureTunnels" */ './views/device/configure/TunnelPolicies.vue')
    },
    {
      path: '/device/configure/password',
      name: 'configReset',
      component: () => import(/* webpackChunkName: "ConfigPassword" */ './views/device/configure/ConfigPassword.vue')
    },
    {
      path: '/device/configure/reset',
      name: 'configPassword',
      component: () => import(/* webpackChunkName: "ConfigReset" */ './views/device/configure/ConfigReset.vue')
    },
    {
      path: '/device/diagnostics/logging',
      name: 'diagnosticLog',
      component: () => import(/* webpackChunkName: "DiagnosticLog" */ './views/device/diagnostic/Logging.vue')
    },
    {
      path: '/device/diagnostics/logging/:level',
      name: 'diagnosticLogLevel',
      component: () => import(/* webpackChunkName: "DiagnosticLog" */ './views/device/diagnostic/Logging.vue')
    },
    {
      path: '/license',
      name: 'license',
      component: () => import(/* webpackChunkName: "License" */ './views/device/license/License.vue')
    },
    {
      path: '/device/configure/traffic',
      name: 'configTraffic',
      component: () => import(/* webpackChunkName: "ConfigureTraffic" */ './views/device/configure/TrafficPolicies.vue')
    },
    {
      path: '/device/network/qos_classes',
      name: 'networkQoS',
      component: () => import(/* webpackChunkName: "NetworkQoS" */ './views/device/network/qos/NetworkQoS.vue')
    },
    {
      path: '/device/diagnostics/health',
      name: 'diagnosticHealth',
      component: () => import(/* webpackChunkName: "DiagnosticHealth" */ './views/device/diagnostic/HealthCheck.vue')
    },
    {
      path: '/device/configure/routes',
      name: 'configRoutes',
      component: () => import(/* webpackChunkName: "ConfigureRoutes" */ './views/device/configure/RoutePolicies.vue')
    },
    {
      path: '/device/configure/tcpx',
      name: 'configAcceleration',
      component: () => import(/* webpackChunkName: "ConfigureAcceleration" */ './views/device/configure/AccelPolicies.vue')
    },
    {
      path: '/device/network/network_interfaces',
      name: 'networkInterfaces',
      component: () => import(/* webpackChunkName: "NetworkInterfaces" */ './views/device/network/NetworkInterfaces.vue')
    },
    {
      path: '/device/diagnostics/show_tech',
      name: 'diagnosticTech',
      component: () => import(/* webpackChunkName: "DiagnosticTech" */ './views/device/diagnostic/TechSupport.vue')
    },
    {
      path: '/device/diagnostics/benchmark',
      name: 'configBenchmark',
      component: () => import(/* webpackChunkName: "DiagnosticBenchmark" */ './views/device/diagnostic/DiagnosticBenchmark.vue')
    },
    {
      path: '/device/diagnostics/ping',
      name: 'diagnosticPing',
      component: () => import(/* webpackChunkName: "DiagnosticPing" */ './views/device/diagnostic/Ping.vue')
    },
    {
      path: '/device/diagnostics/traceroute',
      name: 'diagnosticTraceroute',
      component: () => import(/* webpackChunkName: "DiagnosticTraceroute" */ './views/device/diagnostic/TraceRoute.vue')
    },
    {
      path: '/device/diagnostics/netstat',
      name: 'diagnosticNetstat',
      component: () => import(/* webpackChunkName: "DiagnosticNetstat" */ './views/device/diagnostic/Netstat.vue')
    },
    {
      path: '/device/maintenance/backup_restore',
      name: 'maintenanceBackup',
      component: () => import(/* webpackChunkName: "Maintenance" */ './views/device/maintenance/BackupRestore.vue')
    },
    {
      path: '/device/maintenance/software_update',
      name: 'maintenanceUpdate',
      component: () => import(/* webpackChunkName: "Maintenance" */ './views/device/maintenance/SoftwareUpdate.vue')
    },
    {
      path: '/device/configure/paths',
      name: 'configPaths',
      component: () => import(/* webpackChunkName: "ConfigurePaths" */ './views/device/configure/PathSelection.vue')
    },
    {
      path: '/device/configure/webcache',
      name: 'configWebcache',
      component: () => import(/* webpackChunkName: "ConfigureWebcache" */ './views/device/configure/WebcacheSettings.vue')
    },
  ]
})
