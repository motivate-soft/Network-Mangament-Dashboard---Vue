<template>
  <v-container grid-list-lg fluid class="pt-2">
    <v-layout row wrap>
      <v-flex xs12>
        <h2>License</h2>
      </v-flex>
    </v-layout>
    <v-layout row>
      <v-flex>
        <v-card class="elevation-3" height="100%">
          <v-card-title class="pa-2 ">
            <h6 class="subheading">Status</h6>
          </v-card-title>
          <v-card-text>
            <table class="license_table">
              <tr>
                <td>Version:</td>
                <td>{{ license ? license.version : '' }}</td>
              </tr>
              <tr>
                <td>Status:</td>
                <td>{{ license ? license.status : '' }}</td>
              </tr>
              <tr>
                <td>Active:</td>
                <td>{{ license ? license.active : ''}}</td>
              </tr>
              <tr>
                <td>Expire:</td>
                <td>{{ (license || {}).expire | dateLocale }} (<strong>{{ (license || {}).expire | daysRemain }}</strong> days remaining)</td>
              </tr>
              <tr>
                <td>Token:</td>
                <td>
                  <v-textarea :value="(license || {}).token" class="token_field" readonly no-resize box/>
                </td>
              </tr>
            </table>
            <v-flex justify-center style="display: flex;">
              <v-dialog v-model="dialogAdd" max-width="500px" persistent @keydown.esc="dialogAdd = false">
                <template slot="activator" slot-scope="{on}">
                  <v-btn color="primary" dark v-on="on">Add New</v-btn>
                </template>
                <v-form ref="frm_license" lazy-validation @submit.prevent="addLicense">
                  <v-card>
                    <v-toolbar dark dense flat color="primary">
                      <v-toolbar-title>Add new license</v-toolbar-title>
                    </v-toolbar>
                    <v-card-text>
                      <v-textarea :rules="[rules.required]" :error-messages="serverValidation.newLicense" ref="new_license" v-model="newLicense" label="New license" hint="Required"
                                  outline validate-on-blur @focus="serverValidation.newLicense = []"/>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="error" dark @click="licenseClose">Cancel</v-btn>
                      <v-btn type="submit" color="success" dark>Submit</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-form>
              </v-dialog>
              <v-dialog v-model="dialogTrial" max-width="500px" persistent @keydown.esc="dialogTrial = false">
                <template slot="activator" slot-scope="{on}">
                  <v-btn color="primary" dark v-on="on">Get Trial</v-btn>
                </template>
                <v-form ref="frm_trial" lazy-validation action="http://wanos.co/wan-optimization/trial-form-2/#wpcf7-f2739-p2740-o1" method="post" target="_blank">
                  <input type="hidden" name="_wpcf7" value="2739">
                  <input type="hidden" name="_wpcf7_version" value="3.9.3">
                  <input type="hidden" name="_wpcf7_locale" value="en_US">
                  <input type="hidden" name="_wpcf7_unit_tag" value="wpcf7-f2739-p2740-o1">
                  <input type="hidden" name="_wpnonce" value="7488edb5fc">
                  <input type="hidden" name="link-speed" :value="trial.linkSpeed">
                  <input type="hidden" name="token" :value="(license || {}).token">
                  <v-card>
                    <v-toolbar dense dark flat color="primary">
                      <v-toolbar-title>Get trial key</v-toolbar-title>
                    </v-toolbar>
                    <v-card-text>
                      <v-text-field :rules="[rules.required]" :error-messages="serverValidation.firstName" ref="fname" v-model="trial.firstName" label="First name"
                                    type="text" name="your-name" hint="Required" required validate-on-blur @focus="serverValidation.firstName = []"/>
                      <v-text-field :rules="[rules.required]" :error-messages="serverValidation.lastName" v-model="trial.lastName" label="Last name"
                                    type="text" name="last-name" hint="Required" required validate-on-blur @focus="serverValidation.lastName = []"/>
                      <v-text-field :rules="[rules.required, rules.email]" :error-messages="serverValidation.email" v-model="trial.email" label="E-mail address"
                                    type="email" name="your-email" hint="Required" required validate-on-blur @focus="serverValidation.email = []"/>
                      <v-text-field :rules="[rules.required]" :error-messages="serverValidation.company" v-model="trial.company" label="Company"
                                    type="text" name="company" hint="Required" required validate-on-blur @focus="serverValidation.company = []"/>
                      <v-autocomplete :rules="[rules.required]" :error-messages="serverValidation.country" v-model="trial.country" label="Country"
                                    type="text" name="country" :items="listCountry" prepend-icon="language" hint="Required" required validate-on-blur @focus="serverValidation.country = []"/>
                      <v-select :rules="[rules.required]" v-model="trial.linkSpeed" label="Link speed category"
                                :items="linkSpeed" hint="Required" required validate-on-blur/>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="error" dark @click="trialClose">Cancel</v-btn>
                      <v-btn id="btn_submit" color="success" dark type="submit">Submit</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-form>
              </v-dialog>
            </v-flex>
            <hr>
            <ul>
              <li>License applies to a single appliance</li>
              <li>The Software may not be modified or resold</li>
              <li>By downloading, installing or using the product in any way the Licensee agree to the terms of this agreement.</li>
            </ul>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex>
        <v-card class="elevation-3" height="100%">
          <v-card-title class="pa-2 ">
            <h6 class="subheading">Terms and conditions</h6>
          </v-card-title>
          <v-card-text>
            <ol>
              <li>
                Preamble: This Agreement governs the relationship between the End User, Entity or Company, (hereinafter: Licensee) and Wanos Networks Pty(Ltd), a duly registered company (Hereinafter: Licensor).
                This Agreement sets the terms, rights, restrictions and obligations on using [Wanos] (hereinafter: The Software) created and owned by Licensor, as detailed herein
              </li>
              <li>
                License Grant: Licensor hereby grants Licensee a Non-assignable & non-transferable, Non-commercial, without the rights to modify the software, Non-exclusive license,
                all with accordance with the terms set forth and other legal restrictions set forth in 3rd party software used while running Software.
              </li>
              <li>
                Prior Inspection: Licensee hereby states that he inspected The Software thoroughly and found it satisfactory and adequate to his needs and that it does not interfere with his regular operation.
              </li>
              <li>
                Non-Commercial: Licensee may not resell the Software or use any part for commercial purposes.
              </li>
              <li>
                Term & Termination: The Terms of this license shall be until terminated.
              </li>
              <li>
                Upgrades, Updates and Fixes: Licensor may provide Licensee, from time to time, with Upgrades, Updates or Fixes, according to his sole discretion.
                Licensee hereby warrants to keep The Software up-to-date and install all relevant updates and fixes, and may, at his sole discretion, purchase upgrades, according to the rates set by Licensor.
                Nothing in this Agreement shall require Licensor to provide Updates or Fixes.
              </li>
              <li>
                Support: Software is provided under an AS-IS basis and without any support, updates or maintenance. Nothing in this Agreement shall require Licensor to provide Licensee with support or fixes to any bug,
                failure, mis-performance or other defect in The Software.
              </li>
              <li>
                Liability: To the extent permitted under Law, The Software is provided under an AS-IS basis. Licensor shall never, and without any limit, be liable for any damage, cost, expense
                or any other payment incurred by Licensee as a result of using the Software.
              </li>
              <li>
                No-Warranty: The Software is provided without any warranty; Licensor hereby disclaims any warranty that The Software shall be error free or without defects.
              </li>
              <li>
                Indemnification: Licensee hereby warrants to hold Licensor harmless and indemnify Licensor for any lawsuit brought against it in regards to Licensee use of The Software in means that violate,
                breach or otherwise circumvent this license, Licensor's intellectual property rights or Licensor's title in The Software.
              </li>
              <li>
                Governing Law, Jurisdiction: Licensee hereby agrees not to initiate class-action lawsuits against Licensor in relation to this license and to compensate Licensor for any legal fees,
                cost or attorney fees should any claim brought by Licensee against Licensor be denied, in part or in full.
              </li>
            </ol>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState } from "vuex"
