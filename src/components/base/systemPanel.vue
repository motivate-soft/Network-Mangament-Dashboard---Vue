<template>
  <v-card-text>
    <v-layout row wrap>
      <v-flex xs12 ref="chartref" class="pa-0 ma-2" style="height: 500px;"/>
    </v-layout>
    <v-data-table v-if="info.summary && info.summary.columnList" :headers="summaryHeaders" :items="coloredSeries" item-key="name" hide-actions>
      <template slot="items" slot-scope="props">
        <tr>
          <td style="cursor: pointer;" @click="toggleSeries(props.index)">
            <!-- after removing the Legend by Antonie, we use this column for toggling series on/off -->
            <div class="item_color_flag" :style="{'background-color': visibles[props.index] ? props.item.color : '#FFFFFF'}"/>
            {{ props.item.name }}
          </td>
          <template v-for="(col,idx) in info.summary.columnList">
            <td :key="idx">{{ unitValue(props.item.summaryValueList[idx], col.unit) }}</td>
          </template>
        </tr>
      </template>
    </v-data-table>
  </v-card-text>
</template>

<script>
import { create, color, NumberFormatter, ColorSet } from "@amcharts/amcharts4/core"
import { XYChart, XYCursor, DateAxis, ValueAxis, LineSeries } from "@amcharts/amcharts4/charts"; // Antonie does not need the Legend
import { mapGetters } from 'vuex'

export default
{
  name: 'systemPanel',
  props:
    {
      info:
        {
          type: Object,
          required: true
        },
    },
  data() {
    return {
      chart: null,
      xAxis: null,
      yAxis: null,
      visibles: [], // boolean flags - which series is toggled on/off
    }
  },
  computed:
    {
      ...mapGetters(['darkTheme']),
      summaryHeaders() {
        const result = [
          {
            text: '',
            class: 'font-weight-black',
            sortable: false
          }
        ];
        return this.info.summary && this.info.summary.columnList ? result.concat(this.info.summary.columnList.map(item => {
          return {
            text: item.name,
            class: 'font-weight-black',
            sortable: false
          }
        })) : result;
      },
      coloredSeries() {
        const colorSet = new ColorSet();
        return this.info.seriesList ? this.info.seriesList.map(item => {
          item.color = colorSet.next();
          return item;
        }) : [];
      },
      unit() {
        return this.info.unit;
      },
    },
  watch:
    {
      darkTheme () {
        this.updateChart();
      }
    },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose();
    }
  },
  mounted() {
    this.createChart()
  },
  methods:
    {
      unitValue(value, unit) {
        if(typeof value !== 'number') return null;
        const flt = this.$options.filters;
        value = flt.maxDecimalPoints(value);
        switch (unit) {
          case 'rate':
            return flt.bandwidth(value);
          case 'bytes':
            return flt.traffic(value);
          case 'percentage':
            return value + ' %';
          default:
            return value + ' ' + unit;
        }
      },
      createChart() {
        this.chart = create(this.$refs.chartref, XYChart);
        this.chart.paddingRight = 30; // otherwise the last label on X-axis will be clipped

        this.chart.cursor = new XYCursor();
        this.chart.cursor.behavior = "zoomX";

        let xAxis = this.xAxis = this.chart.xAxes.push(new DateAxis());
        let yAxis = this.yAxis = this.chart.yAxes.push(new ValueAxis());

        xAxis.dataFields.dateX = "x";
        xAxis.renderer.minGridDistance = 50;
        xAxis.renderer.grid.template.location = 0.5;
        xAxis.renderer.labels.template.location = 0.5;
        xAxis.tooltipDateFormat = 'yyyy MMM d, HH:mm';

        yAxis.min = 0;
        yAxis.numberFormatter = new NumberFormatter();
        yAxis.maxPrecision = 0;
      },
      themeColors() {
        const col = this.darkTheme ? color('#FFF') : color('#000');
        const xAxis = this.xAxis;
        const yAxis = this.yAxis;
        xAxis.renderer.grid.template.stroke = col;
        xAxis.renderer.labels.template.fill = col;
        yAxis.renderer.grid.template.stroke = col;
        yAxis.renderer.labels.template.fill = col;
      },
      createSeries() {
        let suffix = '';
        let numFormat = '#';
        const points = this.info;
        const unit = points.unit;
        switch (unit) {
          case 'rate':
            numFormat = "#.0 a'bps'";
            break;
          case 'bytes':
            numFormat = "#.0 b";
            suffix = 'B';
            break;
          case 'percentage':
            numFormat = "# '%'";
            break;
          default:
        }
        this.yAxis.numberFormatter.numberFormat = numFormat;
        const prefixes = [
          { "number": 1024, "suffix": "K" + suffix },
          { "number": 1024 * 1024, "suffix": "M" + suffix },
          { "number": 1024 * 1024 * 1024, "suffix": "G" + suffix },
        ];
        this.yAxis.numberFormatter.bigNumberPrefixes = prefixes;
        const series = this.chart.series;
        // we have to reset the series AND the colors - because we do not recreate the chart when updating the values (to speedup the things a little)
        // and without a reset we get different colors every time the chart is redrawn
        while(series.length > 0) series.removeIndex(0).dispose();
        this.chart.colors.reset();
        let index = 0;
        this.visibles = [];
        for (let s of points.seriesList) {
          index++;
          const lineSeries = new LineSeries();
          lineSeries.dataFields.valueY = 'y' + index;
          lineSeries.dataFields.dateX = "x";
          lineSeries.name = s.name;
          // lineSeries.tensionX = 0.8;
          lineSeries.tooltipText = "{name} = {valueY}"; // ({dateX})
          lineSeries.tooltip.numberFormatter.numberFormat = numFormat;
          lineSeries.tooltip.numberFormatter.bigNumberPrefixes = prefixes;
          lineSeries.fillOpacity = 0.3;
          series.push(lineSeries);
          this.visibles.push(true);
        }
      },
      updateChart() {
        const points = this.info;
        this.themeColors();
        this.createSeries();
        this.chart.data = points.timeList.map((item,idx) => {
          const obj = {
            x: new Date(item)
          };
          let index = 0;
          for(let s of points.seriesList) {
            index++;
            obj['y' + index] = s.valueList[idx];
          }
          return obj;
        });
        this.chart.deepInvalidate();
      },
      toggleSeries(idx) {
        const series = this.chart.series.getIndex(idx);
        if (series.isHiding || series.isHidden) {
          series.show();
          this.visibles.splice(idx, 1, true);
        } else {
          series.hide();
          this.visibles.splice(idx, 1, false);
        }
      }
    }
}
</script>

<style>
  .item_color_flag
  {
    display: inline-block;
    width: 16px;
    height: 16px;
    border-radius: 2px;
    margin-bottom: -4px;
    border: 1px solid black;
  }
</style>
