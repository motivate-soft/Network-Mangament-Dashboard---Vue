<template>
  <div class="chord-chart-group">
    <div class="chord-chart-text">{{ caption }}</div>
    <div ref="chart" style="height: 100%;"/>
  </div>
</template>

<script>
import * as am4core from "@amcharts/amcharts4/core"
import * as am4charts from "@amcharts/amcharts4/charts"

export default
{
  name: 'ChordDiagram',
  props:
    {
      points:
        {
          // array of objects {source: String, destination: String, value: Number}
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
  watch:
    {
      points() {
        if (this.chart) this.chart.data = this.points;
      },
    },
  mounted() {
    let chart = am4core.create(this.$refs.chart, am4charts.ChordDiagram);
    chart.radius = am4core.percent(50);
    chart.dataFields.fromName = 'source';
    chart.dataFields.toName = 'destination';
    chart.dataFields.value = 'value';

    chart.colors.saturation = 0.65;
    chart.colors.step = 3;
    chart.nodePadding = 0.5;
    chart.minNodeSize = 0.01;

    const nodeTemplate = chart.nodes.template;
    nodeTemplate.readerTitle = "Click to show/hide or drag to rearrange";
    nodeTemplate.showSystemTooltip = true;
    nodeTemplate.tooltipText = '{fromName} → {toName} = {tooltip}';

    // when rolled over the node, make all the links rolled-over
    nodeTemplate.events.on("over", function (event) {
      let node = event.target;
      node.outgoingDataItems.each(function (dataItem) {
        if(dataItem.toNode) {
          dataItem.link.isHover = true;
          dataItem.toNode.label.isHover = true;
        }
      });
      node.incomingDataItems.each(function (dataItem) {
        if(dataItem.fromNode) {
          dataItem.link.isHover = true;
          dataItem.fromNode.label.isHover = true;
        }
      });

      node.label.isHover = true;
    });

    // when rolled out from the node, make all the links rolled-out
    nodeTemplate.events.on("out", function (event) {
      let node = event.target;
      node.outgoingDataItems.each(function (dataItem) {
        if(dataItem.toNode) {
          dataItem.link.isHover = false;
          dataItem.toNode.label.isHover = false;
        }
      });
      node.incomingDataItems.each(function (dataItem) {
        if(dataItem.fromNode) {
          dataItem.link.isHover = false;
          dataItem.fromNode.label.isHover = false;
        }
      });

      node.label.isHover = false;
    });

    const label = nodeTemplate.label;
    label.relativeRotation = 90;
    label.fillOpacity = 0.35;
    label.fontSize = 12;
    const labelHS = label.states.create("hover");
    labelHS.properties.fillOpacity = 1;

    nodeTemplate.cursorOverStyle = am4core.MouseCursorStyle.pointer;

    // link template
    const linkTemplate = chart.links.template;
    linkTemplate.strokeOpacity = 0;
    linkTemplate.fillOpacity = 0.25;
    linkTemplate.tooltipText = '{fromName} → {toName} = {tooltip}';

    const hoverState = linkTemplate.states.create("hover");
    hoverState.properties.fillOpacity = 0.7;
    hoverState.properties.strokeOpacity = 0.7;

    chart.data = this.points;
    this.chart = chart;
  },

  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose();
    }
  },
}
</script>

<style>
  .chord-chart-group
  {
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .chord-chart-text
  {
    text-align: center;
    font-weight: bold;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
  }

</style>
