<template>
  <app-modal :show="true" :title="title" @close="done()">
    <app-spinner v-if="saving" />
    <div v-if="!saving" class="video-upload-modal-body">
      <div v-if="showInfo">
        <div class="video-information-modal">
          <div class="cs-textstyle-item-heading video-main-title">
            Change Video Thumbnail
          </div>
          <div class="cs-textstyle-paragraph">
            Tap on the Edit button to change your video thumbnail.
          </div>
          <div>
            <cs-button
              variant="secondary"
              fill="outline"
              size="small"
              class="edit-button"
              @click="openThumbnailModal"
              >Edit</cs-button
            >
          </div>
          <div class="cs-textstyle-item-heading video-main-title">
            Change Video Information
          </div>
        </div>
        <div class="info-container">
          <cs-input
            v-model="draftVideo.video.title"
            label="Title"
            class="edit-fields"
            maxlength="50"
          />
          <div class="character-cnt">
            {{ draftVideo.video.title ? draftVideo.video.title.length : 0 }}/50
            Characters
          </div>
          <app-textarea
            v-model="draftVideo.video.description"
            class="edit-fields"
            label="Description"
            maxlength="2500"
          />
          <div class="character-cnt">
            {{
              draftVideo.video.description
                ? draftVideo.video.description.length
                : 0
            }}/2500 Characters
          </div>
          <cs-select
            v-model="draftVideo.category"
            class="edit-fields"
            label="Category"
            :options="categories"
          />
        </div>
      </div>
      <!-- Edit thumbnail -->
      <div v-if="!showInfo">
        <div v-if="!showCrop">
          <div class="video-information-modal">
            <div class="cs-textstyle-item-heading video-main-title">
              Video Thumbnail
            </div>
            <div class="cs-textstyle-paragraph">
              This is a current video thumbnail. To upload an image tap on
              Upload button.
            </div>
          </div>
          <div v-if="thumbnailImage" class="thumbnail-container">
            <div class="cs-textstyle-detail-heading video-detail-title">
              Preview
            </div>
            <div v-if="thumbnailImage" class="create-video-thumbnail-holder">
              <img :src="thumbnailImage" />
            </div>
            <cs-button
              size="small"
              class="upload-button"
              @click="uploadThumbnail"
              >Upload</cs-button
            >
          </div>
          <div
            v-if="
              draftVideo.video.streamStatus === 'COMPLETE' &&
              draftVideo.video.streamId
            "
            class="video-thumbnail__option"
          >
            <img
              v-for="(t, index) in thumbnails"
              :key="index"
              class="thumbnail-option"
              :src="t"
              @click="selectThumbnail(t)"
            />
          </div>
          <div
            v-if="!draftVideo.video.streamStatus && !draftVideo.video.streamId"
            class="video-thumbnail__nooption"
          >
            <cs-alert
              variant="info"
              content="Other thumbnail options will be available once this video has finished processing."
            />
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
    </div>
    <!-- Footer Buttons -->
    <div slot="footer" class="video-upload-modal-footer">
      <cs-button
        v-if="!showInfo"
        :disabled="saving"
        fill="outline"
        variant="secondary"
        @click="goBack()"
        >Back</cs-button
      >
      <cs-button :disabled="!valid || saving || showCrop" @click="save()"
        >Save</cs-button
      >
    </div>
  </app-modal>
</template>

<script>
import $videosApi from '@/api/videos';
import $cdn from '@/services/cdn';
import $utils from '@/services/utils';
import $aws from '@/services/aws';
import AppImageCrop from '@/components/general/ImageCrop.vue';
import AppModal from '@/components/general/Modal.vue';
import AppTextarea from '@/components/general/Textarea.vue';
import AppSpinner from '@/components/general/Spinner.vue';

import videoCategories from '@/assets/config/videocategories.json';

