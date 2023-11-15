<template>
  <app-form-modal
    :show="show"
    :title="modalTitle"
    :saving="saving"
    @close="done()"
  >
    <!-- PROGRESS INDICATOR -->
    <app-progress-indicator
      :steps="4"
      :active-step="activeStep"
      class="progress-indicator"
    />

    <div class="edit-channel-modal-body">
      <!-- CHANNEL INFORMATION -->
      <div v-if="showInfo" class="video-information other-body">
        <div class="create-channel-text">
          <div class="cs-textstyle-item-heading main-title">
            Channel Name & Description
          </div>
          <div class="cs-textstyle-paragraph details">
            Provide a name for your channel and a description of what your
            channel is about. This will help viewers understand the content of
            your videos.
          </div>
          <cs-button
            fill="clear"
            variant="info"
            :disabled="!name"
            @click="channelIconView"
            >SKIP</cs-button
          >
        </div>
        <cs-input
          v-model="name"
          label="Name"
          :maxlength="50"
          class="edit-fields"
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
          :slug="orignalSlug"
          :name="user.channelName"
          slug-type="CHANNEL"
          @slugInput="handleSlugInput"
          @slugChecking="slugLoading = true"
        />
      </div>

      <!-- CHANNEL ICON -->
      <div v-if="showPicUpload" class="other-body">
        <div v-if="!showIconCropper" class="create-channel-text">
          <div class="ch-profile-modal__header">
            <div class="cs-textstyle-item-heading">Channel Icon</div>
            <div class="cs-textstyle-paragraph details">
              Choose an icon for your channel. Tap on Upload to upload an image.
              To change the icon. tap on edit button.
            </div>
            <cs-button fill="clear" variant="info" @click="channelHeaderView"
              >SKIP</cs-button
            >
          </div>
          <div class="channel-icon-container">
            <div class="cs-textstyle-detail-heading preview-model">Preview</div>

            <app-image-input
              v-if="!channelIconImage"
              label=""
              class="channel-icon"
              @input="channelIconUploaded"
            />
            <div class="ch-avatar-container">
              <app-avatar
                v-if="channelIconImage"
                :picture="channelIconImage"
                class="ch-profile-modal__profile-photo"
                size="large"
              />
            </div>
          </div>
          <div class="ch-profile-modal__change-button">
            <cs-button
              fill="outline"
              size="small"
              :disabled="!channelIconImage"
              variant="secondary"
              @click="changePhoto('image/*')"
              >Edit</cs-button
            >
          </div>
        </div>
        <div v-if="showIconCropper" class="cropped-image">
          <app-image-crop
            :image="channelIconImage"
            channel-icon
            @cropped="croppedChannelIcon"
          />
        </div>
      </div>

      <!-- CHANNEL BANNER -->
      <div v-if="showBannerUpload" class="other-body">
        <div v-if="!hidebanner" class="create-channel-text">
          <div class="cs-textstyle-item-heading">Channel Header</div>
          <div class="cs-textstyle-paragraph-small details">
            Choose a header for your channel. You can upload an image or choose
            one default header from the list. The image will be cropped to 5.75
            : 1 ratio.
          </div>
          <cs-button fill="clear" variant="info" @click="channelButtonsView"
            >SKIP</cs-button
          >
        </div>
        <div>
          <div
            v-if="!hidebanner"
            class="cs-textstyle-detail-heading preview-model"
          >
            Preview
          </div>
          <app-channel-cover-section
            :show-upload-button="true"
            @selected-cover="selectedCoverImage"
            @opened-crop="hideBannerInfo"
            @closed-crop="showBannerInfo"
          />
        </div>
      </div>

      <!-- CUSTOM BUTTONS -->
      <div v-if="showButtons" class="other-body">
        <div class="create-channel-text">
          <div class="cs-textstyle-item-heading">Add Custom Buttons.</div>
          <div class="cs-textstyle-paragraph details">
            You can add a custom button on your channel to direct your viewers
            to your other content. Enter the button name under Label and the
            webslink on Link.
          </div>
        </div>

        <cs-input
          v-model="buttonLabel"
          :maxlength="10"
          label="Custom Button Label"
          class="edit-fields"
        />
        <div class="character-counter">
          {{ buttonLabel ? buttonLabel.length : 0 }}/10 Characters
        </div>
        <cs-input
          v-model="buttonLink"
          label="Custom Button Link"
          class="edit-fields"
        />

        <cs-input
          v-model="buttonLabel2"
          :maxlength="10"
          label="Custom Button Label"
          class="edit-fields"
        />
        <div class="character-counter">
          {{ buttonLabel2 ? buttonLabel2.length : 0 }}/10 Characters
        </div>
        <cs-input
          v-model="buttonLink2"
          label="Custom Button Link"
          class="edit-fields"
        />
      </div>
      <!-- INVITE MODAL  -->
      <div v-if="showInviteModal" class="invite-modal">
        <app-channel-invite-modal />
      </div>
    </div>
    <!-- Footer Button -->
    <div slot="footer" class="edit-channel-modal-footer">
      <cs-button
        :disabled="
          saving ||
          slugLoading ||
          showIconCropper ||
          hidebanner ||
          name.length > 50
        "
        @click="relevantAction()"
        >{{ computedAction }}</cs-button
      >
    </div>
  </app-form-modal>
