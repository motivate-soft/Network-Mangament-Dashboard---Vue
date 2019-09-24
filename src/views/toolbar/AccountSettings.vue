<template>
  <v-menu left offset-y>
    <v-btn slot="activator" flat style="text-transform: none;">
      <v-icon left>account_circle</v-icon>
      {{ user.email }}
    </v-btn>
    <v-list class="pt-0 pb-0">
      <div class="pa-2">
        {{ user.firstname + ' ' + (user.surname || '') }}
        <br>
        Email: {{ user.email }}
        <br>
        Role: {{ user.role === 'su' ? 'superuser' : 'organization' }}
        <br>
        Access: {{ user.accessRight === 'r' ? 'read' : 'write' }}
        <br>
        Organization: {{ userOrgs }}
      </div>
      <v-divider/>
      <v-list-tile :to="{name: 'userchangePassword'}" ripple>
        <v-list-tile-content>
          <v-list-tile-title>Change Password</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-divider/>
      <v-list-tile ripple @click="doLogout">
        <v-list-tile-content>
          <v-list-tile-title>Logout</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-divider/>
      <v-list-tile ripple @click="toggleDarkTheme">
        <v-list-tile-content>
          <v-list-tile-title>Dark Theme</v-list-tile-title>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-btn icon>
            <v-icon v-if="darkTheme">done</v-icon>
          </v-btn>
        </v-list-tile-action>
      </v-list-tile>
    </v-list>
  </v-menu>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'

export default
{
  name: 'AccountSettings',
  computed:
    {
      ...mapState(['user', 'orgs']),
      ...mapGetters(['darkTheme']),
      userOrgs() {
        const user = this.user;
        return this.orgs.filter(org => user.orgs.includes(org._id)).map(org => org.name).join(', ');
      },
    },
  methods:
    {
      ...mapActions(['logout', 'toggleDarkTheme']),
      doLogout () {
        this.logout().then(() => {
          this.$router.push('/');
        })
      }
    }
}
</script>
