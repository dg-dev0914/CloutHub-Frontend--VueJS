<template>
  <app-form-modal
    :show="show"
    :title="modalTitle"
    :saving="saving"
    @close="done()"
  >
    <div class="edit-channel-modal-body">
      <div v-if="showChannelInfo" class="edit-channel-information">
        <!-- Channel Images -->
        <div class="channel-images">
          <div class="edit-channel-text">
            <div class="cs-textstyle-item-heading main-title">Change Image</div>
            <div class="cs-textstyle-paragraph">
              Select which image you would like to change
            </div>
          </div>
          <div class="image-buttons">
            <cs-button
              variant="secondary"
              size="small"
              fill="outline"
              @click="showIcon"
              >Icon</cs-button
            >
            <cs-button
              variant="secondary"
              size="small"
              fill="outline"
              @click="showHeader"
              >Header</cs-button
            >
          </div>
        </div>
        <!-- Channel Information -->
        <div class="channel-info">
          <div class="edit-channel-text">
            <div class="cs-textstyle-item-heading main-title">
              Change Information
            </div>
          </div>
          <cs-input
            v-model="name"
            label="Name"
            class="edit-fields"
            :maxlength="50"
          />
          <div class="character-counter">
            {{ name ? name.length : 0 }}/50 Characters
          </div>
          <app-textarea
            v-model="description"
            label="Description"
            class="edit-fields"
            :maxlength="2500"
            :rows="rows"
          ></app-textarea>
          <div class="character-counter">
            {{ description ? description.length : 0 }}/2500 Characters
          </div>
          <!-- slug -->
          <app-slug-input
            :slug="slug"
            :name="user.channelName"
            slug-type="CHANNEL"
            @slugInput="handleSlugInput"
            @slugChecking="slugLoading = true"
          />
        </div>
        <!-- Channel Buttons -->
        <div class="channel-buttons">
          <div class="edit-channel-text">
            <div class="cs-textstyle-item-heading main-title">
              Change Custom Button
            </div>
          </div>
          <cs-input
            v-model="buttonLabel"
            label="Custom Button 1 Label"
            class="edit-fields"
          />
          <div class="character-counter">
            {{ buttonLabel ? buttonLabel.length : 0 }}/10 Characters
          </div>
          <cs-input
            v-model="buttonLink"
            label="Custom Button 1 Link"
            class="edit-fields"
          />
          <cs-input
            v-model="buttonLabel2"
            label="Custom Button 2 Label"
            class="edit-fields"
          />
          <div class="character-counter">
            {{ buttonLabel2 ? buttonLabel2.length : 0 }}/10 Characters
          </div>
          <cs-input
            v-model="buttonLink2"
            label="Custom Button 2 Link"
            class="edit-fields"
          />
        </div>
      </div>

      <!-- Channel Icon View -->
      <div v-if="showChannelIcon" class="">
        <div v-if="!showIconCropper" class="edit-channel-text">
          <div class="cs-textstyle-item-heading main-title">Channel Icon</div>
          <div class="cs-textstyle-paragraph">
            This is the current icon of your channel. To change the icon click
            on the edit button (required ratio 1 : 1)
          </div>

          <div class="channel-icon-container">
            <div class="cs-textstyle-detail-heading preview-model">Preview</div>

            <app-image-input
              v-if="!picture"
              label=""
              class="channel-icon"
              @input="channelIconUploaded"
            />
            <div class="ch-avatar-container">
              <app-avatar
                v-if="picture"
                :picture="picture"
                class="ch-profile-modal__profile-photo"
                size="medium"
              />
            </div>
          </div>
          <div class="ch-profile-modal__change-button">
            <cs-button
              :disabled="!picture"
              fill="outline"
              size="small"
              variant="secondary"
              @click="changePhoto('image/*')"
              >Edit</cs-button
            >
          </div>
        </div>
        <div v-if="showIconCropper" class="cropped-image">
          <app-image-crop
            :image="picture"
            channel-icon
            @cropped="croppedChannelIcon"
          />
        </div>
      </div>

      <!-- Channel Header View -->
      <div v-if="showChannelHeader" class="">
        <div v-if="!hidebanner" class="edit-channel-text">
          <div class="cs-textstyle-item-heading main-title">Channel Header</div>
          <div class="cs-textstyle-paragraph-small">
            This is the current header of your channel. To change the header
            click on upload button to upload an image (required ratio 5.75 : 1)
            or select a default header from the list
          </div>
        </div>
        <div class="channel-cover-container">
          <div
            v-if="!hidebanner"
            class="cs-textstyle-detail-heading preview-model"
          >
            Preview
          </div>
          <app-channel-cover-section
            :show-upload-button="true"
            :cover-image="user.channelCover ? user.channelCover : null"
            @selected-cover="selectedCoverImage"
            @opened-crop="hideBannerInfo"
            @closed-crop="showBannerInfo"
          />
        </div>
      </div>
    </div>
    <!-- FOOTER BUTTONS -->
    <div slot="footer" class="edit-channel-modal-footer">
      <cs-button
        v-if="!showChannelInfo"
        :disabled="saving"
        fill="outline"
        variant="secondary"
        @click="goBack()"
        >Back</cs-button
      >
      <cs-button
        :disabled="
          saving ||
          slugLoading ||
          showIconCropper ||
          hidebanner ||
          name.length > 50
        "
        @click="save()"
        >Save</cs-button
      >
    </div>
  </app-form-modal>
