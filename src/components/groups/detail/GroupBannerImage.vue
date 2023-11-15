<template>
  <!-- Allows displaying and editing the banner image -->
  <div
    class="group-banner-image"
    @mouseover="showEditIcon = true"
    @mouseleave="showEditIcon = false"
  >
    <!-- Image -->
    <app-img
      class="group-banner-image__banner"
      auto-optimize
      :src="source"
      :alt="alt"
    />

    <!-- Background for icon -->
    <div
      v-if="showEditIcon && userIsModerator"
      class="group-banner-image__icon-background"
      @click="editBanner"
    />

    <!-- Loading spinner -->
    <app-spinner
      v-if="bannerSaving"
      class="group-banner-image__avatar-spinner"
    />

    <!-- Edit icon -->
    <div
      v-if="showEditIcon && userIsModerator"
      class="group-banner-image__avatar-edit-icon"
      @click="editBanner"
    >
      <i class="cs-icons-edit"></i>
    </div>

    <!-- Modal to handle cropping -->
    <app-image-crop-modal
      v-model="selectedBannerSrc"
      :show="showBannerEditor"
      :aspect-ratio="3"
      enforce-ratio
      @input="useBanner"
      @close="onBannerModalClose"
    />
  </div>
</template>

<script>
import $utils from '@/services/utils';
import $upload from '@/services/upload';
import $groupsApi from '@/api/groups';
import $popups from '@/services/popups';

// General components
import AppImg from '@/components/general/Img.vue';
import AppSpinner from '@/components/general/Spinner.vue';

// Image Cropping Modal from the Connections section
import AppImageCropModal from '@/components/connections/editor/ImageCropModal.vue';

const defaultBannerUrl = require('@/assets/images/placeholders/group-banner.png');

export default {
  components: {
    AppImg,
    AppSpinner,
    AppImageCropModal,
  },
  props: {
    group: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showEditIcon: false,
      selectedBannerSrc: null,
      showBannerEditor: false,
      bannerSaving: false,
      bannerSrc: '',
    };
  },
  computed: {
    source() {
      return this.group.banner ? this.group.banner : defaultBannerUrl;
    },
    alt() {
      const defaultAlt = `Default group banner picture`;
      const groupAlt = `${this.group.name} banner picture`;
      return this.group.banner ? groupAlt : defaultAlt;
    },
    userIsModerator() {
      if (!this.group || !this.group.myMembership) return null;
      const membership = this.group.myMembership.role;
      return membership === 'moderator' || membership === 'admin';
    },
  },
  mounted() {
    this.bannerSrc = this.group.banner;
  },
  methods: {
    async editBanner() {
      const file = await $utils.selectFile('image/*');
      this.selectedBannerSrc = URL.createObjectURL(file);
      this.showBannerEditor = true;
    },
    onBannerModalClose() {
      this.showBannerEditor = false;
    },
    async useBanner(pic) {
      this.bannerSaving = true;
      this.bannerSrc = pic;
      this.uploadBanner().then(this.updateGroupWithBanner);
    },
    uploadBanner() {
      return Promise.all([$utils.dataURLtoFile(this.bannerSrc, 'banner.png')])
        .then($upload.uploadImages)
        .then((imgs) =>
          // return banner url
          imgs[0] && imgs[0].url ? imgs[0].url : this.group.banner
        )
        .catch((err) => {
          this.showError(
            'There was an error uploading.  Please try again later or contact support',
            err
          );
        });
    },
    updateGroupWithBanner(bannerUrl) {
      const vars = {
        ...this.group,
        banner: bannerUrl,
      };
      $groupsApi
        .updateGroup(this.group.id, vars)
        .then(() => {
          this.selectedBannerSrc = null;
          this.bannerSaving = false;
        })
        .catch((err) => {
          this.showError(
            'There was an error saving.  Please try again later or contact support',
            err
          );
        });
    },
    showError(message, err) {
      this.bannerSaving = false;
      $popups.alert(message);
      throw err;
    },
  },
};
</script>

<style scoped>
.group-banner-image {
  position: relative;
}

.group-banner-image__banner {
  min-height: 200px;
  width: 100%;
  object-fit: cover;
}
.group-banner-image__banner:nth-child(2) {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.group-banner-image__icon-background {
  cursor: pointer;
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0px;
  left: 0;
  background-color: var(--cs-gray-08);
  opacity: 0.6;
  border-radius: 10px;
}

.group-banner-image__avatar-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
  color: var(--cs-gray-00);
}
.group-banner-image__avatar-edit-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
  font-size: 32px;
  color: var(--cs-gray-00);
}
</style>
