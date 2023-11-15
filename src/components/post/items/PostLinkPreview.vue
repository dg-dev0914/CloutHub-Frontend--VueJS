<template>
  <a
    v-if="!embedUrl"
    class="ch-post-link-preview"
    target="_system"
    @click="open()"
  >
    <app-img v-if="picture" hide-on-error :src="displayPicture" :alt="title" />
    <div class="ch-post-link-preview_data">
      <div
        v-if="title"
        class="cs-textstyle-detail-heading ch-post-link-preview__title"
      >
        {{ title }}
      </div>
      <div class="ch-post-link-domain">
        <app-img v-if="picture" hide-on-error :src="picture" :alt="title" />
        <div class="cs-textstyle-link-text ch-post-link-preview__source">
          {{ displaySrc }}
        </div>
      </div>
    </div>
  </a>
  <div v-else class="ch-post-link-preview">
    <iframe :src="embedUrl" frameborder="0" scrolling="no"></iframe>
  </div>
</template>

<script>
import AppImg from '@/components/general/Img.vue';

import $shortlinks from '@/services/shortlinks';

export default {
  components: {
    AppImg,
  },
  props: {
    title: {
      type: String,
      default: null,
    },
    preview: {
      type: Boolean,
      default: false,
    },
    src: {
      type: String,
      default: null,
    },
    linkLabel: {
      type: String,
      default: 'Link',
    },
    picture: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    linkIcon: {
      type: String,
      default: 'cs-icons-link-filled',
    },
  },
  computed: {
    displayPicture() {
      return this.picture;
      // return (
      //   this.picture &&
      //   `https://chproxy.backendcdn.com/image?url=${encodeURIComponent(
      //     this.picture
      //   )}`
      // );
    },
    displayIcon() {
      return `https://www.google.com/s2/favicons?domain=${this.displaySrc}`;
    },
    fullSrc() {
      let src = this.src;
      const email = src.match(/.*@.*/);
      if (email) src = `mailto:${this.src}`;
      else if (!src.startsWith('http')) {
        src = `https://${src}`;
      }
      return src;
    },
    displaySrc() {
      try {
        const email = this.src.match(/.*@.*/);
        if (email) return this.src;
        return this.fullSrc && new URL(this.fullSrc).hostname;
      } catch (err) {
        return this.fullSrc;
      }
    },
    embedUrl() {
      if (this.src) {
        try {
          const u = new URL(this.src);
          const thisDomain = window.location.hostname;
          if (this.src.includes('youtube.com/watch?v=')) {
            // YouTube
            const v = u.searchParams.get('v');
            if (v) {
              return `https://www.youtube.com/embed/${v}`;
            }
          } else if (this.src.includes('bitchute.com/video')) {
            // Bitchute
            const btId = this.src.split('/')[4];
            return `https://www.bitchute.com/embed/${btId}/`;
          } else if (this.src.includes('www.twitch.tv/videos/')) {
            // Twitch
            const twitchId = this.src.split('/')[4];
            return `https://player.twitch.tv/?video=${twitchId}&parent=${thisDomain}`;
          }
        } catch (err) {
          // If something goes wrong, display a normal link preview
        }
      }
      return '';
    },
  },
  methods: {
    open() {
      const isClouthubLink =
        this.src.startsWith('https://clouthub.com') ||
        this.src.startsWith('https://preview-dev.clouthub.com');
      if (isClouthubLink) $shortlinks.navigate(this.src);
      else window.open(this.fullSrc, '_blank');
    },
  },
};
</script>

<style scoped>
.ch-post-link-preview {
  background-color: var(--cs-gray-01);
  cursor: pointer;
  display: block;
}
.ch-post-link-preview img {
  height: 300px;
  width: 100%;
  object-fit: contain;
}
.ch-post-link-preview_data {
  background-color: var(--cs-gray-01);
  padding: 15px;
  font-weight: normal;
}
.ch-post-link-preview__title {
  max-height: 72px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.ch-post-link-domain {
  display: flex;
  align-items: center;
  gap: 5px;
}
.ch-post-link-domain img {
  width: 15px;
  height: 15px;
  border-radius: 5px;
}
.ch-post-link-preview__source {
  max-height: 24px;
  word-break: break-all;
  line-clamp: 1;
  -webkit-line-clamp: 1;
  color: var(--cs-gray-04);
  overflow: hidden;
}
.ch-post-link-preview iframe {
  width: 100%;
  height: 300px;
}
</style>
