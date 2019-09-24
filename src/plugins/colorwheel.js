import * as am4core from "@amcharts/amcharts4/core";

function am4themes_myColorWheel(target) {
  if (target instanceof am4core.ColorSet) {
    target.list = [
      am4core.color("#74C846"),
      am4core.color("#6365B7"),
      am4core.color("#CA6965"),
      am4core.color("#CAA665"),
      am4core.color("#B2CA65"),
      am4core.color("#75CA65"),
      am4core.color("#65CA91"),
      am4core.color("#65C6CA"),
    ];
  }
}

am4core.useTheme(am4themes_myColorWheel); 

export default {
  am4core,
}
