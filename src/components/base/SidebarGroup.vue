<template>
  <v-list-group v-model="group.active"
                :prepend-icon="group.icon"
                no-action
                sub-group>
    <v-list-tile slot="activator" @click="$emit('toggle')">
      <v-list-tile-content>
        <v-list-tile-title>{{ group.title }}</v-list-tile-title>
      </v-list-tile-content>
      <v-list-tile-action>
        <v-icon>{{ group.active ? 'expand_less' : 'expand_more' }}</v-icon>
      </v-list-tile-action>
    </v-list-tile>
    <v-list-tile v-for="subItem in group.items"
                 :key="subItem.title"
                 :to="subItem.path"
                 v-show="subItem.hidden ? $root.isDEV : true"
    >
      <v-list-tile-content>
        <v-list-tile-title>{{ subItem.title }}</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
  </v-list-group>
</template>

<script>
export default
{
  name: 'SidebarGroup',
  props:
    {
      group:
        {
          type: Object,
          required: true
        }
    },
}
</script>