</template>
<script>
import $upload from '@/services/upload';
import $popups from '@/services/popups';
import $utils from '@/services/utils';
import $videosApi from '@/api/videos';
import AppFormModal from '@/components/general/FormModal.vue';
import AppImageInput from '@/components/general/ImageInput.vue';
import AppChannelCoverSection from '@/components/video/ChannelCoverSection.vue';
import AppSlugInput from '@/components/general/SlugInput.vue';
import AppAvatar from '@/components/general/Avatar.vue';
import AppImageCrop from '@/components/general/ImageCrop.vue';
import AppTextarea from '@/components/general/Textarea.vue';

export default {
  components: {
    AppFormModal,
    AppImageInput,
    AppChannelCoverSection,
    AppSlugInput,
    AppAvatar,
    AppImageCrop,
    AppTextarea,
  },
  props: {
    user: {
      type: Object,
      required: true,
    },
    show: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      rows: '1',
      name: this.user.channelName || '',
      description: this.user.channelDescription,
      picture: this.user.channelPicture,
      buttonLabel: this.user.channelButtonLabel,
      buttonLink: this.user.channelButtonLink,
      buttonLabel2: this.user.channelButtonLabel2,
      buttonLink2: this.user.channelButtonLink2,
      slug: this.user.channelSlug,
      saving: false,
      selectedCover: null,
      slugLoading: false,
      fromCoverModal: null,
      updatedCover: null,
      showChannelInfo: true,
      showChannelIcon: false,
      showChannelHeader: false,
      modalTitle: 'Edit Channel',
      imageFile: null,
      showIconCropper: false,
      hidebanner: false,
    };
  },
  computed: {
    cover() {
      const cover =
        this.user && this.user.channelCover ? this.user.channelCover : null;
      return cover;
    },
  },
  methods: {
    handleSlugInput(slug) {
      this.slug = slug;
      this.slugLoading = false;
    },
    hideBannerInfo() {
      this.hidebanner = true;
    },
    showBannerInfo() {
      this.hidebanner = false;
    },
    done() {
      this.saving = false;
      this.showChannelInfo = true;
      this.showChannelIcon = false;
      this.showChannelHeader = false;
      this.modalTitle = 'Edit Channel';
      this.hidebanner = false;
      this.showIconCropper = false;
      this.selectedCover = null;
      this.relevantIcon = false;
      this.rows = '1';
      this.picture = this.user.channelPicture;
      this.$emit('close');
    },
    goBack() {
      this.modalTitle = 'Edit Channel';
      this.relevantIcon = false;
      this.showChannelInfo = true;
      this.showChannelIcon = false;
      this.showChannelHeader = false;
      this.showIconCropper = false;
    },
    showIcon() {
      this.relevantIcon = true;
      this.modalTitle = 'Edit Channel Icon';
      this.showChannelInfo = false;
      this.showChannelIcon = true;
      this.showChannelHeader = false;
    },
    showHeader() {
      this.relevantIcon = true;
      this.modalTitle = 'Edit Channel Header';
      this.showChannelInfo = false;
      this.showChannelIcon = false;
      this.showChannelHeader = true;
    },
    channelIconUploaded(val) {
      this.imageFile = val;
      this.picture = this.imageFile.dataurl;
      this.showIconCropper = true;
    },
    // Cropped Channel Icon
    croppedChannelIcon(image) {
      this.showIconCropper = false;
      this.imageFile = image;
      this.picture = this.imageFile.dataurl;
    },
    // channel photo upload methods
    async changePhoto(type) {
      try {
        const file = await $utils.selectFile(type);
        this.imageFile = file;
        file.dataurl = URL.createObjectURL(file);
        this.picture = file.dataurl;
        this.showIconCropper = true;
      } catch (error) {
        $popups.alert(`Error: ${error}`);
      }
    },
    selectedCoverImage(val) {
      this.fromCoverModal = val;
    },
    async save() {
      this.saving = true;

      try {
        let images;

        if (this.fromCoverModal && this.fromCoverModal.selectedBanner) {
          images = await $upload.uploadImages([this.imageFile]);
        } else if (this.fromCoverModal && this.fromCoverModal.cover) {
          images = await $upload.uploadImages([
            this.imageFile,
            this.fromCoverModal.cover,
          ]);
        } else if (!this.fromCoverModal) {
          images = await $upload.uploadImages([this.imageFile, this.cover]);
        }

        const channelPicture =
          images[0] && images[0].url ? images[0].url : this.imageFile;

        if (this.fromCoverModal && this.fromCoverModal.selectedBanner) {
          this.selectedCover = this.fromCoverModal.selectedBanner;
        } else {
          this.selectedCover =
            images[1] && images[1].url ? images[1].url : this.cover;
        }

        const vars = {
          id: this.user.id,
          channelName: this.name,
          channelSlug: this.slug,
          channelPicture,
          channelCover: this.selectedCover,
          channelDescription: this.description,
          channelButtonLink: this.buttonLink,
          channelButtonLabel: this.buttonLabel,
          channelButtonLink2: this.buttonLink2,
          channelButtonLabel2: this.buttonLabel2,
        };
        await $videosApi.updateChannel(vars);
        this.saving = false;
        this.done();
      } catch (e) {
        this.saving = false;
        $popups.alert(`Error Saving: ${JSON.stringify(e)}`);
      }
    },
  },
};
</script>
<style scoped>
.edit-channel-modal-body {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.edit-channel-modal-footer {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}
.edit-fields {
  width: 100%;
}
.cover-button {
  width: 60%;
}
.edit-channel-text {
  text-align: center;
  color: var(--cs-gray-05);
}
.main-title {
  margin-top: 5px;
  margin-bottom: 10px;
}
* >>> .cs-input__input {
  background-color: var(--cs-gray-01) !important;
}
* >>> .cs-textarea__textarea {
  background-color: var(--cs-gray-01) !important;
}
.ch-avatar-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.image-buttons {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
  margin-bottom: 25px;
  margin-top: 25px;
}
.channel-icon-container {
  margin-top: 10px;
  margin-bottom: 20px;
}
.ch-profile-modal__profile-photo {
  --ch-avatar-size: 125px;
  margin-top: 5px;
}
.ch-profile-modal__change-button {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 10px;
  width: 100%;
}
.character-counter {
  display: flex;
  flex-direction: row;
  margin: 10px 0px;
  color: var(--cs-gray-04);
  justify-content: flex-end;
  font-size: 14px;
}
/* Channel Icon CSS (do we really need this many CSS to make it look similar to design. Refactor this when you have time) */
* >>> .channel-icon .cs-file-input__upload-arrow {
  font-size: 22px;
  margin-left: auto;
  display: none !important;
  margin-top: 7px;
  color: var(--cs-gray-03);
}

* >>> .channel-icon .cs-file-input__upload {
  display: block !important;
  background: var(--cs-gray-00);
  cursor: pointer;
  height: 141px;
  padding: var(--cs-card-padding-y) var(--cs-card-padding-x);
  border: 1px solid !important;
  border-color: var(--cs-gray-02) !important;
  border-radius: 100%;
}
* >>> .channel-icon .group-editor-image-input__input {
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
* >>> .channel-icon .cs-file-input__upload-icon-slot {
  font-size: 30px;
  color: var(--cs-gray-03);
  text-align: center;
  margin-top: 10px;
}
* >>> .channel-icon .cs-file-input__upload-text {
  display: flex;
  flex-direction: column;
  margin: 0 var(--cs-form-input-padding-x);
  word-break: break-word;
  text-align: center;
}
@media (min-width: 600px) and (max-width: 768px) {
  * >>> .channel-icon .group-editor-image-input__img-holder {
    width: 21% !important;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-around;
    margin: 0px 0px 0px 282px !important;
  }
}
@media (min-width: 770px) and (max-width: 1024px) {
  * >>> .channel-icon .group-editor-image-input__img-holder {
    width: 16% !important;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-around;
    margin: 0px 0px 0px 412px !important;
  }
}
@media (min-width: 355px) and (max-width: 580px) {
  * >>> .channel-icon .group-editor-image-input__img-holder {
    width: 43% !important;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-around;
    margin: 0px 0px 0px 94px !important;
  }
}
@media (min-width: 385px) and (max-width: 590px) {
  * >>> .channel-icon .group-editor-image-input__img-holder {
    width: 38% !important;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-around;
    margin: 0px 0px 0px 121px !important;
  }
}
@media (min-width: 280px) and (max-width: 300px) {
  * >>> .channel-icon .group-editor-image-input__img-holder {
    width: 66% !important;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-around;
    margin: 0px 0px 0px 41px !important;
  }
}
* >>> .channel-icon .group-editor-image-input__img {
  height: 141px;
  width: 141px;
  -o-object-fit: contain;
  object-fit: cover;
  border-radius: 68px;
}
* >>> .channel-icon .group-editor-image-input__img-holder {
  width: 57%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin: 0px 0px 0px 62px;
}

* >>> .channel-icon .group-editor-image-input__delete {
  position: absolute;
  top: 10px;
  right: 25px;
  font-size: 18px;
  -webkit-backdrop-filter: blur(3px);
  backdrop-filter: blur(3px);
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.2);
  height: 30px;
  width: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}
</style>
