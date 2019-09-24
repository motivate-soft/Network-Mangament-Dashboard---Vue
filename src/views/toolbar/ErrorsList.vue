<template>
  <v-dialog :value="value" max-width="80%" content-class="auto error-list" scrollable @keydown.esc="$emit('input',false)" @input="$emit('input',false)">
    <v-card>
      <v-card-title class="title dense primary white--text">Notifications</v-card-title>
      <v-card-text style="max-height: 75vh;">
        <v-data-table :headers="errHeaders" :items="errors" item-key="key" hide-actions>
          <template slot="items" slot-scope="row">
            <tr @click="row.expanded = !row.expanded">
              <td>{{ row.item.stamp | stampLocale }}</td>
              <td>{{ row.item.code }}</td>
              <td v-html="row.item.message"></td>
              <td class="text-xs-right">
                <v-icon v-if="row.item.fieldList && row.item.fieldList.length > 0" class="mr-2 edit-icons" @click.stop="row.expanded = !row.expanded">
                  {{ row.expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}
                </v-icon>
              </td>
              <td @click.stop="dismiss(row.index)">
                <v-btn fab dark small color="red">
                  <v-icon>clear</v-icon>
                </v-btn>
              </td>
            </tr>
          </template>
          <template slot="expand" slot-scope="row">
            <v-container style="padding: 8px;">
              <v-layout row>
                <v-flex xs12>
                  <v-data-table :headers="errFieldHeaders" :items="row.item.fieldList" item-key="field" hide-actions>
                    <template slot="items" slot-scope="props">
                      <td>{{ props.item.field }}</td>
                      <td>{{ props.item.code }}</td>
                      <td v-html="props.item.message"></td>
                    </template>
                  </v-data-table>
                </v-flex>
              </v-layout>
            </v-container>
          </template>
        </v-data-table>
      </v-card-text>
      <v-divider/>
      <v-card-actions>
        <v-spacer/>
        <v-btn color="primary" @click="$emit('input',false)">Close</v-btn>
        <v-btn color="primary" @click="dismissClose">Dismiss all</v-btn>
        <v-spacer/>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default
{
  name: 'ErrorList',
  props:
    {
      value:
        {
          type: Boolean,
          default: false
        }
    },
  data() {
    return {
      errHeaders:
        [
          {
            text: "Timestamp",
            value: "stamp",
            class: "subheading",
            width: '130px',
            sortable: false,
          },
          {
            text: "Code",
            value: "code",
            class: "subheading",
            width: '90px',
            sortable: false,
          },
          {
            text: "Error message",
            value: "message",
            class: "subheading",
            sortable: false,
          },
          {
            text: "",
            align: "right",
            width: '20px',
            sortable: false,
          },
          {
            text: "Dismiss",
            class: "subheading",
            align: "center",
            width: '60px',
            sortable: false,
          },
        ],
      errFieldHeaders:
        [
          {
            text: "Field",
            value: "field",
            class: "subheading",
            width: "120px",
            sortable: false
          },
          {
            text: "Code",
            value: "code",
            class: "subheading",
            width: "80px",
            sortable: false
          },
          {
            text: "Error message",
            value: "message",
            class: "subheading",
            sortable: false
          },
        ],
    }
  },
  computed:
    {
      ...mapState(['errors']),
    },
  methods:
    {
      ...mapActions(["dismissError", "dismissAll"]),
      dismiss(idx) {
        this.dismissError(idx);
      },
      dismissClose() {
        this.dismissAll();
        this.$emit('input', false);
      },
    }
}
</script>

<style>
  .error-list table.v-table thead tr
  {
    height: 36px;
  }

</style>