</template>
<script>
import $upload from '@/services/upload';
import $popups from '@/services/popups';
import $aws from '@/services/aws';
import $utils from '@/services/utils';
import $videosApi from '@/api/videos';
import AppFormModal from '@/components/general/FormModal.vue';
import AppImageInput from '@/components/general/ImageInput.vue';
import AppAvatar from '@/components/general/Avatar.vue';
import AppChannelInviteModal from '@/components/video/ChannelInvite.vue';
import AppChannelCoverSection from '@/components/video/ChannelCoverSection.vue';
import AppSlugInput from '@/components/general/SlugInput.vue';
import AppImageCrop from '@/components/general/ImageCrop.vue';
import AppTextarea from '@/components/general/Textarea.vue';
import AppProgressIndicator from '@/components/general/ProgressIndicator.vue';

export default {
  components: {
    AppFormModal,
    AppImageInput,
    AppChannelInviteModal,
    AppChannelCoverSection,
    AppSlugInput,
    AppAvatar,
    AppImageCrop,
    AppProgressIndicator,
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
      modalTitle: 'Step 1',
      name: this.user.channelName || '',
      description: this.user.channelDescription,
      picture: this.user.channelPicture,
      buttonLabel: this.user.channelButtonLabel,
      buttonLink: this.user.channelButtonLink,
      slug: this.user.channelSlug,
      orignalSlug: this.user.channelSlug,
      saving: false,
      selectedCover: null,
      slugLoading: false,
      fromCoverModal: null,
      updatedCover: null,
      buttonLabel2: null,
      buttonLink2: null,
      showInfo: true,
      showPicUpload: false,
      showBannerUpload: false,
      showButtons: false,
      showInviteModal: false,
      action: 'First',
      channelIconImage: null,
      file: null,
      finalPic: null,
      hidebanner: false,
      showIconCropper: false,
      activeStep: 0,
    };
  },
  computed: {
    cover() {
      const cover =
        this.user && this.user.channelCover ? this.user.channelCover : null;
      return cover;
    },
    computedAction() {
      if (this.action === 'First') {
        return 'Next';
      }
      if (this.action === 'Second') {
        return 'Next';
      }
      if (this.action === 'Third') {
        return 'Next';
      }
      if (this.action === 'Forth') {
        return 'CREATE';
      }
      if (this.action === 'Fifth') {
        return 'DONE';
      }
      return 'NEXT';
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
    reset() {
      this.showInfo = true;
      this.showPicUpload = false;
      this.showBannerUpload = false;
      this.showButtons = false;
      this.showInviteModal = false;
      this.hidebanner = false;
      this.action = 'First';
      this.modalTitle = 'Step 1';
    },
    done() {
      this.activeStep = 0;
      window.location.reload();
      this.$emit('close');
    },
    channelIconView() {
      this.activeStep = 1;
      this.modalTitle = 'Step 2';
      this.action = 'Second';
      this.showInfo = false;
      this.showPicUpload = true;
      this.showBannerUpload = false;
      this.showButtons = false;
      this.showInviteModal = false;
    },
    channelHeaderView() {
      this.activeStep = 2;
      this.modalTitle = 'Step 3';
      this.action = 'Third';
      this.showInfo = false;
      this.showPicUpload = false;
      this.showBannerUpload = true;
      this.showButtons = false;
      this.showInviteModal = false;
    },
    channelButtonsView() {
      this.activeStep = 3;
      this.modalTitle = 'Step 4';
      this.action = 'Forth';
      this.showInfo = false;
      this.showPicUpload = false;
      this.showBannerUpload = false;
      this.showButtons = true;
      this.showInviteModal = false;
    },
    relevantAction() {
      if (this.action === 'First') {
        this.channelIconView();
        return;
      }
      if (this.action === 'Second') {
        // Saving Channel Icon
        this.saveNewProfile();
        this.channelHeaderView();
        return;
      }
      if (this.action === 'Third') {
        this.channelButtonsView();
        return;
      }
      if (this.action === 'Forth') {
        this.save();
        return;
      }
      if (this.action === 'Fifth') {
        this.activeStep = 0;
        window.location.reload();
        this.$emit('close', true);
      }
    },
    async save() {
      this.saving = true;

      try {
        let images;

        if (this.fromCoverModal && this.fromCoverModal.cover) {
          images = await $upload.uploadImages([this.fromCoverModal.cover]);
        } else if (!this.fromCoverModal) {
          images = await $upload.uploadImages([this.cover]);
        }

        if (this.fromCoverModal && this.fromCoverModal.selectedBanner) {
          this.selectedCover = this.fromCoverModal.selectedBanner;
        } else {
          this.selectedCover =
            images[0] && images[0].url ? images[0].url : this.cover;
        }

        const vars = {
          id: this.user.id,
          channelName: this.name,
          channelSlug: this.slug,
          channelPicture: this.finalPic,
          channelCover: this.selectedCover,
          channelDescription: this.description,
          channelButtonLink: this.buttonLink,
          channelButtonLabel: this.buttonLabel,
          channelButtonLink2: this.buttonLink2,
          channelButtonLabel2: this.buttonLabel2,
        };

        await $videosApi.updateChannel(vars);

        // Invite modal
        this.saving = false;
        this.modalTitle = 'Step 5';
        this.activeStep = 4;
        this.action = 'Fifth';
        this.showInfo = false;
        this.showPicUpload = false;
        this.showBannerUpload = false;
        this.showButtons = false;
        this.showInviteModal = true;
        this.saving = false;
        // this.$emit('close');
      } catch (e) {
        this.saving = false;
        $popups.alert(`Error Saving: ${JSON.stringify(e)}`);
      }
    },

    selectedCoverImage(val) {
      this.fromCoverModal = val;
    },

    // Channel Icon
    channelIconUploaded(val) {
      this.file = val;
      this.channelIconImage = this.file.dataurl;
      this.showIconCropper = true;
    },
    // Cropped Channel Icon
    croppedChannelIcon(image) {
      this.showIconCropper = false;
      this.file = image;
      this.channelIconImage = this.file.dataurl;
    },

    // profile photo upload methods
    async changePhoto(type) {
      try {
        const file = await $utils.selectFile(type);
        this.file = file;
        file.dataurl = URL.createObjectURL(file);
        this.channelIconImage = file.dataurl;
        this.showIconCropper = true;
      } catch (error) {
        $popups.alert(`Error: ${error}`);
      }
    },
    async saveNewProfile() {
      try {
        // upload Img in S3
        const imgUrl = await $aws.uploadFile(this.file, null, 'channel');
        this.finalPic = imgUrl;
      } catch (error) {
        console.log(error);
      }
    },
  },
};
</script>

<style scoped>
.progress-indicator {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}
.edit-channel-modal-body {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: white;
}
.edit-channel-modal-footer {
  text-align: right;
}
.cover-button {
  width: 60%;
}
.create-channel-text {
  text-align: center;
  color: var(--cs-gray-05);
}
.ch-profile-modal__change-button {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 10px;
  width: 100%;
}
.other-body {
  padding: 10px 25px;
}
.details {
  width: 90%;
  text-align: center;
  margin: 5px auto;
  font-size: 14px;
}
.character-counter {
  display: flex;
  flex-direction: row;
  margin: 10px 0px;
  color: var(--cs-gray-04);
  justify-content: flex-end;
  font-size: 14px;
}
.channel-icon-container {
  margin-top: 10px;
  margin-bottom: 20px;
}
.edit-fields {
  width: 100%;
}
.ch-profile-modal__profile-photo {
  --ch-avatar-size: 125px;
  margin-top: 5px;
}
.ch-avatar-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
* >>> .cs-input__input {
  background-color: var(--cs-gray-01) !important;
}
* >>> .cs-textarea__textarea {
  background-color: var(--cs-gray-01) !important;
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
