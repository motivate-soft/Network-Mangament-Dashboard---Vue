<template>
  <v-layout justify-center>
    <v-card class="elevation-3 mt-2">
      <v-card-title class="pa-2 ">
        <h6 class="subheading">Webcache configuration</h6>
      </v-card-title>
      <v-card-text>
        <v-form ref="form" lazy-validation @submit.prevent="save">
          <v-container grid-list-m style="padding: 0;">
            <v-layout row wrap>
              <v-flex class="webcache_col">
                <v-tooltip bottom>
                  <v-textarea ref="subnets" slot="activator" v-model.trim="form.allowedSubnets" :rules="[ipmaskList]" :error-messages="serverValidation.allowedSubnets" label="Allowed subnets"
                              outline auto-grow validate-on-blur @focus="serverValidation.allowedSubnets = []" hint="Ex: 192.168.0.1/24"/>
                  <div>
                    Enter each subnet that is allowed to use the proxy on a new line.<br>
                    The subnets must be expressed as CIDR ranges.<br>
                    Note that the proxy interface subnet is already an allowed subnet.<br>
                    All the other subnets won`t be able to use the proxy.
                  </div>
                </v-tooltip>
              </v-flex>
              <v-flex class="webcache_col">
                <v-tooltip bottom>
                  <v-textarea slot="activator" v-model.trim="form.sslServers" :rules="[ipormaskList]" :error-messages="serverValidation.sslServers" label="SSL servers"
                              outline auto-grow validate-on-blur @focus="serverValidation.sslServers = []" hint="Ex: 192.168.4.200/32"/>
                  <div>
                    Enter each SSL Server Ip or subnet that is allowed to use the SSL proxy on a new line.<br>
                    The subnets must be expressed as CIDR ranges.<br>
                    All the other subnets won`t be able to use the SSL proxy.
                  </div>
                </v-tooltip>
              </v-flex>
              <v-flex class="webcache_col">
                <v-tooltip bottom>
                  <v-textarea slot="activator" v-model.trim="form.blacklistUrls" :rules="[urlList]" :error-messages="serverValidation.blacklistUrls" label="Blacklisted URLs"
                              outline auto-grow validate-on-blur @focus="serverValidation.blacklistUrls = []" hint="Ex: .vbox7.com"/>
                  <div>Enter each blacklisted URL on a separate line</div>
                </v-tooltip>
              </v-flex>
              <v-flex class="webcache_col">
                <v-tooltip bottom>
                  <v-textarea slot="activator" v-model.trim="form.blacklistIps" :rules="[ipormaskList]" :error-messages="serverValidation.blacklistIps" label="Blacklisted Ips"
                              outline auto-grow validate-on-blur @focus="serverValidation.blacklistIps = []" hint="Ex: 216.235.91.32/29"/>
                  <div>Enter each CIDR network on a separate line</div>
                </v-tooltip>
              </v-flex>
              <v-flex class="webcache_col">
                <v-tooltip bottom>
                  <v-textarea slot="activator" v-model.trim="form.blacklistRegexps" :rules="[regexList]" :error-messages="serverValidation.blacklistRegexps" label="Blacklisted reg-exps"
                              outline auto-grow validate-on-blur @focus="serverValidation.blacklistRegexps = []" hint="Ex: \.flv(\?.*)?$"/>
                  <div>Enter each regular expression for blacklisting on a separate line</div>
                </v-tooltip>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex class="webcache_col">
                <v-text-field :rules="[rules.required]" :error-messages="serverValidation.diskSize" v-model.number="settings.diskSize" required
                              label="Disk size (in MBs)" type="number" min="1" validate-on-blur @focus="serverValidation.diskSize = []" hint="Maximum allowed storage size"/>
              </v-flex>
              <v-flex class="webcache_col">
                <v-tooltip bottom>
                  <v-text-field slot="activator" :rules="[rules.required]" :error-messages="serverValidation.memorySize" v-model.number="settings.memorySize" required
                                label="Memory size (in MBs)" type="number" min="1" validate-on-blur @focus="serverValidation.memorySize = []"/>
                  <div>Amount of additional memory for In-Transit, Hot and Negative-Cached objects</div>
                </v-tooltip>
              </v-flex>
              <v-flex class="webcache_col">
                <v-text-field :rules="[rules.required]" :error-messages="serverValidation.minObject" v-model.number="settings.minObject" required
                              label="Minimum object size (in KBs)" type="number" min="1" validate-on-blur @focus="serverValidation.minObject = []" hint="Smaller objects won't be saved on disk"/>
              </v-flex>
              <v-flex class="webcache_col">
                <v-text-field :rules="[rules.required]" :error-messages="serverValidation.maxObject" v-model.number="settings.maxObject" required
                              label="Maximum object size (in KBs)" type="number" min="1" validate-on-blur @focus="serverValidation.maxObject = []" hint="Larger objects won't be saved on disk"/>
              </v-flex>
              <v-flex class="webcache_col">
                <v-text-field :rules="[rules.required]" :error-messages="serverValidation.maxObjectRam" v-model.number="settings.maxObjectRam" required
                              label="Maximum object size in Ram (in KBs)" type="number" min="1" validate-on-blur @focus="serverValidation.maxObjectRam = []" hint="Larger objects won't be kept in Ram - only on disk"/>
              </v-flex>
            </v-layout>
          </v-container>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn color="success" type="submit">Save</v-btn>
        <v-spacer/>
      </v-card-actions>
    </v-card>
  </v-layout>
