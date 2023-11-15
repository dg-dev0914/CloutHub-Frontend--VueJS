<template>
  <div
    v-observe-visibility="{ callback: visibilityChanged }"
    class="video-container"
  >
    <iframe
      v-if="isVisible"
      ref="player"
      :src="playsrcValue"
      class="video-player"
      allowFullScreen="true"
      crossorigin="anonymous"
      allow="autoplay; fullscreen; accelerometer; gyroscope; encrypted-media; picture-in-picture;"
    />
  </div>
</template>

<script>
// Import necessary services (Added Auth to get location from the profile)
import $cdn from '@/services/cdn';
import $auth from '@/services/auth';

export default {
  props: {
    src: {
      type: String,
      required: false,
    },
    poster: {
      type: String,
      required: false,
    },
    autoplay: {
      type: Boolean,
      default: false,
    },
    showAds: {
      type: Boolean,
      default: true,
    },
    streamId: {
      type: String,
      default: null,
    },
    streamStatus: {
      type: String,
      default: null,
    },
    pauseIfHidden: {
      type: Boolean,
      default: false,
    },
    
    vttFile: {
      type: String,
      default: null,
    },
    vttFile_es: {
      type: String,
      default: null,
    },
    vttFile_fr: {
      type: String,
      default: null,
    },
    vttFile_de: {
      type: String,
      default: null,
    },
    vttFile_zh: {
      type: String,
      default: null,
    },
    vttFile_ar: {
      type: String,
      default: null,
    },
    vttFile_ru: {
      type: String,
      default: null,
    },
    vttFile_vi: {
      type: String,
      default: null,
    },
    vttFile_ko: {
      type: String,
      default: null,
    },    
  },
  data() {
    return {
      isVisible: false,
      playsrcValue: '', // Add a data property to store the playsrc value

    };
  },
  computed: {
    transcoded() {
      return (
        this.streamId && ['COMPLETE', 'PLAYABLE'].includes(this.streamStatus)
      );
    },
    embedPoster() {
      let poster = this.poster;
      if (poster) {
        poster = $cdn.optimize(poster);
      }
      if (!poster && this.transcoded) {
        poster = `${process.env.VUE_APP_VIDEO_DOMAIN}/${this.streamId}/thumbnail.jpg`;
      }
      return poster;
    },
    embedSrc() {
      let src = this.src;
      if (src) {
        src = $cdn.optimize(src);
      }
      if (this.transcoded) {
        src = `${process.env.VUE_APP_VIDEO_DOMAIN}/${this.streamId}/playlist.m3u8`;
      }
      return src;
    },
    playsrc() {
      // This prepares the parameters to pass to the view player.
      const qs = new URLSearchParams();
      qs.set('src', this.embedSrc);
      if (this.embedPoster) {
        qs.set('poster', this.embedPoster);
      }
      if (this.showAds) {
        // qs.set('ad', '1');
      }
      if (this.autoplay) {
        qs.set('autoplay', '1');
        qs.set('muted', '1');
      }
      if (this.vttFile) {
        qs.set('vttFile', 'https%3A%2F%2Fmux-video-upload.s3.amazonaws.com%2Ftest3.vtt');
      }

      return `${process.env.VUE_APP_PLAYER_DOMAIN}/?${qs.toString()}`;
    },
  },
  methods: {
    visibilityChanged(isVisible) {
      if (this.isVisible && !this.pauseIfHidden) {
        return;
      }

      this.isVisible = isVisible;
    },
    async updatePlaysrc() { // Create a method to update playsrc asynchronously
      // This was needed to get the user.location correctly, since it required async from the service.
      const qs = new URLSearchParams();
      qs.set('src', this.embedSrc);
      if (this.embedPoster) {
        qs.set('poster', this.embedPoster);
      }
      if (this.showAds) {
        // qs.set('ad', '1');
      }
      if (this.autoplay) {
        qs.set('autoplay', '1');
        qs.set('muted', '1');
      }
      if (this.$attrs.vttfile) {
        qs.set('vttFile', this.$attrs.vttfile);
      }
      if (this.$attrs.vttfile_es) {
        qs.set('vttFile_es', this.$attrs.vttfile_es);
      }
      if (this.$attrs.vttfile_fr) {
        qs.set('vttFile_fr', this.$attrs.vttfile_fr);
      }
      if (this.$attrs.vttfile_de) {
        qs.set('vttFile_de', this.$attrs.vttfile_de);
      }
      if (this.$attrs.vttfile_zh) {
        qs.set('vttFile_zh', this.$attrs.vttfile_zh);
      }
      if (this.$attrs.vttfile_ar) {
        qs.set('vttFile_ar', this.$attrs.vttfile_ar);
      }
      if (this.$attrs.vttfile_ru) {
        qs.set('vttFile_ru', this.$attrs.vttfile_ru);
      }
      if (this.$attrs.vttfile_vi) {
        qs.set('vttFile_vi', this.$attrs.vttfile_vi);
      }
      if (this.$attrs.vttfile_ko) {
        qs.set('vttFile_ko', this.$attrs.vttfile_ko);
      }

      // Update the playsrc data property
      this.playsrcValue = `${process.env.VUE_APP_PLAYER_DOMAIN}/?${qs.toString()}`;
    },

  },
  mounted() {
    this.updatePlaysrc(); // Call the updatePlaysrc method in the mounted lifecycle hook
  },

};
</script>

<style media="screen">
.video-container {
  height: 450px;
}

.video-player {
  width: 100%;
  height: 100%;
  background-color: black;
  border: none;
}
</style>
