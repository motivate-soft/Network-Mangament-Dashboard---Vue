<template>
  <div ref="chartref" class="line-chart"/>
</template>

<style scoped>
.line-chart
{
  width: 100%;
  height: 235px;
}
</style>

<script>
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import { mapGetters } from 'vuex'
//import am4themes_animated from "@amcharts/amcharts4/themes/animated";
//am4core.useTheme(am4themes_animated);


// The series prop should be an array of objects describing each series in the chart.
// Each series object should be in the following format:
// {
//   valueField,    // Name of the field inside intervalData object to be used as value for the series
//   name,          // Name of the series
//   tooltipText,   // Optional - Tooltip text, see amCharts for more information. Default "{valueY}"
//   numberFormat,  // Optional - Format of the numbers in this series. Default "#.00a"
//   fillColor,     // Optional - Fill color of the series
//   strokeColor,   // Optional - Stroke color of the series
//   fillOpacity,   // Optional - Fill opacity. Default 0.3
// }
//
// The intervalData prop is the object that will be used as data values for each series' interval.
// The idea is that the consumer of IntervalLineChart should periodically update intervalData with
// new values, so that IntervalLineChart can add a new data point for each series.

export default {
  name: "IntervalLineChart",

  props:
  {
    columns:
    {
      type: Number,
      default: 30
    },
    populateDefaultValues:
    {
      type: Boolean,
      default: true
    },
    yAxisNumberFormat:
    {
      type: String,
      default: "#."
    },
    series:
    {
      type: Array,
      default: () => []
    },
    intervalData:
    {
      type: Object,
      default: () => ({})
    },
    reset:
    {
      type: Number,
      default: null
    }
  },

  data() {
    return {};
  },

  computed:
    {
      ...mapGetters(['darkTheme']),
    },
  watch:
  {
    intervalData(data) {
      if (data) {
        this.updateIntervalData(data);
      }
    },
    reset() {
      if (this.chart) {
        this.chart.dispose();
        this.createChart();
      }
    },
    darkTheme() {
      if (this.chart) this.themeColors();
    },
  },

  created() {
    this.$Progress.start();
  },

  mounted() {
    this.createChart();
  },

  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose();
    }
  },

  methods:
  {
    createChart() {
      this.tick = 0;
      this.chart = am4core.create(this.$refs.chartref, am4charts.XYChart);

      this.chart.events.on("ready", () => {
          this.$Progress.finish();
      });

      this.chart.padding(10, 0, 0, 0);
      this.chart.zoomOutButton.disabled = true;

      this.chart.cursor = new am4charts.XYCursor();
      this.chart.cursor.lineY.disabled = true;
      this.chart.cursor.lineX.disabled = true;
      this.chart.cursor.behavior = "none";

      this.chart.legend = new am4charts.Legend();
      this.chart.legend.useDefaultMarker = true;
      let markerTemplate = this.chart.legend.markers.template;
      markerTemplate.width = 10;
      markerTemplate.height = 10;

      let xAxis = this.chart.xAxes.push(new am4charts.CategoryAxis());
      let yAxis = this.chart.yAxes.push(new am4charts.ValueAxis());

      xAxis.dataFields.category = "tick";
      xAxis.renderer.minGridDistance = 1;
      xAxis.renderer.labels.template.disabled = true;
      xAxis.cursorTooltipEnabled = false;

      yAxis.min = 0;
      yAxis.numberFormatter = new am4core.NumberFormatter();
      yAxis.numberFormatter.numberFormat = this.yAxisNumberFormat;
      yAxis.cursorTooltipEnabled = false;
      yAxis.maxPrecision = 0;
      //yAxis.extraMax = 0.2;

      this.createSeries();
      this.initData();
      this.themeColors();
    },

    createSeries() {
      for (let s of this.series) {
        let lineSeries = this.chart.series.push(new am4charts.LineSeries());
        lineSeries.dataFields.valueY = s.valueField;
        lineSeries.dataFields.categoryX = "tick";
        lineSeries.name = s.name;
        lineSeries.tooltipText = s.tooltipText || "{valueY}";
        lineSeries.tooltip.numberFormatter.numberFormat = s.numberFormat || "#.00a";
        if (s.fillColor) {
          lineSeries.fill = am4core.color(s.fillColor);
        }
        if (s.strokeColor) {
          lineSeries.stroke = am4core.color(s.strokeColor);
        }
        lineSeries.fillOpacity = s.fillOpacity || 0.3;
      }
    },

    initData() {
      let data = [];
      if (this.populateDefaultValues) {
        for (let i = 0; i < this.columns; i++) {
          this.tick++;
          let item = {};
          for (let s of this.series) {
            item[s.valueField] = s.defaultValue || 0;
          }
          item.tick = this.tick;
          data.push(item);
        }
      }
      this.chart.data = data;
    },

    updateIntervalData(data) {
      this.tick++;
      let dataItem = JSON.parse(JSON.stringify(data));
      dataItem.tick = this.tick;
      let seriesLen = this.chart.series.getIndex(0).dataItems.length;
      this.chart.addData(dataItem, seriesLen > this.columns ? seriesLen - this.columns : 0);
    },

    themeColors() {
      const col = this.darkTheme ? am4core.color('#FFF') : am4core.color('#000');
      const xAxis = this.chart.xAxes.getIndex(0);
      const yAxis = this.chart.yAxes.getIndex(0);
      xAxis.renderer.grid.template.stroke = col;
      xAxis.renderer.labels.template.fill = col;
      yAxis.renderer.grid.template.stroke = col;
      yAxis.renderer.labels.template.fill = col;
    },

  },

};
</script>
