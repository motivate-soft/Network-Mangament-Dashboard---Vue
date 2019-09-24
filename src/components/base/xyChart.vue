<template>
  <div class="xy-chart-group">
    <div class="xy-chart-text"><strong>{{ caption }}</strong></div>
    <div ref="chart" :style="{minHeight: height + 'px'}"/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as am4core from "@amcharts/amcharts4/core"
import * as am4charts from "@amcharts/amcharts4/charts"
//import am4themes_animated from "@amcharts/amcharts4/themes/animated"
//am4core.useTheme(am4themes_animated);


export default
{
  name: 'AMchartsXYchart',
  props:
    {
      series:
        {
          // array of objects with configuration
          type: Array,
          default: () => []
        },
      points:
        {
          // array of objects {period: String, total: Number, hits: Number, misses: Number, denied: Number}
          type: Array,
          default: () => []
        },
      height:
        {
          type: Number,
          default: 250
        },
      caption:
        {
          type: String,
          default: ''
        }
    },
  data() {
    return {
      chart: null
    }
  },
  computed:
    {
      ...mapGetters(['darkTheme']),
    },
  watch:
    {
      points() {
        if (this.chart) this.chart.data = this.points;
      },
      darkTheme() {
        if (this.chart) this.themeColors();
      }
    },
  mounted() {
    let chart = am4core.create(this.$refs.chart, am4charts.XYChart);

    let cursor = new am4charts.XYCursor();
    cursor.behavior = "none";
    chart.cursor = cursor;

    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "period";
    categoryAxis.renderer.minGridDistance = 1;

    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    // valueAxis.tooltip.disabled = true;
    valueAxis.renderer.minWidth = 35;
    valueAxis.min = 0;

    // create series
    this.series.forEach(s => {
      let lineSeries = chart.series.push(new am4charts.LineSeries());
      lineSeries.dataFields.valueY = s.valueField;
      lineSeries.dataFields.categoryX = "period";
      lineSeries.name = s.name;
      lineSeries.tooltipText = s.tooltipText || "{valueY.value}";
      lineSeries.tooltip.numberFormatter.numberFormat = s.numberFormat || "#.00a";
      if (s.fillColor) {
        lineSeries.fill = am4core.color(s.fillColor);
      }
      if (s.strokeColor) {
        lineSeries.stroke = am4core.color(s.strokeColor);
      }
      // lineSeries.fillOpacity = s.fillOpacity || 0.3;
    });
    chart.data = this.points;
    this.themeColors();
    this.chart = chart;
  },

  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose();
    }
  },
  methods:
    {
      themeColors() {
        const col = this.darkTheme ? am4core.color('#FFF') : am4core.color('#000');
        const xAxis = this.chart.xAxes.getIndex(0);
        const yAxis = this.chart.yAxes.getIndex(0);
        xAxis.renderer.grid.template.stroke = col;
        xAxis.renderer.labels.template.fill = col;
        yAxis.renderer.grid.template.stroke = col;
        yAxis.renderer.labels.template.fill = col;
      },
    }
}
</script>

<style>
  .xy-chart-group
  {
    position: relative;
  }

  .xy-chart-text
  {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
  }
</style>
