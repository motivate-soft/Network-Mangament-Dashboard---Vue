<template>
  <div id="devicemap" ref="devicemapref" class="world-map"/>
</template>

<style scoped>
.world-map
{
  width: 100%;
  height: 350px;
}
</style>


<script>
import { mapState } from "vuex";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
//import am4themes_dark from "@amcharts/amcharts4/themes/dark";

am4core.useTheme(am4themes_animated);
//am4core.useTheme(am4themes_dark);

export default {
  name: "DeviceMap",

  data() {
    return {};
  },

  computed:
  {
    ...mapState(["devices", "activeOrg"])
  },

  watch:
    {
      devices:
        {
          handler(newVal, oldVal) {
            let shouldZoom = oldVal.length === 0;
            this.populateMapData(shouldZoom);
          },
          deep: true,
        }
    },

  mounted() {
    if (!this.map) {
      this.$nextTick(() => {
        this.createMap();
      });
    }
  },

  created() {
    this.map = null;
    this.mapPolygonSeries = null;
    this.mapLineSeries = null;
    this.mapImageSeries = null;
    this.mapZoomRectangle = null;

    this.initMapTemplates();
    this.populateMapData(true);
  },

  beforeDestroy() {
    if (this.map) {
      this.map.dispose();
      this.map = null;
    }
  },

  methods:
  {
    createMap() {
      let map = am4core.create(this.$refs.devicemapref, am4maps.MapChart);
      map.geodata = am4geodata_worldLow;
      map.projection = new am4maps.projections.Miller();
      map.zoomControl = new am4maps.ZoomControl();
      map.series.push(this.mapPolygonSeries);
      map.series.push(this.mapLineSeries);
      map.series.push(this.mapImageSeries);
      this.map = map;

      this.map.events.on("ready", () => {
        this.zoomMap();
      });
    },

    initMapTemplates() {
      // Configure polygon series
      let polygonSeries = new am4maps.MapPolygonSeries();
      polygonSeries.useGeodata = true;
      polygonSeries.exclude = ["AQ"];

      let polygonTemplate = polygonSeries.mapPolygons.template;
      polygonTemplate.tooltipHTML = "<span class='map_polygon_tooltip'>{name}</span>";
      polygonTemplate.fill = am4core.color("#546E7A");

      // Create hover state and set alternative fill color
      let hs = polygonTemplate.states.create("hover");
      hs.properties.fill = am4core.color("#263238");

      // Configure image series
      let imageSeries = new am4maps.MapImageSeries();
      let imageSeriesTemplate = imageSeries.mapImages.template;

      let deviceImageTemplate = imageSeriesTemplate.createChild(am4core.Circle);
      deviceImageTemplate.radius = 8;
      deviceImageTemplate.fill = am4core.color("#00C853");
      deviceImageTemplate.stroke = am4core.color("#FFFFFF");
      deviceImageTemplate.strokeWidth = 4;
      deviceImageTemplate.nonScaling = true;

      // Configure line series
      //let lineSeries = new am4maps.MapLineSeries();
      let lineSeries = new am4maps.MapSplineSeries();
      //let lineSeries = new am4maps.MapArcSeries();
      let lineSeriesTemplate = lineSeries.mapLines.template;
      lineSeriesTemplate.stroke = am4core.color("#69F0AE");

      // Add series to map in specific order,
      // lines before images so images are above line when drawn
      this.mapPolygonSeries = polygonSeries;
      this.mapLineSeries = lineSeries;
      this.mapImageSeries = imageSeries;
    },

    populateMapData(applyZoom) {
      // Clear map data first
      this.mapLineSeries.data.splice(0, this.mapLineSeries.data.length);
      this.mapLineSeries.mapLines.clear();
      this.mapImageSeries.data.splice(0, this.mapImageSeries.data.length);
      this.mapImageSeries.mapImages.clear();

      if (!this.devices || this.devices.length === 0) {
        return;
      }

      let peerLinkSet = new Set();
      //let tmpDeviceMap = new Map();
      let tmpImageMap = new Map();
      this.mapZoomRectangle = {
        north: 0,
        east: 0,
        south: 0,
        west: 0
      };
      for (let device of this.devices) {
        if (!device.loc) continue;
        let deviceImage = this.mapImageSeries.mapImages.create();
        deviceImage.latitude = device.loc.lat;
        deviceImage.longitude = device.loc.lng;
        deviceImage.tooltipHTML = `<span class='map_device_tooltip'>${device.hostname} - ${device.ip}</span>`;
        if (!device.online) {
          deviceImage.children.getIndex(0).fill = am4core.color("#FF0000");
        }

        // Update zoom rectangle
        if (this.mapZoomRectangle.north === 0 || device.loc.lat > this.mapZoomRectangle.north) {
          this.mapZoomRectangle.north = device.loc.lat;
        }
        if (this.mapZoomRectangle.east === 0 || device.loc.lng > this.mapZoomRectangle.east) {
          this.mapZoomRectangle.east = device.loc.lng;
        }
        if (this.mapZoomRectangle.south === 0 || device.loc.lat < this.mapZoomRectangle.south) {
          this.mapZoomRectangle.south = device.loc.lat;
        }
        if (this.mapZoomRectangle.west === 0 || device.loc.lng < this.mapZoomRectangle.west) {
          this.mapZoomRectangle.west = device.loc.lng;
        }

        // tmpDeviceMap.set(device.mac, {
        //   latitude: device.loc.lat,
        //   longitude: device.loc.lng
        // });
        tmpImageMap.set(device.mac.toLowerCase(), deviceImage);
        for (let peer of device.peersList) {
          // Store keys in format "a_b", where a < b
          let deviceMac = device.mac.toLowerCase();
          let peerMac = peer.mac.toLowerCase().replace(/-/g, ":");
          let peerLinkKey = deviceMac < peerMac ? `${deviceMac}_${peerMac}` : `${peerMac}_${deviceMac}`;
          peerLinkSet.add(peerLinkKey);
        }
      }

      for (let peerLinkKey of peerLinkSet) {
        let peerMacs = peerLinkKey.split("_");
        let a = peerMacs[0];
        let b = peerMacs[1];
        if (!tmpImageMap.has(a) || !tmpImageMap.has(b)) {
          continue;
        }
        // let line = [];
        // line.push(tmpDeviceMap.get(a));
        // line.push(tmpDeviceMap.get(b));
        let mapLine = this.mapLineSeries.mapLines.create();
        //mapLine.multiGeoLine = [line];
        mapLine.imagesToConnect = [tmpImageMap.get(a), tmpImageMap.get(b)];
      }

      if (applyZoom) {
        this.zoomMap();
      }
    },

    zoomMap() {
      if (this.map && this.mapZoomRectangle !== null && this.mapZoomRectangle.north !== 0) {
        this.map.zoomToRectangle(
          this.mapZoomRectangle.north + 5,
          this.mapZoomRectangle.east + 5,
          this.mapZoomRectangle.south - 5,
          this.mapZoomRectangle.west - 5,
          1,
          true
        );
      }
    }
  },

};
</script>

<style>
  .application.theme--dark .world-map g[role="button"] > g
  {
    stroke: #000;
  }
</style>
