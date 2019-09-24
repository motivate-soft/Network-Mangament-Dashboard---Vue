import axiosBase from "axios"
import events from "@/events"
import config from '@/config'

// used when we want a loading spinner
const axios = axiosBase.create({
  baseURL: "/api"
});

// used when we do not need a loading spinner
const axiosHide = axiosBase.create({
  baseURL: "/api"
});

// used with custom timeout for Ping and Traceroute
const axiosLong = axiosBase.create({
  baseURL: "/api"
});

const timeoutPing = 3 * 60 * 1000;
axios.defaults.timeout = 15 * 1000; // 15 seconds - this is timeout for RESPONDING, there is no built-in mechanism for CONNECTION timeout
axiosHide.defaults.timeout = 15 * 1000;

/*
An example of custom mechanism for timing out on connection

  let source = axios.CancelToken.source();
  setTimeout(() => {
    source.cancel();
    // Timeout Logic
  }, 10000);

  axios.get(url + '/config', {cancelToken: source.token})
    .then((result) => {
      // Handle your response
    }).catch((error) => {
      if (axios.isCancel(error)) {
        console.log('Request canceled', thrown.message);
      } else {
        // handle error
      }
    });
 */

function requestOkay (config) {
  events.$emit('show_spin');
  return config;
}

function requestError (error) {
  events.$emit('hide_spin');
  return Promise.reject(error);
}

function responseOkay (response) {
  events.$emit('hide_spin');
  return response;
}

function responseError (error) {
  events.$emit('hide_spin');
  return Promise.reject(error);
}

axios.interceptors.request.use(requestOkay, requestError);
axios.interceptors.response.use(responseOkay, responseError);
axiosLong.interceptors.request.use(requestOkay, requestError);
axiosLong.interceptors.response.use(responseOkay, responseError);

axiosHide.interceptors.request.use(config => {
  return config;
}, error => {
  return Promise.reject(error);
});