import { WanosApi } from '@/api/wanos.api'
import config from '@/config'
import countries from '@/json/countryList.json'
import ValidationRules from '@/plugins/validationRules'

export default
{
  name: 'License',
  mixins: [ValidationRules],
  data() {
    return {
      license: {},
      dialogAdd: false,
      dialogTrial: false,
      newLicense: '',
      trial:
        {
          firstName: '',
          lastName: '',
          email: '',
          company: '',
          country: '',
          linkSpeed: '1/10',
        },
      serverValidation: {
        newLicense: [],
        firstName: [],
        lastName: [],
        email: [],
        company: [],
        country: [],
        linkSpeed: [],
      },
      linkSpeed:
      [
        {
          text: 'Mbps 1 Up / 10 Down',
          value: '1/10',
        },
        {
          text: 'Mbps 2 Up / 20 Down',
          value: '2/20',
        },
        {
          text: 'Mbps 4 Up / 40 Down',
          value: '4/40',
        },
        {
          text: 'Mbps 6 Up / 60 Down',
          value: '6/60',
        },
        {
          text: 'Mbps 10 Up / 100 Down',
          value: '10/100',
        },
        {
          text: 'Mbps 20 Up / 200 Down',
          value: '20/200',
        },
      ],
    }
  },
  computed:
    {
      ...mapState(["activeOrg", "activeDevice"]),
      listCountry() {
        return countries;
      }
    },
  watch: {
    dialogAdd (val) {
      val ? this.focusLicense() : this.licenseClose()
    },
    dialogTrial (val) {
      val ? this.focusTrial() : this.trialClose()
    },
  },
  mounted() {
    this.fetchData();
  },
  methods:
    {
      async fetchData() {
        try {
          this.license = await WanosApi.getLicense(this.activeOrg._id, this.activeDevice._id);
        } catch (err) {
          console.error(err);
        }
      },
      licenseClose() {
        this.dialogAdd = false;
        this.$root.$off('validation', this.onValidation);
        // reset so we always start with empty field
        setTimeout(() => {
          this.newLicense = '';
        }, 250);
      },
      focusLicense() {
        this.$root.$on('validation', this.onValidation);
          this.$nextTick(() => {
          this.$refs.new_license.focus();
        });
      },
      async addLicense() {
        if (!this.$refs.frm_license.validate()) {
          return;
        }
        try {
          this.license = await WanosApi.addLicense(this.activeOrg._id, this.activeDevice._id, this.license.token, this.newLicense);
        } catch (err) {
          console.error(err);
        }
      },
      trialClose() {
        this.dialogTrial = false;
        this.$root.$off('validation', this.onValidation);
        // reset so we always start with empty fields
        setTimeout(() => {
          this.trial = {
            firstName: '',
            lastName: '',
            email: '',
            company: '',
            country: '',
            linkSpeed: '1/10',
          };
        }, 250);
      },
      focusTrial() {
        this.$root.$on('validation', this.onValidation);
        this.$nextTick(() => {
          this.$refs.fname.focus();
        });
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
  .license_table
  {
    width: 100%;
  }

  .license_table td:first-child
  {
    padding-right: 20px;
  }

  .license_table td
  {
    white-space: nowrap;
  }

  .token_field .v-input__slot
  {
    margin: 4px 0 0;
  }

  .token_field .v-text-field__details
  {
    padding: 0 !important;
    margin: 0 !important;
  }

  .token_field .v-messages
  {
    min-height: auto;
  }
</style>
