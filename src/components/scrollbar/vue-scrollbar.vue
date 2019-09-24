
<template>
  <div
    @click="calculateSize"
    class="vue-scrollbar__wrapper"
    ref="scrollWrapper">

    <div
      class="vue-scrollbar__area" :class="makeClasses"
      ref="scrollArea"
      @wheel="scroll"
      @touchstart="startDrag"
      @touchmove="onDrag"
      @touchend="stopDrag"
      :style="makeStyles"
    >

        <slot></slot>
    </div>

    <vertical-scrollbar
      v-if="ready"
      :area="{ height: scrollAreaHeight }"
      :wrapper="{ height: scrollWrapperHeight }"
      :scrolling="vMovement"
      :offset="top"
      :dragging-from-parent="dragging"
      :on-change-position="handleChangePosition"
      :on-dragging="handleScrollbarDragging"
      :on-stop-drag="handleScrollbarStopDrag" >
    </vertical-scrollbar>

    <horizontal-scrollbar
      v-if="ready"
      :area="{ width: scrollAreaWidth }"
      :wrapper="{ width: scrollWrapperWidth }"
      :scrolling="hMovement"
      :offset="left"
      :dragging-from-parent="dragging"
      :on-change-position="handleChangePosition"
      :on-dragging="handleScrollbarDragging"
      :on-stop-drag="handleScrollbarStopDrag">
    </horizontal-scrollbar>

  </div>

</template>

<script>
import VerticalScrollbar from './vertical-scrollbar.vue';
import HorizontalScrollbar from './horizontal-scrollbar.vue';

const margin = 20;
const barSize = 6; // size in pixels of the scroll-bar - must be kept in sync with the SASS variable below

