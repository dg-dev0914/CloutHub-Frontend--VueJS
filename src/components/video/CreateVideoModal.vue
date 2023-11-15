<template>
  <app-form-modal
    :show="show"
    class="simple-modal"
    :title="header"
    :saving="uploading"
    @close="done()"
  >
    <app-progress-indicator
      :steps="3"
      :active-step="activeStep"
      class="progress-indicator"
    />

    <div class="video-upload-modal-body">
      <!-- Select Video -->
      <div v-if="showSelect">
        <app-file-input
          title="Drag video here, or:"
          button-label="Select from computer"
          accept="video/*, audio/*"
          :multiple="false"
          @selected="generateThumbnails"
        />
      </div>
      <!-- Info -->
      <div v-if="showInfo">
        <div class="video-information-modal">
          <div class="cs-textstyle-item-heading video-main-title">
            Video Information
          </div>
          <div class="cs-textstyle-paragraph">
            Add a title and description of your video.You can also select a
            category so viewers can easily search for your video based on topic
          </div>
        </div>
        <cs-form class="video-modal-form">
          <cs-input
            v-model="draftTitle"
            label="Title"
            :required="true"
            :max-length="50"
          />
          <div class="character-counter">
            {{ draftTitle ? draftTitle.length : 0 }}/50 Characters
          </div>

          <app-textarea
            v-model="draft.description"
            label="Description"
            maxlength="2500"
          />
          <div class="character-counter">
            {{ draft.description ? draft.description.length : 0 }}/2500
            Characters
          </div>

          <cs-select
            v-model="draft.category"
            label="Category"
            :options="categories"
          />
        </cs-form>
      </div>
      <!-- Thumbnail -->
      <div v-if="showThumbnail" class="video-thumbnail">
        <div v-if="!showCrop">
          <div class="video-information-modal">
            <div class="cs-textstyle-item-heading video-main-title">
              Video Thumbnail
            </div>
            <div class="cs-textstyle-paragraph">
              Select a thumbnail you would like to use on your video.You can
              also upload an image for your thumbnail by tapping on the Upload
              button.
            </div>
          </div>
          <div class="img-input-wrapper">
            <div class="cs-textstyle-detail-heading video-detail-title">
              Preview
            </div>
            <app-image-input
              v-if="!thumbnail"
              class="preview-thumbnail"
              @input="onInput"
            />
            <div v-if="thumbnail" class="thumbnail-container">
              <div v-if="thumbnail" class="create-video-thumbnail-holder">
                <img :src="draft.thumbnail.url || draft.thumbnail.dataurl" />
              </div>
              <cs-button
                size="small"
                class="upload-button"
                @click="uploadThumbnail"
                >Upload</cs-button
              >
            </div>
          </div>
          <div v-if="thumbnails" class="video-thumbnail__option">
            <img
              v-for="(t, index) in thumbnails"
              :key="index"
              class="thumbnail-option"
              :src="t.url"
              @click="selectThumbnail(t)"
            />
          </div>
        </div>
      </div>
      <div v-if="showCrop" class="cropped-image">
        <app-image-crop
          :image="thumbnailImage"
          :aspect-ratio="16 / 9"
          @cropped="croppedThumbnail"
        />
      </div>
    </div>
    <!-- Footer Button -->
    <div slot="footer" class="video-upload-modal-footer">
      <cs-button :disabled="disableAction" @click="relevantAction()">{{
        action
      }}</cs-button>
    </div>
  </app-form-modal>
</template>
<script>
import $aws from '@/services/aws';
import $videosApi from '@/api/videos';
import $utils from '@/services/utils';
import AppImageInput from '@/components/general/ImageInput.vue';
import AppImageCrop from '@/components/general/ImageCrop.vue';
import AppFileInput from '@/components/media/FileInput.vue';
import AppFormModal from '@/components/general/FormModal.vue';
import AppTextarea from '@/components/general/Textarea.vue';
import videoCategories from '@/assets/config/videocategories.json';
import AppProgressIndicator from '@/components/general/ProgressIndicator.vue';

