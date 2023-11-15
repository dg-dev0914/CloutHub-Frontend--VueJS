<template>
  <div class="ch-upload-btns">
    <cs-button
      :disabled="isDisabled || !canImages"
      variant="default"
      size="small"
      corners="round"
      class="ch-upload-btns"
      @click="attach('image/*')"
    >
      <i class="ch-icons-add-media mr-2"></i>
      Photo
    </cs-button>
    <cs-button
      :disabled="isDisabled || !canVideo"
      variant="default"
      size="small"
      corners="round"
      class="ch-upload-btns"
      @click="attach('video/*')"
    >
      <i class="cs-icons-video-file-filled"></i>
      Video
    </cs-button>
    <cs-button
      :disabled="isDisabled || !canImages"
      variant="default"
      size="small"
      corners="round"
      class="ch-upload-btns"
      @click="openGIFsModal"
    >
      <i class="ch-icons-gif cs-upload-icons"></i>
      GIF
    </cs-button>
    <cs-button
      :disabled="isDisabled || !canDocument"
      variant="default"
      size="small"
      corners="round"
      class="ch-upload-btns"
      @click="attach('application/pdf')"
    >
      <i class="cs-icons-doc cs-upload-icons"></i>
      PDF
    </cs-button>
  </div>
</template>

<script>
import $bus from '@/services/bus';
import $utils from '@/services/utils';

export default {
  props: {
    value: {
      type: Object,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      loading: false,
    };
  },
  computed: {
    hasImages() {
      return this.value.images && this.value.images.length > 0;
    },
    hasVideo() {
      return !!this.value.video;
    },
    hasDocument() {
      return !!this.value.document;
    },
    canImages() {
      return !this.hasVideo && !this.hasDocument;
    },
    canVideo() {
      return !this.hasImages && !this.hasDocument;
    },
    canDocument() {
      return !this.hasImages && !this.hasVideo;
    },
    isDisabled() {
      return this.loading || this.disabled;
    },
  },
  methods: {
    // Attachments (Files and Images and Videos)
    async attach(type) {
      const files = await $utils.selectFiles(type);
      // this.$emit('loading', true);
      this.loading = true;

      const datafiles = Array.from(files);
      datafiles.forEach((file) => {
        file.dataurl = URL.createObjectURL(file);
      });

      if (type.startsWith('image')) {
        const images = this.value.images || [];
        this.$emit('input', {
          ...this.value,
          images: [...images, ...datafiles],
        });
      } else if (type.startsWith('video')) {
        const file = datafiles[0];
        await this.generateThumbnail(file);
        this.$emit('input', { ...this.value, video: file });
      } else {
        const file = datafiles[0];
        this.$emit('input', { ...this.value, document: file });
      }
      // this.$emit('loading', false);
      this.loading = false;
    },
    generateThumbnailImage(video, canvas, time) {
      return new Promise((resolve) => {
        video.addEventListener('timeupdate', () => {
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
          resolve(canvas.toDataURL());
        });
        video.currentTime = time;
      });
    },
    async generateThumbnail(file) {
      const videoUrl = file.dataurl;
      const video = document.createElement('video');
      video.src = videoUrl;
      video.addEventListener('loadedmetadata', async () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const duration = video.duration;
        file.thumburl = await this.generateThumbnailImage(
          video,
          canvas,
          Math.floor(duration / 5)
        );
      });
    },

    // GIFS
    openGIFsModal() {
      $bus.$emit('show-select-gif-modal');
      $bus.$once('gif-modal-select', this.selectedGIF);
    },
    selectedGIF(gif) {
      const gifImage = {
        url: gif.url,
        name: 'Embedded Gif',
        type: 'image',
        contentType: 'image/gif',
      };
      const images = this.value.images || [];
      this.$emit('input', { ...this.value, images: [...images, gifImage] });
    },
  },
};
</script>

<style scoped>
.ch-upload-btns {
  display: flex;
  flex-direction: row;
  gap: 8px;
  --cs-button-color: var(--cs-gray-01) !important;
  --cs-button-text-color: var(--cs-gray-05) !important;
}
.cs-upload-icons {
  margin-right: 5px;
}
</style>
