<template>
  <div class="ball-beat">
    <div :style="{backgroundColor: color}"></div>
    <div :style="{backgroundColor: color}"></div>
    <div :style="{backgroundColor: color}"></div>
  </div>
</template>

<script>
export default
{
  name: 'SpinnerBalls',
  props:
    {
      show:
        {
          type: Boolean,
          default: false
        },
      color:
        {
          type: String,
          default: '#fff'
        }
    }
}
</script>

<style>
  @keyframes ball-beat
  {
    50%
    {
      opacity: 0.2;
      -webkit-transform: scale(0.75);
      transform: scale(0.75);
    }
    100%
    {
      opacity: 1;
      -webkit-transform: scale(1);
      transform: scale(1);
    }
  }

  .ball-beat
  {
    display: flex;
    justify-content: center;
  }

  .ball-beat > div
  {
    width: 11px;
    height: 11px;
    border-radius: 100%;
    margin: 2px;
    animation-fill-mode: both;
    display: inline-block;
    animation: ball-beat 0.6s 0s infinite linear;
  }

  .ball-beat > div:nth-child(2n-1)
  {
    animation-delay: -0.3s !important;
  }
</style>
