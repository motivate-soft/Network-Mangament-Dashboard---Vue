<template>
  <v-layout row wrap>
    <v-flex md9>
      <v-data-table :headers="gridHeaders"
                    :items="chartData"
                    :rows-per-page-items="rowsPerPage"
                    :pagination.sync="pagination"
                    hide-actions
                    must-sort
                    item-key="port"
                    class="striped_table">
        <template slot="items" slot-scope="props">
          <tr @click="clicked(props.item)">
            <td>{{ props.item.label }}</td>
            <td>{{ props.item.percentage }}</td>
            <td :title="'Bytes: ' + props.item.lanBytes">{{ props.item.lanBytes | megabyte | maxDecimalPoints(1) }}</td>
            <td>
              <app-progress-linear :value="props.item.optimization"
                                   :text="props.item.optimization | maxDecimalPoints(1) + '%'"
                                   :height="18"
                                   :background-opacity="0"
                                   color="success"
              />
            </td>
            <td :title="'Bytes: ' + props.item.wanBytes">{{ props.item.wanBytes | megabyte | maxDecimalPoints(1) }}</td>
          </tr>
        </template>
      </v-data-table>
    </v-flex>
    <v-flex md3>
      <div ref="chartref" class="pie-chart"/>
    </v-flex>
  </v-layout>
</template>

<style scoped>
.pie-chart
{
  width: 100%;
  height: 400px;
}
</style>

<script>
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import AppProgressLinear from "@/components/base/AppProgressLinear.vue";
//import am4themes_animated from "@amcharts/amcharts4/themes/animated";

//am4core.useTheme(am4themes_animated);


// The chartData prop should be an array of objects, with each object
// in the following format:
// {
//   label,
//   lanBytes,
//   wanBytes,
//   percentage,
//   port
// }

export default {
  name: "TopProtocols",

  components:
  {
    AppProgressLinear
  },

  props:
  {
    chartData:
    {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      gridHeaders: [
        {
          text: "Application",
          value: "label",
          class: "subheading",
          align: "left"
        },
        {
          text: "LAN Traffic %",
          value: "percentage",
          class: "subheading",
          align: "left"
        },
        {
          text: "LAN MB",
          value: "lanBytes",
          class: "subheading",
          align: "left"
        },
        {
          text: "Optimization",
          value: "optimization",
          class: "subheading",
          align: "left"
        },
        {
          text: "WAN MB",
          value: "wanBytes",
          class: "subheading",
          align: "left"
        }
      ],
      rowsPerPage: [
        {
          text: "$vuetify.dataIterator.rowsPerPageAll",
          value: -1
        }, 5, 10, 25],
      pagination:
      {
        sortBy: "percentage",
        descending: true,
        rowsPerPage: -1
      }
    };
  },

  watch:
  {
    chartData: function(data) {
      if (data) {
        this.updateChartData(data);
      }
    }
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
    clicked(item) {
      console.log(item);
    },
    createChart() {
      this.chart = am4core.create(this.$refs.chartref, am4charts.PieChart);
      // Make it a donut chart
      this.chart.innerRadius = am4core.percent(50);

      this.createSeries();
    },

    createSeries() {
      let pieSeries = this.chart.series.push(new am4charts.PieSeries());
      pieSeries.dataFields.value = "percentage";
      pieSeries.dataFields.category = "label";

      pieSeries.slices.template.stroke = am4core.color("#fff");
      pieSeries.slices.template.strokeWidth = 1;
      pieSeries.slices.template.strokeOpacity = 1;

      pieSeries.labels.template.disabled = true;
      pieSeries.ticks.template.disabled = true;
    },

    updateChartData() {
      this.chart.data = this.chartData;
    }
  },

};
</script>
