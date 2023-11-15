<template>
  <div class="stream">
    <div class="agora-video-player" ref="player" :id="stream._ID" v-show="isVideoOn"></div>
    <div class="agora-audio-player" v-show="isAudioOn && !isVideoOn">
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
    };
  },
  computed: {
    isVideoOn() {
      return this.stream.trackMediaType === 'video' &&
      !this.stream.muted;
    },
    isAudioOn() {
      return this.stream.trackMediaType === 'video';
    },
    audioIntensity() {
      if (this.audioLevel < 0.1) {
        return 'audio-intensity-0';
      } else if (this.audioLevel < 0.2) {
        return 'audio-intensity-1';
      } else if (this.audioLevel < 0.4) {
        return 'audio-intensity-2';
      } else if (this.audioLevel < 0.7) {
        return 'audio-intensity-3';
      } else {
        return 'audio-intensity-4';
      }
    },
  },
  mounted () {
    this.$nextTick(function () {
      setInterval(() => {
        // this.audioLevel = this.stream.getAudioLevel();
      }, 50);
      if (this.stream && !this.stream.player) {
        console.log('this.stream.ID', this.stream._ID);
        this.stream.play(this.stream._ID, {fit: 'cover'}, (err) => {
          console.log('OK', err);
          if (err && err.status !== 'aborted') {
            console.warn('trigger autoplay policy')
          }
        })
      }
    })
  },
  beforeDestroy () {
    if (this.stream) {      
      if (this.stream._player) {        
        this.stream.stop()
      }
      this.stream.close()
    }
  }
};
</script>
<style scoped>
  .stream
  {
    color: white;
    width: 100%;
    height: 480px;
    border: dashed 1px var(--cs-primary-dark);
    display: flex;
  }
  .agora-video-player
  {
    width: 100%;
    height: 100%;
  }
  .agora-audio-player
  {
    display: flex;
    flex: 1;
    justify-content: center;
    align-items: center;
  }
</style>