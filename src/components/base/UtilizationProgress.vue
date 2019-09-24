<template>
  <span>
    <v-progress-circular v-if="!linear" :size="size" :width="width" :rotate="-90" :value="value" :color="utilizationColor">
      {{ valueRounded ? this.$options.filters.round(value) : value }}{{ percent ? '%' : '' }}
    </v-progress-circular>
    <v-progress-linear v-else :color="utilizationColor" :value="value"/>
  </span>
</template>

<script>
export default {
  name: "UtilizationProgress",

  props:
  {
    value:
    {
      type: Number,
      default: 0 // can't be "required" or it will propagate to UtilizationProgressUsed
    },
    valueRounded:
    {
      type: Boolean,
      default: true
    },
    percent:
      {
        type: Boolean,
        default: false
      },
    size:
    {
      type: [Number, String],
      default: 32
    },
    width:
    {
      type: Number,
      default: 4
    },
    linear:
    {
      type: Boolean,
      default: false
    },
    range1Color:
    {
      type: String,
      default: "success"
    },
    range1Max:
    {
      type: Number,
      default: 50
    },
    range2Color:
    {
      type: String,
      default: "info"
    },
    range2Max:
    {
      type: Number,
      default: 70
    },
    range3Color:
    {
      type: String,
      default: "warning"
    },
    range3Max:
    {
      type: Number,
      default: 80
    },
    range4Color:
    {
      type: String,
      default: "error"
    }
  },

  data() {
    return {};
  },

  filters:
    {
      round(value) {
        return Math.round(value);
      }
    },

  computed:
  {
    utilizationColor() {
      return this.value < this.range1Max
        ? this.range1Color
        : this.value < this.range2Max
          ? this.range2Color
          : this.value < this.range3Max ? this.range3Color : this.range4Color;
    }
  },

};
</script>
