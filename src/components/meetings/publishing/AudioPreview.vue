<template>
  <div class="meeting-stream">
    <div class="ch-meetings-audio-preview__track">
      <div
        class="ch-meetings-audio-preview__fill"
        :style="{'width': `${audioLevel}%`}"
      ></div>
      <span class="ch-meetings-audio-preview__level">{{ audioLevel }}</span>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    stream: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      audioLevel: 0,
      interval: null,
    };
  },
  mounted() {
    this.interval = setInterval(() => {
      this.audioLevel = this.stream ? Math.floor(this.stream.getVolumeLevel() * 100) : 0;
    }, 100);
  },
  beforeDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  },
};
</script>
<style scoped>
.ch-meetings-audio-preview__track {
  height: 20px;
  width: 100%;
  background-color: var(--cs-gray-02);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
  margin: 10px 0;
}
.ch-meetings-audio-preview__fill {
  height: 20px;
  width: 1%;
  background-color: var(--cs-primary-base);
}
.ch-meetings-audio-preview__level {
  position: absolute;
  width: 100%;
  top: 0;
  text-align: center;
  color: var(--cs-gray-06);
}
</style>
