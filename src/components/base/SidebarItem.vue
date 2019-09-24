<template>
  <v-list-tile :to="route" :href="href" :target="href ? '_blank' : ''" exact ripple>
    <v-list-tile-action>
      <v-icon>{{ icon }}</v-icon>
    </v-list-tile-action>
    <v-list-tile-content>
      <v-list-tile-title>{{ caption }}</v-list-tile-title>
    </v-list-tile-content>
  </v-list-tile>
</template>

<script>
export default
{
  name: 'SidebarItem',
  props:
    {
      caption:
        {
          type: String,
          default: ''
        },
      icon:
        {
          type: String,
          default: ''
        },
      route:
        {
          type: [Object, String],
          default: null
        },
      href:
        {
          type: String,
          default: null
        }
    }
}
</script>
