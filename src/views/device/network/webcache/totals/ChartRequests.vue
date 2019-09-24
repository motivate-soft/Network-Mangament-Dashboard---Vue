<template>
  <xy-chart :series="seriesRequests" :points="points" :height="300"/>
</template>

<script>
import xyChart from "@/components/base/xyChart.vue"

export default
{
  name: 'WebcacheTotalsChartRequests',
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
      seriesRequests: [
        {
          name: "Total (Hit+Miss)",
          valueField: "total",
          tooltipText: "{valueY} total",
          numberFormat: "#.",
          fillColor: "#6e9dc9",
          strokeColor: "#6e9dc9",
          //fillOpacity: 0.6,
        },
        {
          name: "Hits",
          valueField: "hits",
          tooltipText: "{valueY} hits",
          numberFormat: "#.",
          fillColor: "#f4ab3a",
          strokeColor: "#f4ab3a",
          //fillOpacity: 0.6,
        },
        {
          name: "Misses",
          valueField: "misses",
          tooltipText: "{valueY} misses",
          numberFormat: "#.",
          fillColor: "#ac7fa8",
          strokeColor: "#ac7fa8",
          //fillOpacity: 0.6,
        },
        {
          name: "Denied",
          valueField: "denied",
          tooltipText: "{valueY} denied",
          numberFormat: "#.",
          fillColor: "#8dbd0f",
          strokeColor: "#8dbd0f",
          //fillOpacity: 0.6,
        },
      ],
    }
  }
}
</script>
