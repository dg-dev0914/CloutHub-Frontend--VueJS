<template>
  <div class="download-video-btn">
    <i
      class="ch-icons-download download-video-btn__icon"
      @click="downloadVideo"
    />
  </div>
</template>

<script>
// import axios from 'axios';
// import $popups from '@/services/popups';
import $cdn from '@/services/cdn';

export default {
  props: {
    video: {
      type: Object,
      required: true,
    },
  },
  methods: {
    cdn(url) {
      if (!url) return null;
      return $cdn.optimize(url);
    },
    async downloadVideo() {
      const baseURL = 'https://forum-clouthub.s3.amazonaws.com/';
      let url = this.video.video.url;
      if (!url.startsWith('http')) {
        url = baseURL + url;
      }
      if (url.includes('mux.com') || url.includes('dacast.com')) {
        alert(
          'A downloadable version of this video is currently unavailable. Please try again later.'
        );
      } else {
        const a = document.createElement('a');
        a.href = `${process.env.VUE_APP_GRAPH_ENDPOINT}/download_file?url=${encodeURIComponent(
          url
        )}`;
        a.download = true;
        a.click();
      }
    },
  },
};
</script>

<style scoped>
.download-video-btn {
  font-size: 20px;
  margin-right: 10px;
  cursor: pointer;
}
</style>
