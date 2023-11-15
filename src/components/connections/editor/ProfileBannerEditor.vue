<template>
  <div class="profile-banner-holder">
    <app-img v-if="src" :src="src" class="profile-banner" original />
    <app-img v-else class="profile-banner" :src="placeholderImg" />
    <div class="profile-edit-icon" @click="editPicture()">
      <i class="cs-icons-edit"></i>
    </div>
    <app-image-crop-modal
      v-model="selectedImageSrc"
      :show="bannerEditorOpen"
      :aspect-ratio="3.3 / 1"
      enforce-ratio
      @input="useSelected"
      @close="onModalClose()"
    />
  </div>
</template>

<script>
import $utils from '@/services/utils';
import AppImg from '@/components/general/Img.vue';
import AppImageCropModal from './ImageCropModal.vue';

const placeholderImg = require('@/assets/images/placeholders/profile-edit-banner.png');

export default {
  components: {
    AppImageCropModal,
    AppImg,
  },
  props: {
    value: {
      type: String,
      required: false,
      default: '',
    },
  },
  data() {
    return {
      placeholderImg,
      src: this.value, // The current selected image
      selectedImageSrc: null, // Temporary variable used to hold images while being cropped
      bannerEditorOpen: false, // Whether the modal needs to be open
    };
  },
  methods: {
    async editPicture() {
      const file = await $utils.selectFile('image/*');
      this.selectedImageSrc = URL.createObjectURL(file);
      this.bannerEditorOpen = true;
    },
    onModalClose() {
      this.bannerEditorOpen = false;
    },
    useSelected(pic) {
      this.src = pic;
      this.$emit('input', pic);
    },
  },
};
</script>

<style scoped>
.profile-banner-holder {
  position: relative;
}
.profile-banner {
  height: 300px;
  width: 100%;
  object-fit: cover;
}
.profile-edit-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 20px;
  right: 20px;
  height: 36px;
  width: 36px;
  background-color: var(--cs-gray-00);
  color: var(--cs-gray-05);
  font-size: 18px;
  cursor: pointer;
  border-radius: 50%;
}

.profile-banner-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
}
</style>
