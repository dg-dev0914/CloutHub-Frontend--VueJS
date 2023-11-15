<template>
  <div>
    <!-- Links -->
    <app-post-link-preview
      v-if="linkPreview"
      :preview="true"
      :title="linkPreview.title"
      :description="linkPreview.details"
      :picture="linkPreview.image"
      :src="linkPreview.url"
    />
    <!-- Images -->
    <div
      v-if="images && images.length"
      :class="isComment ? 'comment-images' : 'post-images'"
    >
      <div
        v-for="(image, $index) in images.slice(0, 3)"
        :key="$index"
        class="post-image"
        @click.stop="openLightbox($index)"
      >
        <app-img :src="image.url" auto-optimize />
        <div v-if="$index == 2 && images.length > 3">
          <div class="post-more-image" @click="openLightbox($index)"></div>
          <div class="more-image-text">
            + {{ images.length - ($index + 1) }}
          </div>
        </div>
      </div>
      <!-- Image lightbox component -->
      <vue-easy-lightbox
        v-if="images.length > 0"
        move-disabled
        :visible="showLightbox"
        :imgs="lightboxImages"
        :index="lightboxIndex"
        @hide="showLightbox = false"
      />
    </div>

    <!-- Documents/Files -->
    <cs-file-preview
      v-if="document"
      :src="cdn(document.url)"
      :file-type="document.type"
      :title="document.name"
      :file-size="document.size"
    ></cs-file-preview>

    <!-- Videos -->
    <app-video
      v-if="video"
      :src="videoSrc"
      class="post-video"
      :video="video"
      :post-id="postId"
      :stream-id="video.streamId"
      :stream-status="video.streamStatus"
      :pause-if-hidden="true"
      :autoplay="autoplay"
    >
    </app-video>
  </div>
</template>

<script>
// Js files
import $cdn from '@/services/cdn';
// Components files
import AppVideo from '@/components/general/Video.vue';
import AppImg from '@/components/general/Img.vue';
import AppPostLinkPreview from './PostLinkPreview.vue';

export default {
  components: {
    AppPostLinkPreview,
    AppVideo,
    AppImg,
  },
  props: {
    linkPreview: {
      type: Object,
      required: false,
      default: null,
    },
    images: {
      type: Array,
      required: false,
      default: () => [],
    },
    document: {
      type: Object,
      required: false,
      default: null,
    },
    video: {
      type: Object,
      required: false,
      default: null,
    },
    postId: {
      type: String,
      required: false,
      default: '',
    },
    isComment: {
      type: Boolean,
      default: false,
    },
    autoplay: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      lightboxIndex: 0,
      showLightbox: false,
    };
  },
  computed: {
    lightboxImages() {
      return this.images.map((i) => this.cdn(i.url));
    },
    videoSrc() {
      if (this.video) {
        if (
          this.video.streamStatus === 'COMPLETE' ||
          this.video.streamStatus === 'PLAYABLE'
        ) {
          return `${process.env.VUE_APP_VIDEO_DOMAIN}/${this.video.streamId}/playlist.m3u8`;
        }
        return $cdn.optimize(this.video.url);
      }
      return null;
    },
  },
  methods: {
    cdn(url) {
      return $cdn.optimize(url);
    },
    openLightbox(index) {
      this.lightboxIndex = index || 0;
      this.showLightbox = true;
    },
  },
};
</script>

<style scoped>
.post-more-image {
  position: absolute;
  top: 0;
  left: 0;
  background: black;
  opacity: 0.5;
  width: 100%;
  height: 100%;
  text-align: center;
}
.more-image-text {
  z-index: 1;
  font-size: 30px;
  color: white;
  cursor: pointer;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.post-images {
  display: flex;
  width: 100%;
}
.post-image {
  flex: 1;
  position: relative;
}
.post-images img {
  width: 100%;
  height: 100%;
  min-height: 200px;
  max-height: 600px;
  object-fit: contain;
}
.comment-images {
  display: flex;
  width: 100%;
}
.comment-images img {
  width: 100%;
  min-height: 200px;
  max-height: 300px;
  object-fit: contain;
}
.post-video {
  margin-top: 10px;
}
</style>
