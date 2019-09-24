<template>
  <transition name="notify">
    <div v-if="!!value" class="notify_overlay" @click="close">
      <div
        :style="{color: msgColor, backgroundColor: bgColor, borderColor: borderColor, shadow: shadowColor}"
        class="notify_content"
        @click.stop
        @mouseleave="paused = false"
        @mousemove="paused = true"
        @mouseenter="paused = true"
      >
        <div :style="{backgroundColor: progColor}" class="notify_progress">
          <div :style="{width: current + '%', backgroundColor: progInner}" class="notify_progress_inner" />
        </div>
        <div class="notify_header">
          <h3 class="notify_title">{{ type }}</h3>
          <button :style="{color: msgColor, borderColor: borderColor}" class="notify_close" type="button" @click="close">&#10006;</button>
        </div>
        <div class="notify_text" v-html="value"/>
      </div>
    </div>
  </transition>
</template>

<script>
const colors =
  {
    text:
      {
        error: '#9F3A38',
        success: '#2C662D',
        warning: '#F0AD4E',
        info: '#5BC0DE',
      },
    border:
      {
        error: '#9F3A38',
        success: '#2C662D',
        warning: '#F0AD4E',
        info: '#5BC0DE',
      },
    background:
      {
        error: '#FFF6F6',
        success: '#FCFFF5',
        warning: '#EFE8DE',
        info: '#F5F5FC',
      },
    shadow:
      {
        error: '#FF6C5D',
        success: '#A3C293',
        warning: '#EFCDA5',
        info: '#AAD7DD',
      },
    progress:
      {
        bottom:
          {
            error: '#C62828',
            success: '#388e3c',
            warning: '#ef6c00',
            info: '#1565c0',
          },
        top:
          {
            error: '#ef9a9a',
            success: '#81c784',
            warning: '#ffcc80',
            info: '#64b5f6',
          }
      }
  };

export default
{
  name: 'NotificationBox',
  props:
    {
      value:
        {
          type: String,
          required: true
        },
      type:
        {
          type: String,
          default: 'error',
          validator: (v) => ['error', 'success', 'info', 'warning'].includes(v)
        },
      timeout:
        {
          type: Number,
          default: 1000
        }
    },
  data () {
    return {
      current: 0,
      paused: false,
    }
  },
  computed:
    {
      progColor () {
        return colors.progress.bottom[this.type];
      },
      progInner () {
        return colors.progress.top[this.type];
      },
      msgColor () {
        return colors.text[this.type];
      },
      bgColor () {
        return colors.background[this.type];
      },
      borderColor () {
        return colors.border[this.type];
      },
      shadowColor () {
        return '0 0 0 1px ' + colors.shadow[this.type] + ' inset, 0 0 0 0 transparent';
      },
      progStep () {
        return 10000 / (6 * this.timeout); // 100%/60 fps * 1000ms/timeout
      }
    },
  watch:
    {
      value:
        {
          handler: 'start',
          immediate: true
        }
    },
  created () {
  },
  beforeDestroy () {
    document.removeEventListener('keydown', this.notifyEscape, false);
  },
  methods:
    {
      close () {
        this.$emit('input', '');
      },
      notifyEscape (event) {
        let e = event || window.event;
        if (!!this.value && e.keyCode === 27) {
          this.close();
          // All good browsers…
          if (e.preventDefault) e.preventDefault();
          // …and IE
          if (e.returnValue) e.returnValue = false;
          return false;
        }
      },
      start () {
        if (this.value) {
          document.addEventListener('keydown', this.notifyEscape, false);
          this.current = 0;
          this.paused = false;
          requestAnimationFrame(this.progress);
        } else {
          document.removeEventListener('keydown', this.notifyEscape, false);
        }
      },
      progress () {
        if (this.value) {
          if (this.paused) requestAnimationFrame(this.progress);
          else {
            const cur = this.current + this.progStep;
            this.current = cur >= 100 ? 100 : cur;
            if (cur < 100) requestAnimationFrame(this.progress);
            else this.close();
          }
        }
      }
    }
}
</script>

<style>
  .notify_overlay
  {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 257; /* an attempt to be on top of Vuetify dialogs */
    display: flex;
    text-align: initial;
    background-color: rgba(0, 0, 0, 0.68);
  }

  .notify_content
  {
    margin: auto;
    background-color: white;
    border: 2px solid #000;
    border-radius: 5px;
    overflow: hidden;
    min-width: 180px;
  }

  .notify_progress,
  .notify_progress_inner
  {
    height: 10px;
  }

  .notify_header
  {
    display: flex;
    align-items: center;
  }

  .notify_title
  {
    flex: 1 1 0;
    text-transform: uppercase;
    margin: 0 8px;
  }

  .notify_text
  {
    max-width: 86vw;
    max-height: 86vh;
    overflow: auto;
    margin: 8px;
  }

  .notify_close
  {
    cursor: pointer;
    outline: none;
    background-color: transparent;
    border: 2px solid;
    border-radius: 50%;
    font-size: 18px;
    line-height: 1.5;
    width: 28px;
    height: 28px;
    margin: 4px 8px;
    transition: transform 0.25s linear;
  }

  .notify_close:hover
  {
    transform: rotate(360deg);
  }

  .notify_close:focus
  {
    border-width: 3px;
    margin: 7px 11px;
  }

  .notify_close:active
  {
    transform: translate(1px, 2px);
  }

  .notify-enter-active
  {
    transition: all 0.4s ease;
  }

  .notify-leave-active
  {
    transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
  }

  .notify-enter,
  .notify-leave-to
  {
    transform: translateX(16px);
    opacity: 0;
  }
</style>
