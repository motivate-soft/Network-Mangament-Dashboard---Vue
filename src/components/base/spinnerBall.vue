<template>
  <div>
    <div class="ring-2">
      <div class="ball-holder">
        <div class="ball"/>
      </div>
    </div>
  </div>
</template>

<script>
export default
{
  name: 'SpinnerBall'
}
</script>

<style scoped>
  .ball-holder
  {
    animation: loadingBall 1.3s linear infinite;
    position: absolute;
    width: 12px;
    height: 45px;
    left: 13px;
    top: -4px;
  }

  .ball
  {
    position: absolute;
    top: -5px;
    left: -2px;
    width: 16px;
    height: 16px;
    border-radius: 100%;
    background: #4282B3;
  }

  .ring-2
  {
    position: relative;
    width: 45px;
    height: 45px;
    margin: 0 auto;
    border: 4px solid #4B9CDB;
    border-radius: 100%;
  }

  @keyframes loadingBall
  {
    0%
    {
      transform: rotate(0deg);
    }

    100%
    {
      transform: rotate(360deg);
    }
  }

</style>
