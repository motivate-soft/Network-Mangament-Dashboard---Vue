<template>
  <utilization-progress :value="percentageUsed" :linear="linear" :size="size" :width="width"
                        :range1-color="range1Color" :range1-max="range1Max" :range2-color="range2Color"
                        :range2-max="range2Max" :range3-color="range3Color" :range3-max="range3Max"
                        :range4-color="range4Color">
    <slot :value="percentageUsed">
      {{ percentageUsed }}
    </slot>
  </utilization-progress>
</template>

<script>
import UtilizationProgress from "@/components/base/UtilizationProgress.vue";

export default {
  name: "UtilizationProgressUsed",

  components:
  {
    UtilizationProgress,
  },

  extends: UtilizationProgress,
  props:
  {
    used:
    {
      type: Number,
      required: true
    },
    total:
    {
      type: Number,
      required: true
    },
  },

  computed: {
    percentageUsed() {
      return Math.round(this.used / this.total * 100);
    }
  }
};
</script>
