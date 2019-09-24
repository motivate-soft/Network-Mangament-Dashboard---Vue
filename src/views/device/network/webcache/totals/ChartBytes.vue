<template>
  <xy-chart :series="seriesBytes" :points="points" :height="300"/>
</template>

<script>
import xyChart from "@/components/base/xyChart.vue"

export default
{
  name: 'WebcacheTotalsChartBytes',
  components:
    {
      xyChart
    },
  props:
    {
      points:
        {
          type: Array,
          default: () => []
        }
    },
  data() {
    return {
      seriesBytes: [
        {
          name: "Total (Hit+Miss)",
          valueField: "total",
          tooltipText: "{valueY} MB total",
          numberFormat: "#.00",
          fillColor: "#6e9dc9",
          strokeColor: "#6e9dc9",
          //fillOpacity: 0.6,
        },
        {
          name: "Hits",
          valueField: "hits",
          tooltipText: "{valueY} MB hits",
          numberFormat: "#.00",
          fillColor: "#f4ab3a",
          strokeColor: "#f4ab3a",
          //fillOpacity: 0.6,
        },
        {
          name: "Misses",
          valueField: "misses",
          tooltipText: "{valueY} MB misses",
          numberFormat: "#.00",
          fillColor: "#ac7fa8",
          strokeColor: "#ac7fa8",
          //fillOpacity: 0.6,
        },
        {
          name: "Denied",
          valueField: "denied",
          tooltipText: "{valueY} MB denied",
          numberFormat: "#.00",
          fillColor: "#8dbd0f",
          strokeColor: "#8dbd0f",
          //fillOpacity: 0.6,
        },
      ],
    }
  }
}
</script>