export const WanosApi =
{

  showError(err) {
    if(err.response && err.response.status === 404) events.$emit('backend', {
      message: 'API endpoint was not found'
    });
    else err.response && err.response.data && events.$emit('backend', err.response.data.error || err.response.data);
  },

  // ************************* User APIs *********************** //

  login(user) {
    return axios.post("/users/login", user)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  changePassword(userId, changePassword) {
    return axios.post(`users/${userId}/changepassword`, changePassword).catch(error => {
      return this.showError(error);
    });
  },

  getUsers() {
    return axios.get("/users")
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  removeUser(userId) {
    return axios.delete(`/users/${userId}`)
      .then(res => {
        return res;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  updateUser(user) {
    return axios.put(`/users/${user._id}`, user)
      .then(res => {
        return res;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  addUser(user) {
    return axios.post(`/users`, user)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  setUserSettings(user) {
    return axios.post(`/users/${user._id}/settings`, user.settings || {})
      .then((res) => {
        return res;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  // ************************* Global/Org APIs *********************** //

  getOrgs() {
    return axios.get("/orgs")
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },
  getDevices(orgId) {
    return axios.get(`/${orgId}/devices`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },
  getBootstrap() {
    return axios.get("/bootstrap")
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },
  getDevicesStats(orgId) {
    return axiosHide.get(`/${orgId}/stats`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  removeOrg(orgId) {
    return axios.delete(`/orgs/${orgId}`)
      .then(res => {
        return res;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  updateOrg(org) {
    return axios.put(`/orgs/${org._id}`, org)
      .then(res => {
        return res;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  addOrg(org) {
    return axios.post(`/orgs`, org)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  // ************************* Device specific APIs *********************** //

  getDeviceDashboardStats(orgId, deviceId, peerOutput) {
    return axiosHide.get(`${orgId}/device/${deviceId}/dashboard/${peerOutput ? peerOutput : ''}`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  getDeviceDashboardTopProtocols(orgId, deviceId, peerOutput) {
    return axios.get(`${orgId}/device/${deviceId}/dashboard/protocols/${peerOutput ? peerOutput : ''}`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  getAllDevices() {
    return axios.get(`/devices`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  removeDevice(deviceId) {
    return axios.delete(`/devices/${deviceId}`)
      .then(res => {
        return res;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  updateDevice(device) {
    return axios.put(`/devices/${device._id}`, device)
      .then(res => {
        return res;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  // ************************* Network/Webcache APIs *********************** //

  getWebcacheDates(orgId, deviceId) {
    return axios.get(`${orgId}/device/${deviceId}/webcache/dates`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  getWebcacheTotals(orgId, deviceId, year, month, day, week) {
    let path;
    if(week) path = 'week/' + year + '/' + week;
    else {
      path = year;
      if(month) {
        path += '/' + month;
        if(day) path += '/' + day;
      }
    }
    return axios.get(`${orgId}/device/${deviceId}/webcache/totals/${path}`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  getWebcacheDomains(orgId, deviceId, year, month, day, week, orderBy) {
    let path;
    if(week) path = 'week/' + year + '/' + week;
    else {
      path = year;
      if(month) {
        path += '/' + month;
        if(day) path += '/' + day;
      }
    }
    return axios.get(`${orgId}/device/${deviceId}/webcache/domains/${path}?orderBy=${orderBy}`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  getWebcacheUrls(orgId, deviceId, year, month, day, week, orderBy) {
    let path;
    if(week) path = 'week/' + year + '/' + week;
    else {
      path = year;
      if(month) {
        path += '/' + month;
        if(day) path += '/' + day;
      }
    }
    return axios.get(`${orgId}/device/${deviceId}/webcache/urls/${path}?orderBy=${orderBy}`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  getWebcacheDenied(orgId, deviceId, year, month, day, week) {
    let path;
    if(week) path = 'week/' + year + '/' + week;
    else {
      path = year;
      if(month) {
        path += '/' + month;
        if(day) path += '/' + day;
      }
    }
    return axios.get(`${orgId}/device/${deviceId}/webcache/denied/${path}`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  getWebcacheUsers(orgId, deviceId, year, month, day, week, orderBy) {
    let path;
    if(week) path = 'week/' + year + '/' + week;
    else {
      path = year;
      if(month) {
        path += '/' + month;
        if(day) path += '/' + day;
      }
    }
    return axios.get(`${orgId}/device/${deviceId}/webcache/users/${path}?orderBy=${orderBy}`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  getWebcacheUserDetails(orgId, deviceId, year, month, day, week, userId, orderBy) {
    let path;
    if(week) path = 'week/' + year + '/' + week;
    else {
      path = year;
      if(month) {
        path += '/' + month;
        if(day) path += '/' + day;
      }
    }
    return axios.get(`${orgId}/device/${deviceId}/webcache/users/detail/${userId}/${path}?orderBy=${orderBy}`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  getWebcacheNetworks(orgId, deviceId, year, month, day, week, orderBy) {
    let path;
    if(week) path = 'week/' + year + '/' + week;
    else {
      path = year;
      if(month) {
        path += '/' + month;
        if(day) path += '/' + day;
      }
    }
    return axios.get(`${orgId}/device/${deviceId}/webcache/networks/${path}?orderBy=${orderBy}`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  getWebcacheNetworkDetails(orgId, deviceId, year, month, day, week, networkId, orderBy) {
    let path;
    if(week) path = 'week/' + year + '/' + week;
    else {
      path = year;
      if(month) {
        path += '/' + month;
        if(day) path += '/' + day;
      }
    }
    return axios.get(`${orgId}/device/${deviceId}/webcache/networks/detail/${networkId}/${path}?orderBy=${orderBy}`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  getWebcacheMime(orgId, deviceId, year, month, day, week, orderBy) {
    let path;
    if(week) path = 'week/' + year + '/' + week;
    else {
      path = year;
      if(month) {
        path += '/' + month;
        if(day) path += '/' + day;
      }
    }
    return axios.get(`${orgId}/device/${deviceId}/webcache/mimetypes/${path}?orderBy=${orderBy}`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  // ************************* Network/Sessions APIs *********************** //

  getNetworkProtocols(orgId, deviceId) {
    return axios.get(`${orgId}/device/${deviceId}/network/protocols`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  getFlowSessions(orgId, deviceId, filters, pagination) {
    const query = [];
    if (filters.peer) query.push('peer=' + filters.peer);
    if (filters.app) query.push('application=' + filters.app);
    else if (filters.port) query.push('port=' + filters.port);
    if (filters.minKB) query.push('minBytes=' + filters.minKB * 1024);
    if (filters.direction) query.push('direction=' + filters.direction);
    if (filters.period) query.push('period=' + filters.period);
    if (pagination.sortBy) query.push('orderBy=' + pagination.sortBy);
    query.push(`sort=${pagination.descending ? 'desc' : 'asc'}`);
    if (pagination.page) query.push('page=' + pagination.page);
    if (pagination.rowsPerPage) query.push('limit=' + pagination.rowsPerPage);
    return axios.get(`${orgId}/device/${deviceId}/network/sessions?` + query.join('&'))
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  getSessionDetails(orgId, deviceId, flowId, pagination) {
    const query = [];
    if (pagination.sortBy) query.push('orderBy=' + pagination.sortBy);
    query.push(`sort=${pagination.descending ? 'desc' : 'asc'}`);
    if (pagination.page) query.push('page=' + pagination.page);
    if (pagination.rowsPerPage) query.push('limit=' + pagination.rowsPerPage);
    const src = flowId && flowId.src ? flowId.src.split(':') : [];
    const dst = flowId && flowId.dst ? flowId.dst.split(':') : [];
    return axios.get(`${orgId}/device/${deviceId}/network/sessions/${src[0]}/${dst[0]}?` + query.join('&'))
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  // ************************* Network/Applications APIs *********************** //

  getTopApplications(orgId, deviceId, filters) {
    const query = [];
    if (filters.peer) query.push('peer=' + filters.peer);
    if (filters.top) query.push('top=' + filters.top);
    if (filters.period) query.push('period=' + filters.period);
    return axios.get(`${orgId}/device/${deviceId}/network/applications?` + query.join('&'))
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  // ************************* Network/Peer status APIs *********************** //

  getPeerStatus(orgId, deviceId) {
    return axios.get(`${orgId}/device/${deviceId}/network/peerstatus`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  removePeer(orgId, deviceId, peer_ip) {
    return axios.delete(`${orgId}/device/${deviceId}/network/peerstatus/${peer_ip}`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  // ************************* Network/Optimization APIs *********************** //

  getOptimizationLanWan(orgId, deviceId, period, peer) {
    return axios.get(`${orgId}/device/${deviceId}/network/optimization/lan/wan/${period || ''}?peer=${peer || ''}`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  getOptimizationWanLan(orgId, deviceId, period, peer) {
    return axios.get(`${orgId}/device/${deviceId}/network/optimization/wan/lan/${period || ''}?peer=${peer || ''}`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  getOptimizationPassThrough(orgId, deviceId, period, peer) {
    return axios.get(`${orgId}/device/${deviceId}/network/optimization/passthrough/${period || ''}?peer=${peer || ''}`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  getOptimizationRatios(orgId, deviceId, period, peer) {
    return axios.get(`${orgId}/device/${deviceId}/network/optimization/ratios/${period || ''}?peer=${peer || ''}`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  // ************************* Network/Traffic APIs *********************** //

  getNetworkTraffic(orgId, deviceId, period) {
    return axios.get(`${orgId}/device/${deviceId}/network/traffic/${period}`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  // ************************* System/Memory APIs *********************** //

  getMemoryData(orgId, deviceId, period) {
    return axios.get(`${orgId}/device/${deviceId}/system/memory/${period}`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  // ************************* System/CPU APIs *********************** //

  getCPUData(orgId, deviceId, period) {
    return axios.get(`${orgId}/device/${deviceId}/system/cpu/${period}`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  // ************************* System/Disk APIs *********************** //

  getDiskLoad(orgId, deviceId, period) {
    return axios.get(`${orgId}/device/${deviceId}/system/disk/load/${period}`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  getDiskSpace(orgId, deviceId, period) {
    return axios.get(`${orgId}/device/${deviceId}/system/disk/space/${period}`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  // ************************* System/Information APIs *********************** //

  getSystemInfo(orgId, deviceId) {
    return axios.get(`${orgId}/device/${deviceId}/system/info`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  getIndicators(orgId, deviceId) {
    return axiosHide.get(`${orgId}/device/${deviceId}/system/indicators`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  // ************************* System/Load APIs *********************** //

  getSystemLoad(orgId, deviceId, period) {
    return axios.get(`${orgId}/device/${deviceId}/system/load/${period}`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  // ************************* Configure/SystemSettings APIs *********************** //

  getConfigSystem(orgId, deviceId) {
    return axios.get(`${orgId}/device/${deviceId}/configure/settings/system`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  getConfigNetwork(orgId, deviceId) {
    return axios.get(`${orgId}/device/${deviceId}/configure/settings/network`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  getConfigMonitoring(orgId, deviceId) {
    return axios.get(`${orgId}/device/${deviceId}/configure/settings/monitoring`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  getConfigOptimization(orgId, deviceId) {
    return axios.get(`${orgId}/device/${deviceId}/configure/settings/optimization`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  saveSystemSettings(orgId, deviceId, settings) {
    return axios.post(`${orgId}/device/${deviceId}/configure/settings/system`, settings)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  saveNetworkSettings(orgId, deviceId, settings) {
    return axios.post(`${orgId}/device/${deviceId}/configure/settings/network`, settings)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  saveOptimizationSettings(orgId, deviceId, settings) {
    return axios.post(`${orgId}/device/${deviceId}/configure/settings/optimization`, settings)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  saveMonitoringSettings(orgId, deviceId, settings) {
    return axios.post(`${orgId}/device/${deviceId}/configure/settings/monitoring`, settings)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  // ************************* Configure/TunnelPolicies APIs *********************** //

  getTunnelRules(orgId, deviceId) {
    return axios.get(`${orgId}/device/${deviceId}/configure/tunnels`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  removeTunnelRule(orgId, deviceId, ruleId) {
    return axios.delete(`${orgId}/device/${deviceId}/configure/tunnels/${ruleId}`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  updateTunnelRule(orgId, deviceId, rule) {
    return axios.put(`${orgId}/device/${deviceId}/configure/tunnels/${rule.ruleId}`, rule)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  addTunnelRule(orgId, deviceId, data) {
    return axios.post(`${orgId}/device/${deviceId}/configure/tunnels`, data)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  // ************************* Configure/Reset APIs *********************** //

  configChangePassword(orgId, deviceId, password) {
    return axios.post(`${orgId}/device/${deviceId}/configure/reset/password`, password)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  configResetCounter(orgId, deviceId, kind) {
    return axios.post(`${orgId}/device/${deviceId}/configure/reset/counter/${kind}`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  configResetDevice(orgId, deviceId, kind) {
    return axios.post(`${orgId}/device/${deviceId}/configure/reset/device/${kind}`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  // ************************* Diagnostics/Logging APIs *********************** //

  getDiagnosticLog(orgId, deviceId, level) {
    return axios.get(`${orgId}/device/${deviceId}/diagnostic/log/${level}`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  // ************************* License APIs *********************** //

  getLicense(orgId, deviceId) {
    return axios.get(`${orgId}/device/${deviceId}/license`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  addLicense(orgId, deviceId, token, newLicense) {
    return axios.post(`${orgId}/device/${deviceId}/license`, {token: token, license: newLicense})
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  // ************************* Configure/TrafficPolicies APIs *********************** //

  getTrafficRules(orgId, deviceId) {
    return axios.get(`${orgId}/device/${deviceId}/configure/traffic`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  removeTrafficRule(orgId, deviceId, ruleId) {
    return axios.delete(`${orgId}/device/${deviceId}/configure/traffic/${ruleId}`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  updateTrafficRule(orgId, deviceId, rule) {
    return axios.put(`${orgId}/device/${deviceId}/configure/traffic/${rule.ruleId}`, rule)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  addTrafficRule(orgId, deviceId, data) {
    return axios.post(`${orgId}/device/${deviceId}/configure/traffic`, data)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  moveTrafficRule(orgId, deviceId, ruleId, upward) {
    return axios.put(`${orgId}/device/${deviceId}/configure/traffic/${ruleId}/move?upward=${upward ? 1 : 0}`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  // ************************* Network/QoS APIs *********************** //

  getNetworkQoS(orgId, deviceId, period, qosClass) {
    const query = qosClass !== null ? 'class=' + qosClass : '';
    return axios.get(`${orgId}/device/${deviceId}/network/qos/${period}?${query}`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  // ************************* Diagnostic/Health APIs *********************** //

  getDiagnosticHealth(orgId, deviceId) {
    return axios.get(`${orgId}/device/${deviceId}/diagnostic/health`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  // ************************* Configure/RoutePolicies APIs *********************** //

  getStaticRoutes(orgId, deviceId) {
    return axios.get(`${orgId}/device/${deviceId}/configure/routes`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  removeStaticRoute(orgId, deviceId, ruleId) {
    return axios.delete(`${orgId}/device/${deviceId}/configure/routes/${ruleId}`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  updateStaticRoute(orgId, deviceId, ruleId, data) {
    return axios.put(`${orgId}/device/${deviceId}/configure/routes/${ruleId}`, data)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  addStaticRoute(orgId, deviceId, data) {
    return axios.post(`${orgId}/device/${deviceId}/configure/routes`, data)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  // ************************* Configure/TCP-X APIs *********************** //

  getAccelerationRules(orgId, deviceId) {
    return axios.get(`${orgId}/device/${deviceId}/configure/tcpx`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  removeAccelerationRule(orgId, deviceId, ruleId) {
    return axios.delete(`${orgId}/device/${deviceId}/configure/tcpx/${ruleId}`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  updateAccelerationRule(orgId, deviceId, rule) {
    return axios.put(`${orgId}/device/${deviceId}/configure/tcpx/${rule.ruleId}`, rule)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  addAccelerationRule(orgId, deviceId, data) {
    return axios.post(`${orgId}/device/${deviceId}/configure/tcpx`, data)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  moveAccelerationRule(orgId, deviceId, ruleId, upward) {
    return axios.put(`${orgId}/device/${deviceId}/configure/tcpx/${ruleId}/move?upward=${upward ? 1 : 0}`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  // ************************* Network/Interfaces APIs *********************** //

  getNetworkInterfaces(orgId, deviceId) {
    return axios.get(`${orgId}/device/${deviceId}/network/interfaces`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  // ************************* Diagnostic/TechSupport APIs *********************** //

  getSupportInfo(orgId, deviceId) {
    return axios.get(`${orgId}/device/${deviceId}/diagnostic/techinfo`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  // ************************* Diagnostic/Benchmark APIs *********************** //

  getBenchmark(orgId, deviceId) {
    return axios.get(`${orgId}/device/${deviceId}/diagnostic/benchmark`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  pollBenchmark(orgId, deviceId) {
    return axiosHide.get(`${orgId}/device/${deviceId}/diagnostic/benchmark`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  runBenchmark(orgId, deviceId) {
    return axios.post(`${orgId}/device/${deviceId}/diagnostic/benchmark`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  // ************************* Diagnostic/Ping APIs *********************** //

  getPingResult(orgId, deviceId, data) {
    let source = axiosBase.CancelToken.source();
    let timer = setTimeout(() => {
      source.cancel();
      // Timeout Logic
    }, timeoutPing);

    return axiosLong.get(`${orgId}/device/${deviceId}/diagnostic/ping/${data.host}?count=${data.count}&ipv6=${data.ipv6 ? '1' : '0'}`, {cancelToken: source.token})
      .then(res => {
        clearTimeout(timer);
        return res.data;
      })
      .catch(error => {
        clearTimeout(timer);
        if (axios.isCancel(error)) {
          events.$emit('backend', {
            code: config.ERR_CODE.DEADLINE_EXCEEDED,
            message: 'The request timed out'
          });
        } else return this.showError(error);
      });
  },

  // ************************* Diagnostic/Traceroute APIs *********************** //

  getTracerouteResult(orgId, deviceId, data) {
    let source = axiosBase.CancelToken.source();
    let timer = setTimeout(() => {
      source.cancel();
      // Timeout Logic
    }, timeoutPing);

    return axiosLong.get(`${orgId}/device/${deviceId}/diagnostic/traceroute/${data.host}?hops=${data.hops}&ipv6=${data.ipv6 ? '1' : '0'}&icmp=${data.icmp ? '1' : '0'}&lookup=${data.lookup ? '1' : '0'}`,
      {cancelToken: source.token})
      .then(res => {
        clearTimeout(timer);
        return res.data;
      })
      .catch(error => {
        clearTimeout(timer);
        if (axios.isCancel(error)) {
          events.$emit('backend', {
            code: config.ERR_CODE.DEADLINE_EXCEEDED,
            message: 'The request timed out'
          });
        } else return this.showError(error);
      });
  },

  // ************************* Diagnostic/Netstat APIs *********************** //

  getNetstatSessions(orgId, deviceId) {
    return axios.get(`${orgId}/device/${deviceId}/diagnostic/netstat`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  // ************************* Global/BackupRestoreSchedule APIs *********************** //

  getOnlineBackups(orgId) {
    return axios.get(`orgs/${orgId}/backups`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  getBackupSchedule(orgId) {
    return axios.get(`orgs/${orgId}/backupsettings`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  setBackupSchedule(orgId, period, count, time) {
    return axios.put(`orgs/${orgId}/backupsettings`, {
      period,
      count,
      time,
    }).then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  deleteBackups(orgId, backupIds) {
    return axios.delete(`orgs/${orgId}/backups`, {data: backupIds})
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  // ************************* Maintenance/BackupRestore APIs *********************** //

  getBackupList(orgId, deviceId) {
    return axios.get(`${orgId}/device/${deviceId}/maintenance/backup`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  requestBackupNow(orgId, deviceId) {
    return axios.post(`${orgId}/device/${deviceId}/maintenance/backup`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  revertOnlineConfig(orgId, deviceId, backupId) {
    return axios.post(`${orgId}/device/${deviceId}/maintenance/revert`, {backupId: backupId})
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  deleteOnlineConfig(orgId, deviceId, backupIds) {
    return axios.delete(`${orgId}/device/${deviceId}/maintenance/backup`, {data: backupIds})
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  restoreConfig(orgId, deviceId, file, progressFunc) {
    const form = new FormData;
    form.append('config', file);
    return axios.post(`${orgId}/device/${deviceId}/maintenance/restore`, form, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: progressFunc
    }).then(res => {
      return res.data;
    })
      .catch(error => {
        return this.showError(error);
      });
  },

  // ************************* Maintenance/SoftwareUpdate APIs *********************** //

  updateSoftware(orgId, deviceId, file, progressFunc) {
    const form = new FormData;
    form.append('update', file);
    return axios.post(`${orgId}/device/${deviceId}/maintenance/update`, form, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: progressFunc
    }).then(res => {
      return res.data;
    })
      .catch(error => {
        return this.showError(error);
      });
  },

  // ************************* Configure/PathSelection APIs *********************** //

  getPathGateways(orgId, deviceId) {
    return axios.get(`${orgId}/device/${deviceId}/configure/paths/gateways`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  addPathGateway(orgId, deviceId, gateway) {
    return axios.post(`${orgId}/device/${deviceId}/configure/paths/gateways`, gateway)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  removePathGateway(orgId, deviceId, gatewayType) {
    return axios.delete(`${orgId}/device/${deviceId}/configure/paths/gateways/${gatewayType}`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  getPathConfig(orgId, deviceId) {
    return axios.get(`${orgId}/device/${deviceId}/configure/paths/config`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  savePathConfig(orgId, deviceId, config) {
    return axios.post(`${orgId}/device/${deviceId}/configure/paths/config`, config)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  // ************************* Configure/Webcache APIs *********************** //

  getWebcacheConfig(orgId, deviceId) {
    return axios.get(`${orgId}/device/${deviceId}/configure/webcache`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  saveWebcacheConfig(orgId, deviceId, config) {
    return axios.post(`${orgId}/device/${deviceId}/configure/webcache`, config)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  // ************************* Device alerts API *********************** //

  alertPoll(orgId, deviceId) {
    return axiosHide.get(`${orgId}/device/${deviceId}/alert`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  dismissDeviceError(orgId, deviceId) {
    return axiosHide.post(`${orgId}/device/${deviceId}/alert/dismiss-error`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  // ************************* System Administration API *********************** //
  getLocalNetwork() {
    return axios.get(`/system/network`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  setLocalNetwork(netConfig) {
    return axios.post(`/system/network`, netConfig)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  sysFactoryReset() {
    return axios.post(`/system/admin/factory-reset`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  sysReboot() {
    return axios.post(`/system/admin/reboot`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  },

  sysPowerOff() {
    return axios.post(`/system/admin/poweroff`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        return this.showError(error);
      });
  }

};
