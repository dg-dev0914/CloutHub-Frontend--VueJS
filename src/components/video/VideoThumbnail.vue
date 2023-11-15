<template>
  <app-img
    v-router-link="{ name: 'VideoDetail', params: video }"
    class="video-thumbnail"
    auto-optimize
    :src="animated ? animation : thumbnail"
    :alt-img="altImg"
    @mouseover.native="hover = true"
    @mouseout.native="hover = false"
  ></app-img>
</template>

<script>
import AppImg from '@/components/general/Img.vue';

const MUX_DOMAIN_NAME = 'image.mux.com';
const isMuxUrl = (url) =>
  typeof url === 'string' && url.includes(MUX_DOMAIN_NAME);

export default {
  components: { AppImg },
  props: {
    video: {
      type: Object,
      required: true,
    },
    animated: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      hover: false,
    };
  },
  computed: {
    thumbnail() {
      if (this.video && this.video.video && this.video.video.thumbUrl) {
        return this.video.video.thumbUrl;
      }

      return null;
    },
    animation() {
      const duration = this.video.video.duration;
      if (this.thumbnail && isMuxUrl(this.thumbnail)) {
        const end = duration ? `&end=${duration}` : '';
        const start = duration
          ? `&start=${duration > 10 ? duration - 10 : 0}`
          : '';

        return this.thumbnail.replace(
          /thumbnail\.(png|jpg)\??/,
          `animated.gif?fps=30${start}${end}`
        );
      }

      return this.thumbnail;
    },
    altImg() {
      if (this.video && this.video.video) {
        if (
          this.video.video.streamStatus === 'PLAYABLE' ||
          this.video.video.streamStatus === 'COMPLETE'
        ) {
          return this.hover
            ? `${process.env.VUE_APP_VIDEO_DOMAIN}/${this.video.video.streamId}/preview.webp`
            : `${process.env.VUE_APP_VIDEO_DOMAIN}/${this.video.video.streamId}/thumbnail.jpg`;
        }
      }
      return null;
    },
  },
};
</script>

<style scoped>
.video-thumbnail {
  cursor: pointer;
}
</style>