export default {

  props: {
    classes:
      {
        type: [String, Array, Object]
      },
    styles:
      {
        type: [String, Array, Object]
      },
    speed: {
      type: Number,
      default: 53
    },
    onMaxScroll: Function,
    autoScroll:
      {
        type: Boolean,
        default: false
      },
    hold:
      {
        type: Boolean,
        default: false
      },
    prevent:
      {
        // prevent propagation of scroll events
        type: Boolean,
        default: true
      },
    transparent:
      {
        // ignore mouse wheel
        type: Boolean,
        default: false
      },
    spaceBottom:
      {
        type: Boolean,
        default: false
      },
  },

  components: {
    VerticalScrollbar,
    HorizontalScrollbar
  },

  data () {
    return  {
      ready: false,
      top: 0,
      left: 0,
      scrollAreaHeight: null,
      scrollAreaWidth: null,
      scrollWrapperHeight: null,
      scrollWrapperWidth: null,
      vMovement: 0,
      hMovement: 0,
      dragging: false,
      start: { y: 0, x: 0},
      allowBodyScroll: false,
      autoX: 0,
      autoY: 0,
      wrapRect: {},
      supportsPassive: false
    }
  },

  watch:
    {
      autoScroll: 'setAutoScroll',
    },
  computed:
    {
      makeClasses() {
        if(typeof this.classes === 'string') return this.classes + (this.dragging ? ' vue-scrollbar-transition' : '');
        else if(typeof this.classes === 'object' && this.classes !== null) {
          if(Object.prototype.toString.call(this.classes) === '[object Array]') {
            return this.dragging ? this.classes.concat('vue-scrollbar-transition') : this.classes;
          } else return Object.assign({}, this.classes, {'vue-scrollbar-transition': this.dragging});
        } else return [];
      },
      makeStyles() {
        if(typeof this.classes === 'string') return this.styles + 'margin-top: -' + this.top + 'px; margin-left: -' + this.left + 'px;';
        else if(typeof this.styles === 'object' && this.styles !== null) {
          if(Object.prototype.toString.call(this.styles) === '[object Array]') {
            const res = [
              {
                marginTop: -1 * this.top +'px',
                marginLeft: -1 * this.left +'px'
              }
            ];
            if (this.spaceBottom) res.concat({
              paddingBottom: this.scrollAreaWidth > this.scrollWrapperWidth ? barSize + 'px' : 0
            });
            return this.styles.concat(res);
          } else {
            const res = Object.assign({}, this.styles);
            res.marginTop = -1 * this.top +'px';
            res.marginLeft = -1 * this.left +'px';
            if (this.spaceBottom) res.paddingBottom = this.scrollAreaWidth > this.scrollWrapperWidth ? barSize + 'px' : 0;
            return res;
          }
        } else {
          const res = {
            marginTop: -1 * this.top +'px',
            marginLeft: -1 * this.left +'px'
          };
          if (this.spaceBottom) res.paddingBottom = this.scrollAreaWidth > this.scrollWrapperWidth ? barSize + 'px' : 0;
          return res;
        }
      }
    },
  methods: {
    setAutoScroll(newValue) {
      if(newValue) requestAnimationFrame(this.doAutoScroll);
    },
    doAutoScroll() {
      if(this.scrollAreaWidth > this.scrollWrapperWidth && this.autoX != 0) this.normalizeHorizontal(this.left + this.autoX);
      if(this.scrollAreaHeight > this.scrollWrapperHeight && this.autoY != 0) this.normalizeVertical(this.top + this.autoY);
      if(this.autoScroll) requestAnimationFrame(this.doAutoScroll);
    },
    checkAutoScroll(e) {
      let rect = this.wrapRect;
      let evt = e.changedTouches ? e.changedTouches[0] : e;

      // compute autoX and autoY according to mouse proximity to the container edges
      if(evt.clientX < rect.left + margin) this.autoX = evt.clientX - (rect.left + margin);
      else if(evt.clientX > rect.right - margin) this.autoX = evt.clientX - (rect.right - margin);
      else this.autoX = 0;
      if(evt.clientY < rect.top + margin) this.autoY = evt.clientY - (rect.top + margin);
      else if(evt.clientY > rect.bottom - margin) this.autoY = evt.clientY - (rect.bottom - margin);
      else this.autoY = 0;
    },
    scroll(e) {
      if(this.transparent) return;
      // Make sure the content height is not changed
      this.calculateSize(() => {
        // Set the wheel step
        let num = this.speed;

        // DOM events
        let shifted = e.shiftKey;
        let scrollY = e.deltaY > 0 ? num : -(num);
        let scrollX = e.deltaX > 0 ? num : -(num);

        // Fix Mozilla Shifted Wheel~
        if(shifted && e.deltaX === 0) scrollX = e.deltaY > 0 ? num : -(num);

        // Next Value
        let nextY = this.top + scrollY;
        let nextX = this.left + scrollX;

        // Is it Scrollable?
        let canScrollY = this.scrollAreaHeight > this.scrollWrapperHeight;
        let canScrollX = this.scrollAreaWidth > this.scrollWrapperWidth;

        // Vertical Scrolling
        if(canScrollY && !shifted) this.normalizeVertical(nextY);

        // Horizontal Scrolling
        if(shifted && canScrollX) this.normalizeHorizontal(nextX);
      });

      // prevent Default only if scrolled content is not at the top/bottom
      if (!this.allowBodyScroll) {
        e.preventDefault();
        e.stopPropagation();
      }

    },

    // DRAG EVENT JUST FOR TOUCH DEVICE~
    startDrag(e){
      this.touchEvent = e;

      const evt = e.changedTouches ? e.changedTouches[0] : e;

      // Make sure the content height is not changed
      this.calculateSize(() => {
        // Prepare to drag
        this.dragging = true;
        this.start = {
          y: evt.pageY,
          x: evt.pageX
        };

        //console.log('touchStart: X = ' + evt.pageX + ', Y = ' + evt.pageY);
      })
    },

    onDrag(e){
      if(this.dragging && !this.hold) {
        e.preventDefault();
        if(this.prevent) e.stopPropagation();

        // Prevent Click Event When it dragging
        if (this.touchEvent) {
          this.touchEvent.preventDefault();
          if(this.prevent) this.touchEvent.stopPropagation();
        }

        let evt = e.changedTouches ? e.changedTouches[0] : e;

        // Invers the Movement
        let yMovement = this.start.y - evt.clientY;
        let xMovement = this.start.x - evt.clientX;

        // Update the last e.client
        this.start = {
          y: evt.clientY,
          x: evt.clientX
        };

        // The next Vertical Value will be
        let nextY = this.top + yMovement;
        let nextX = this.left + xMovement;

        this.normalizeVertical(nextY);
        this.normalizeHorizontal(nextX);

        //console.log('touchMove: X = ' + evt.clientX + ', Y = ' + evt.clientY + '; moveX = ' + xMovement + ', moveY = ' + yMovement);
      }
    },

    stopDrag() {
      this.dragging = false;
      this.touchEvent = false;
    },

    scrollToY(y) {
      this.normalizeVertical(y)
    },

    scrollToX(x) {
      this.normalizeHorizontal(x)
    },

    normalizeVertical(next) {
      const elementSize = this.getSize();

      // Vertical Scrolling
      const lowerEnd = elementSize.scrollAreaHeight - elementSize.scrollWrapperHeight;

      // Max Scroll Down
      const maxBottom = next > lowerEnd;
      if(maxBottom) next = lowerEnd;

      // Max Scroll Up
      const maxTop = next < 0;
      if(maxTop) next = 0;


      // Update the Vertical Value if it's needed
      const shouldScroll = this.top !== next;
      this.allowBodyScroll = !shouldScroll && !this.prevent;
      if (shouldScroll) {
        this.top = next;
        this.vMovement = next / elementSize.scrollAreaHeight * 100;
        this.$emit('scrolly',next);

        if (this.onMaxScroll && (maxTop || maxBottom)) {
          this.onMaxScroll({ top: maxTop, bottom: maxBottom, right: false, left: false })
        }
      }
    },

    normalizeHorizontal(next){
      const elementSize = this.getSize();

      // Horizontal Scrolling
      const rightEnd = elementSize.scrollAreaWidth - this.scrollWrapperWidth;

      // Max Scroll Right
      const maxRight = next > rightEnd;
      if(maxRight) next = rightEnd;

      // Max Scroll Left
      const maxLeft = next < 0;
      if(next < 0) next = 0;

      // Update the Horizontal Value
      const shouldScroll = this.left !== next;
      this.allowBodyScroll = !shouldScroll && !this.prevent;
      if (shouldScroll) {
        this.left = next;
        this.hMovement = next / elementSize.scrollAreaWidth * 100;
        this.$emit('scrollx',next);

        if (this.onMaxScroll && (maxRight || maxLeft)) {
          this.onMaxScroll({ right: maxRight, left: maxLeft, top: false, bottom: false })
        }
      }
    },

    handleChangePosition(movement, orientation){
      // Make sure the content height is not changed
      this.calculateSize(() => {
        // Convert Percentage to Pixel
        let next = movement / 100;
        if( orientation === 'vertical' ) this.normalizeVertical( next * this.scrollAreaHeight );
        if( orientation === 'horizontal' ) this.normalizeHorizontal( next * this.scrollAreaWidth );
      })
    },

    handleScrollbarDragging(){
      this.dragging = true
    },

    handleScrollbarStopDrag(){
      this.dragging = false
    },

    getSize(){
      // The Elements
      let $scrollArea = this.$refs.scrollArea;
      let $scrollWrapper = this.$refs.scrollWrapper;
      if(!$scrollArea || !$scrollWrapper) return {}; // TMCDOS
      // Get new Elements Size
      this.wrapRect = $scrollWrapper.getBoundingClientRect(); // TMCDOS

      return {
        // Scroll Area Height and Width
        scrollAreaHeight: $scrollArea.clientHeight,
        scrollAreaWidth: $scrollArea.clientWidth,

        // Scroll Wrapper Height and Width
        scrollWrapperHeight: $scrollWrapper.clientHeight,
        scrollWrapperWidth: $scrollWrapper.clientWidth
      };
    },

    calculateSize(cb){
      if(typeof cb !== 'function') cb = null;

      let elementSize = this.getSize();
      if(elementSize && Object.keys(elementSize).length === 0) return cb ? cb() : false; // TMCDOS

      if( elementSize.scrollWrapperHeight !== this.scrollWrapperHeight ||
          elementSize.scrollWrapperWidth !== this.scrollWrapperWidth ||
          elementSize.scrollAreaHeight !== this.scrollAreaHeight ||
          elementSize.scrollAreaWidth !== this.scrollAreaWidth ) {

        // Scroll Area Height and Width
        this.scrollAreaHeight = elementSize.scrollAreaHeight;
        this.scrollAreaWidth = elementSize.scrollAreaWidth;

        // Scroll Wrapper Height and Width
        this.scrollWrapperHeight = elementSize.scrollWrapperHeight;
        this.scrollWrapperWidth = elementSize.scrollWrapperWidth;

        // Make sure The wrapper is Ready, then render the scrollbar
        this.ready = true;

        return cb ? cb() : false;
      } else return cb ? cb() : false;
    }

  },

  created () {
    this.supportsPassive = false;
    let self = this;
    try {
      var opts = {};
      Object.defineProperty(opts, 'passive', ({
        get: function get () {
          /* istanbul ignore next */
          self.supportsPassive = true;
          return false;
        }
      })); // https://github.com/facebook/flow/issues/285
      window.addEventListener('test-passive', null, opts);
    } catch (e) {
      //
    }
  },
  mounted () {
    this.calculateSize();

    // Attach The Event for Responsive View~
    window.addEventListener('resize', this.calculateSize);
    document.addEventListener('mousemove', this.checkAutoScroll, false);
    document.addEventListener('touchmove', this.checkAutoScroll, this.supportsPassive ? {passive: false} : false);
  },

  updated () {
    let self = this;
    if(this.$refs.scrollWrapper && this.$refs.scrollWrapper.scrollTop) {
      // workaround for Froala - it insists on scrolling when current text cursor position is no more visible on the screen
      // it happens when you keep pressing Enter multiple times - probably because .fr-wrapper is with automatic height instead of explicit size
      this.scrollToY(this.$refs.scrollWrapper.scrollTop);
      this.$refs.scrollWrapper.scrollTop = 0;
    }
    this.$nextTick(function() {
      setTimeout(function() {
        self.calculateSize()
      },30);
    })
  },

  beforeDestroy () {
    // Remove Event
    window.removeEventListener('resize', this.calculateSize);
    document.removeEventListener('mousemove', this.checkAutoScroll);
    document.removeEventListener('touchmove', this.checkAutoScroll);
  }

}
</script>

