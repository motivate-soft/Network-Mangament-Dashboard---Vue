<template>
  <div class="text-xs-center" style="position: relative; border: 1px solid #ccc;">
    <v-progress-linear :value="value"
                       :color="color"
                       :height="height"
                       :background-opacity="backgroundOpacity"
                       class="ma-0"/>
    <span :class="textClass" :style="slotStyle">{{ text }}</span>
  </div>
</template>

<script>
export default {
  name: "AppProgressLinear",

  props: {
    value:
      {
        type: Number,
        required: true
      },
    height:
      {
        type: Number,
        default: 20
      },
    color:
      {
        type: String,
        default: "grey"
      },
    text:
      {
        type: [Number, String],
        default: ""
      },
    textClass:
      {
        type: String,
        default: "body-2"
      },
    backgroundOpacity:
      {
        type: Number,
        default: 0.3
      }
  },

  data() {
    return {
      slotStyle: {
        position: "absolute",
        marginTop: "-" + this.height + "px",
        marginLeft: "-50%",
        lineHeight: this.height + "px",
        width: "100%",
        zIndex: 1,
        //color: "white",
        //textShadow: "0 0 3px grey"
      }
    };
  }
};
</script>
