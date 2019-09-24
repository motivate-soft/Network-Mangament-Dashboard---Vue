<template>
  <div class="pie-chart-group">
    <div class="pie-chart-text"><strong>{{ caption }}</strong> {{ counter ? '(' + counter + ')' : '' }}</div>
    <div ref="chart" :style="{minHeight: height + 'px'}"/>
  </div>
</template>

<script>
import * as am4core from "@amcharts/amcharts4/core"
import * as am4charts from "@amcharts/amcharts4/charts"
import { mapGetters } from 'vuex'

const legendItemSize = 43; // used to auto-adjust the height of the chart container
const amLogoHeight = 25; // the height of AmCharts logo in the bottom left corner

export default
{
  name: 'pieChart',
  props:
    {
      caption:
        {
          type: String,
          default: ''
        },
      counter:
        {
          type: String,
          default: ''
        },
      segments:
        {
          // array of objects {label: String, percentage: Number}
          type: Array,
          default: () => []
        },
      height:
        {
          type: Number,
          default: 250
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
      segments() {
        if (this.chart) this.chart.data = this.segments;
      },
      darkTheme() {
        if (this.chart) {
          const col = this.darkTheme ? am4core.color('#FFF') : am4core.color('#000');
          this.chart.legend.labels.template.fill = col;
          this.chart.legend.valueLabels.template.fill = col;
        }
      }
    },
  mounted() {
    let chart = am4core.create(this.$refs.chart, am4charts.PieChart);
    // Make it a donut chart
    chart.innerRadius = am4core.percent(50);

    // Show a legend
    chart.legend = new am4charts.Legend();
    chart.legend.position = 'left';
    chart.legend.valueLabels.template.text = '{tooltip} ({value}%)';
    const col = this.darkTheme ? am4core.color('#FFF') : am4core.color('#000');
    chart.legend.labels.template.fill = col;
    chart.legend.valueLabels.template.fill = col;

    let pieSeries = chart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "percentage";
    pieSeries.dataFields.category = "label";

    pieSeries.slices.template.stroke = am4core.color("#fff");
    pieSeries.slices.template.strokeWidth = 1;
    pieSeries.slices.template.strokeOpacity = 1;
    pieSeries.slices.template.tooltipText = '{category} {tooltip} ({value.value}%)';

    pieSeries.labels.template.disabled = true;
    pieSeries.ticks.template.disabled = true;

    // Create a base filter effect (as if it's not there) for the hover to return to
    const shadow = pieSeries.slices.template.filters.push(new am4core.DropShadowFilter);
    shadow.opacity = 0;

    // Create hover state
    const hoverState = pieSeries.slices.template.states.getKey("hover"); // normally we have to create the hover state, in this case it already exists

    // Slightly shift the shadow and make it more prominent on hover
    const hoverShadow = hoverState.filters.push(new am4core.DropShadowFilter);
    hoverShadow.opacity = 0.7;
    hoverShadow.blur = 5;

    // increase height of the container if needed
    chart.events.on('datavalidated', ev => {
      // Get objects of interest
      let chart = ev.target;
      let legend = chart.legend;

      // Calculate how we need to adjust chart height
      let adjustedHeight = chart.data.length * legendItemSize - legend.pixelHeight + amLogoHeight;

      // Set it on chart's container
      if (adjustedHeight > chart.pixelHeight) {
        chart.svgContainer.htmlElement.style.height = adjustedHeight + "px";
        legend.valign = 'top';
      }
    });

    chart.data = this.segments;
    this.chart = chart;
  },

  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose();
    }
  }
}
</script>

<style>
  .pie-chart-group
  {
    position: relative;
  }

  .pie-chart-text
  {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
  }
</style>