</template>

<script>
import { mapState } from "vuex"
import { WanosApi } from '@/api/wanos.api'
import config from '@/config'
import ValidationRules from '@/plugins/validationRules'

export default
{
  name: 'WebcacheSettings',
  mixins: [ValidationRules],
  data() {
    return {
      settings:
        {
          allowedSubnets: [],
          sslServers: [],
          blacklistUrls: [],
          blacklistIps: [],
          blacklistRegexps: [],
          diskSize: null,
          memorySize: null,
          minObject: null,
          maxObject: null,
          maxObjectRam: null,
        },
      form:
        {
          allowedSubnets: '',
          sslServers: '',
          blacklistUrls: '',
          blacklistIps: '',
          blacklistRegexps: '',
        },
      serverValidation:
        {
          allowedSubnets: [],
          sslServers: [],
          blacklistUrls: [],
          blacklistIps: [],
          blacklistRegexps: [],
          diskSize: [],
          memorySize: [],
          minObject: [],
          maxObject: [],
          maxObjectRam: []
        },
      ipmaskList: (value) => {
        const list = value.trim().split("\n");
        const result = list.every(item => {
          const s = item.trim();
          return s ? this.rules.ipmask(s) === true : true;
        });
        return result || 'Invalid value';
      },
      ipormaskList: (value) => {
        const list = value.trim().split("\n");
        const result = list.every(item => {
          const s = item.trim();
          // since the mask is optional - we check both for valid IP or for valid "IP/mask"
          return s ? this.rules.ip(s) === true || this.rules.ipmask(s) === true : true;
        });
        return result || 'Invalid value';
      },
      urlList: (value) => {
        const list = value.trim().split("\n");
        const result = list.every(item => {
          const s = item.trim();
          // we check both for hostname and domain (domains start with dot ".")
          return s ? this.rules.hostname(s) === true || (s !== '.' && s[0] === '.' && this.rules.hostname(s.substr(1)) === true) : true;
        });
        return result || 'Invalid value';
      },
      regexList: (value) => {
        const list = value.trim().split("\n");
        const result = list.every(item => {
          const s = item.trim();
          if(!s) return true;
          let reg;
          try {
            reg = new RegExp(s.replace('\\','\\\\'));
          } catch(e) {
            // nothing to do
          }
          return reg instanceof RegExp;
        });
        return result || 'Invalid value';
      }
    }
  },
  computed:
    {
      ...mapState(["activeOrg", "activeDevice"]),
    },
  created() {
    this.$root.$on('validation', this.onValidation);
  },
  mounted() {
    this.$refs.subnets.focus();
    this.fetchData();
  },
  beforeDestroy() {
    this.$root.$off('validation', this.onValidation);
  },
  methods:
    {
      async fetchData() {
        try {
          const res = await WanosApi.getWebcacheConfig(this.activeOrg._id, this.activeDevice._id);
          this.form = {
            allowedSubnets: res.allowedSubnetList.join("\n"),
            sslServers: res.sslServerList.join("\n"),
            blacklistUrls: res.blacklistUrlList.join("\n"),
            blacklistIps: res.blacklistIpList.join("\n"),
            blacklistRegexps: res.blacklistRegexpList.join("\n"),
          };
          this.settings = res;
        } catch (err) {
          console.error(err);
        }
      },
      async save() {
        if (!this.$refs.form.validate()) {
          return;
        }
        const params = this.settings;
        const frm = this.form;
        const settings = {
          diskSize: params.diskSize,
          memorySize: params.memorySize,
          minObject: params.minObject,
          maxObject: params.maxObject,
          maxObjectRam: params.maxObjectRam,
          allowedSubnetList: this.arrayUnique(frm.allowedSubnets.split("\n")),
          sslServerList: this.arrayUnique(frm.sslServers.split("\n")),
          blacklistUrlList: this.arrayUnique(frm.blacklistUrls.split("\n")),
          blacklistIpList: this.arrayUnique(frm.blacklistIps.split("\n")),
          blacklistRegexpList: this.arrayUnique(frm.blacklistRegexps.split("\n"))
        };
        try {
          await WanosApi.saveWebcacheConfig(this.activeOrg._id, this.activeDevice._id, settings);
          this.settings = settings;
        } catch (err) {
          console.error(err);
        }
      },
      arrayUnique(arr) {
        return arr.map(item => item.trim()).filter((value, index, self) => value !== '' && self.indexOf(value) === index);
      },
      onValidation (err) {
        if (err.code === config.ERR_CODE.VALIDATION || err.validationErrors) {
          const msgs = this.serverValidation;
          for(const elem of err.fieldList || err.validationErrors) {
            msgs[elem.field] = [elem.message];
          }
        }
      }
    }
}
</script>

<style>
  .webcache_col
  {
    flex-basis: 20%;
    flex-grow: 0;
    max-width: 20%;
  }
</style>