<style lang="scss">
  $barSize: 6px;

.vue-scrollbar-transition,
.vue-scrollbar__scrollbar-vertical,
.vue-scrollbar__scrollbar-horizontal
{
  transition: all 0.5s ease;
  -moz-transition: all 0.5s ease;
  -webkit-transition: all 0.5s ease;
  -o-transition: all 0.5s ease;
}

.vue-scrollbar-transition--scrollbar
{
  transition: opacity 0.5s linear;
  -moz-transition: opacity 0.5s linear;
  -webkit-transition: opacity 0.5s linear;
  -o-transition: opacity 0.5s linear;
}

.vue-scrollbar__wrapper
{
  margin: 0;
  overflow: hidden;
  position: relative;
  flex-grow: 1;
}

.vue-scrollbar__scrollbar-vertical,
.vue-scrollbar__scrollbar-horizontal
{
  position: absolute;
  background: transparent;
}

.vue-scrollbar__scrollbar-vertical:hover,
.vue-scrollbar__scrollbar-horizontal:hover
{
/*  background: rgba(0, 0, 0, 0.3);*/
}

.vue-scrollbar__scrollbar-vertical .scrollbar,
.vue-scrollbar__scrollbar-horizontal .scrollbar
{
  position: relative;
  background: transparent;
  cursor: default;
}

.vue-scrollbar__scrollbar-vertical
{
  width: $barSize;
  height: 100%;
  top: 0;
  right: 0;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
}

.vue-scrollbar__scrollbar-vertical .scrollbar
{
  width: $barSize - 2px;
  border-radius: 8px;
}

.vue-scrollbar__scrollbar-horizontal
{
  height: $barSize;
  width: 100%;
  bottom: 0;
  right: 0;
}

.vue-scrollbar__scrollbar-horizontal .scrollbar
{
  height: $barSize;
}

.vue-scrollbar__wrapper:hover .vue-scrollbar__scrollbar-vertical .scrollbar,
.vue-scrollbar__wrapper:hover .vue-scrollbar__scrollbar-horizontal .scrollbar
{
  background: #666;
}
</style>