import videoPlaceholder from '@/assets/images/video-thumbnail-placeholder.jpg';

function onceEventFired(el, type) {
  return new Promise((resolve) => {
    const listener = (...props) => {
      resolve([...props]);
      el.removeEventListener(type, listener);
    };

    el.addEventListener(type, listener);
  });
}

async function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function isVideoPlayable(videoFile) {
  const video = document.createElement('video');
  video.setAttribute('src', URL.createObjectURL(videoFile));
  video.currentTime = 1;

  await Promise.race([wait(1000), onceEventFired(video, 'loadeddata')]);

  if (video.readyState === 0) {
    return false;
  }

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
  const getBlob = async () =>
    new Promise((resolve) => canvas.toBlob((blob) => resolve(blob)));

  const blob = await getBlob();

  return blob instanceof Blob;
}

export default {
  components: {
    AppFileInput,
    AppFormModal,
    AppTextarea,
    AppImageInput,
    AppImageCrop,
    AppProgressIndicator,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    video: {
      type: Object,
    },
  },
  data() {
    return {
      thumbnails: null,
      thumbnail: null,
      draft: {},
      uploading: false,
      categories: videoCategories,
      draftTitle: null,
      action: 'Next',
      header: 'Step 1',
      showSelect: true,
      showInfo: false,
      showThumbnail: false,
      showCrop: false,
      activeStep: 0,
    };
  },
  computed: {
    disableAction() {
      if (this.header === 'Step 1') {
        if (!this.draft.file) {
          return true;
        }
      }
      if (this.header === 'Step 2') {
        if (!this.draftTitle || this.draftTitle.length > 50) {
          return true;
        }
      }
      if (this.header === 'Step 3') {
        if (!this.thumbnail) {
          return true;
        }
      }
      if (this.showCrop) {
        return true;
      }
      return false;
    },
    thumbnailImage() {
      return this.draft.thumbnail.url || this.draft.thumbnail.dataurl;
    },
  },
  methods: {
    async uploadThumbnail() {
      const file = await $utils.selectFile('image/*');
      file.dataurl = URL.createObjectURL(file);
      this.thumbnail = file;
      this.draft.thumbnail = file;
      this.showCrop = true;
    },
    croppedThumbnail(image) {
      this.showCrop = false;
      this.draft.thumbnail = image;
    },
    relevantAction() {
      if (this.action === 'Next' && this.header === 'Step 2') {
        this.action = 'Publish';
        this.header = 'Step 3';
        this.showThumbnail = true;
        this.showInfo = false;
        this.activeStep = 2;
        this.showSelect = false;
      } else if (this.action === 'Publish') {
        this.activeStep = 3;
        this.upload();
      }
    },
    selectVideo() {
      this.showModal = true;
      this.draft = {};
    },

    /**
     * @param {HTMLVideoElement} video
     * @param canvas
     * @param time
     * @return {Promise<unknown>}
     */
    generateThumbnail(video, canvas, time) {
      return new Promise((resolve, reject) => {
        video.addEventListener('timeupdate', () => {
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
          canvas.toBlob((blob) => resolve(this.blobToThumbnail(blob)));
        });
        video.currentTime = time;
      });
    },
    blobToThumbnail(blob) {
      const thumbUrl = URL.createObjectURL(blob);
      const file = new File([blob], 'thumb.png', {
        type: 'image/png',
      });

      return { url: thumbUrl, file };
    },
    goToInfo() {
      this.showSelect = false;
      this.showInfo = true;
      this.showThumbnail = false;
      this.action = 'Next';
      this.header = 'Step 2';
      this.activeStep = 1;
    },
    async generateThumbnails(file) {
      console.log('generateThumbnails | Selected', file);
      const canGenerateThumbnails = await isVideoPlayable(file);
      console.log('generateThumbnails | canGenerateThumbnails', {
        canGenerateThumbnails,
      });

      this.goToInfo();
      this.draft.file = file;
      const videoUrl = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.src = videoUrl;
      this.draft.videoUrl = videoUrl;

      if (!canGenerateThumbnails) {
        const res = await fetch(new Request(videoPlaceholder));
        const videThumbnailPlaceholderBlob = await res.blob();
        this.selectThumbnail(
          this.blobToThumbnail(videThumbnailPlaceholderBlob)
        );

        return;
      }

      video.addEventListener('loadedmetadata', async () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const duration = video.duration;

        const thumbnails = [];

        for (let i = 1; i <= 4; i += 1) {
          /* eslint-disable no-await-in-loop */
          const thumbUrl = await this.generateThumbnail(
            video,
            canvas,
            Math.floor((i * duration) / 5)
          );
          thumbnails.push(thumbUrl);
        }
        this.thumbnails = thumbnails.reverse();
        this.selectThumbnail(this.thumbnails[0]);
      });
    },
    onInput(val) {
      this.thumbnail = val;
      this.draft.thumbnail = val;
    },
    selectThumbnail(t) {
      this.thumbnail = t;
      this.draft.thumbnail = t;
      this.draftTitle = this.draftTitle
        ? this.draftTitle
        : this.draft.file.name;
    },
    async upload() {
      this.uploading = true;
      const thumbnailInfo = this.draft.thumbnail.file
        ? this.draft.thumbnail.file
        : this.draft.thumbnail;
      const [videoUrl, thumbUrl] = await $aws.bulkUpload([
        this.draft.file,
        thumbnailInfo,
      ]);

      const videoAttachment = {
        // size, width, height
        url: videoUrl,
        thumbUrl,
        contentType: this.draft.file.type,
        type: 'video',
        size: this.draft.file.size,
        name: this.draft.file.name,
        title: this.draftTitle,
        description: this.draft.description,
      };
      const post = {
        bodyText: this.draftTitle || this.draft.description,
        video: videoAttachment,
        category: this.draft.category,
      };
      const resp = await $videosApi.createVideo(post);
      this.uploading = false;
      this.$emit('published', resp.data.create_post);
      this.done();
    },
    done() {
      this.activeStep = 0;
      this.$emit('close');
    },
  },
};
</script>
<style scoped>
.video-upload-modal-footer {
  text-align: right;
}
.video-thumbnail__option {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.thumbnail-option {
  height: 125px;
  width: 172px;
  object-fit: cover;
  margin-top: 5px;
}
.thumbnail-option:hover {
  cursor: pointer;
  border: solid 1px var(--cs-primary-base);
  box-sizing: border-box;
}
.video-modal-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.simple-modal >>> .cs-modal__body {
  margin-top: 5px;
  padding: 0px;
}
.simple-modal >>> .cs-modal__footer {
  display: none;
}
.character-counter {
  display: flex;
  flex-direction: row;
  color: var(--cs-gray-04);
  justify-content: flex-end;
}
.video-information-modal {
  text-align: center;
  color: var(--cs-gray-05);
  margin-bottom: 15px;
}
.video-main-title {
  margin-bottom: 5px;
}
.video-detail-title {
  text-align: center;
  margin-top: 10px;
}
.upload-button {
  --cs-button-color: var(--cs-gray-00) !important;
  --cs-button-text-color: var(--cs-gray-07) !important;
  position: absolute;
  bottom: 15px;
  right: 5px;
}
.video-thumbnail {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.img-input-wrapper {
  width: 100%;
}
.img-input-wrapper >>> .group-editor-image-input__wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}
.thumbnail-container {
  position: relative;
}
.create-video-thumbnail-holder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 200px;
  background-color: black;
  margin-top: 10px;
}
.create-video-thumbnail-holder img {
  max-height: 100%;
  max-width: 100%;
}
.progress-indicator {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}

.simple-modal >>> .ch-modal-form__overlay-progress {
  color: var(--cs-gray-00);
}

.simple-modal >>> .cs-spinner {
  --cs-spinner-color: var(--cs-gray-00) !important;
}
</style>
