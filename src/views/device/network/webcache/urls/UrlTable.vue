<template>
  <div>
    <h3>Number of URLs: {{ urls.length }}</h3>
    <v-data-table :headers="headers" :items="sortedUrls" item-key="url" :pagination.sync="pagination"
                  :total-items="urls.length" hide-actions must-sort class="elevation-1 striped_table">
      <template slot="items" slot-scope="props">
        <tr align="center">
          <td align="left">
            <a :href="'http://' + props.item.url" target="_blank">{{ props.item.url }}</a>
          </td>
          <td>{{ props.item.requests }} <span class="italic">({{ totalReqs ? (100 * props.item.requests / totalReqs).toFixed(2) : 0 }})</span></td>
          <td>{{ props.item.bytes | megabyte }} <span class="italic">({{ totalBytes ? (100 * props.item.bytes / totalBytes).toFixed(2) : 0 }})</span></td>
          <td>{{ props.item.duration | secondsTime }} <span class="italic">({{ totalDuration ? (100 * props.item.duration / totalDuration).toFixed(2) : 0 }})</span></td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script>
export default
{
  name: 'CacheUrlTable',
  props:
    {
      urls:
        {
          type: Array,
          default: () => []
        },
      sortedBy:
        {
          type: String,
          default: 'requests'
        }
    },
  data() {
    return {
      pagination:
        {
          sortBy: this.sortedBy,
          descending: true
        },
      headers:
        [
          {
            text: 'URL',
            align: 'left',
            class: 'font-weight-black',
            sortable: false
          },
          {
            text: 'Requests (%)',
            align: 'center',
            class: 'font-weight-black',
            value: 'requests',
            sortable: true
          },
          {
            text: 'Megabytes (%)',
            align: 'center',
            class: 'font-weight-black',
            value: 'bytes',
            sortable: true
          },
          {
            text: 'Duration (%)',
            align: 'center',
            class: 'font-weight-black',
            value: 'duration',
            sortable: true
          },
        ]
    }
  },
  computed:
    {
      totalReqs() {
        return this.urls.reduce((acc, item) => {
          return acc + item.requests;
        }, 0);
      },
      totalBytes() {
        return this.urls.reduce((acc, item) => {
          return acc + item.bytes;
        }, 0);
      },
      totalDuration() {
        return this.urls.reduce((acc, item) => {
          return acc + item.duration;
        }, 0);
      },
      sortedUrls() {
        // we want the rows to always be sorted in descending order
        // so we set the "total-items" prop of the data-table and
        // then watch "pagination" to detect on which column to sort
        const col = this.pagination.sortBy;
        return this.urls.slice().sort((a,b) => b[col] - a[col]);
      },
    },
  watch:
    {
      pagination:
        {
          handler(newVal, oldVal) {
            this.pagination.descending = true;
            if(!oldVal.descending || oldVal.sortBy !== newVal.sortBy) this.$emit('fetch',newVal.sortBy); // avoid needless API calls
          },
          deep: true
        },
    }
}
</script>

<style>
  .italic
  {
    font-style: italic;
  }
</style>