export default {
  components: {
    AppModal,
    AppTextarea,
    AppSpinner,
    AppImageCrop,
  },
  props: {
    currentVideo: {
      type: Object,
      required: true,
    },
  },
  data() {
    const draftVideo = JSON.parse(JSON.stringify(this.currentVideo));
    draftVideo.video.title =
      draftVideo.video.title || draftVideo.video.name || draftVideo.bodyText;
    this.thumbnails = [
      `${process.env.VUE_APP_VIDEO_DOMAIN}/${draftVideo.video.streamId}/thumbnail.jpg`,
      `${process.env.VUE_APP_VIDEO_DOMAIN}/${draftVideo.video.streamId}/thumbnail_1.jpg`,
      `${process.env.VUE_APP_VIDEO_DOMAIN}/${draftVideo.video.streamId}/thumbnail_2.jpg`,
      `${process.env.VUE_APP_VIDEO_DOMAIN}/${draftVideo.video.streamId}/thumbnail_3.jpg`,
    ];
    return {
      thumburl: false,
      draftVideo,
      categories: videoCategories,
      saving: false,
      title: 'Edit Video',
      showInfo: true,
      newThumbnail: null,
      relevantIcon: false,
      showCrop: false,
    };
  },
  computed: {
    thumbnailImage() {
      if (this.newThumbnail) {
        return this.newThumbnail.dataurl || this.newThumbnail;
      }
      return $cdn.optimize(this.draftVideo.video.thumbUrl);
    },
    valid() {
      if (
        !this.draftVideo.video.title ||
        this.draftVideo.video.title.length > 50
      ) {
        return false;
      }
      return true;
    },
  },
  methods: {
    done() {
      this.$emit('close');
      this.showInfo = true;
    },
    openThumbnailModal() {
      this.title = 'Edit thumbnail';
      this.showInfo = false;
    },
    goBack() {
      this.title = 'Edit Video';
      this.showInfo = true;
    },
    croppedThumbnail(image) {
      this.showCrop = false;
      this.newThumbnail = image;
    },
    async uploadThumbnail() {
      this.thumburl = false;
      const file = await $utils.selectFile('image/*');
      file.dataurl = URL.createObjectURL(file);
      this.newThumbnail = file;
      this.showCrop = true;
    },
    selectThumbnail(t) {
      this.thumburl = true;
      this.newThumbnail = t;
    },
    async uploadNewThumbnail() {
      const [thumbUrl] = await $aws.bulkUpload([this.newThumbnail]);
      return thumbUrl;
    },
    async save() {
      this.saving = true;
      if (this.newThumbnail) {
        const newThumbnail = this.thumburl
          ? this.newThumbnail
          : await this.uploadNewThumbnail();
        this.draftVideo.video.thumbUrl = newThumbnail;
      }
      const video = {
        postId: this.draftVideo.id,
        bodyText: this.draftVideo.bodyText,
        video: this.draftVideo.video,
        category: this.draftVideo.category,
      };
      await $videosApi.updateVideo(video, this.currentVideo);
      this.saving = false;
      this.done();
    },
  },
};
</script>
<style scoped>
.thumbnail-container {
  position: relative;
}
.video-upload-modal-body {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.video-upload-modal-footer {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}
.edit-button {
  margin-top: 20px;
  margin-bottom: 20px;
}
.character-cnt {
  display: flex;
  flex-direction: row;
  margin: 10px 0px;
  color: var(--cs-gray-04);
  justify-content: flex-end;
}
.video-main-title {
  margin-bottom: 5px;
}
.video-information-modal {
  text-align: center;
  color: var(--cs-gray-05);
  margin-bottom: 15px;
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
.upload-button {
  --cs-button-color: var(--cs-gray-00) !important;
  --cs-button-text-color: var(--cs-gray-07) !important;
  position: absolute;
  bottom: 15px;
  right: 5px;
}
.edit-fields {
  width: 100%;
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
.video-thumbnail__nooption {
  margin-top: 5px;
}
</style>
