<template>
  <div class="avatar-holder">
    <app-avatar
      :picture="src"
      :name="name"
      variant="primary"
      size="large"
      original
    />
    <div class="avatar-edit-icon-background" @click="editPicture(false)" />
    <div class="avatar-edit-icon" @click="editPicture(false)">
      <i class="cs-icons-edit"></i>
    </div>
    <app-image-crop-modal
      v-model="selectedImageSrc"
      :show="bannerEditorOpen"
      :aspect-ratio="1 / 1"
      enforce-ratio
      @input="useSelected"
      @close="onModalClose()"
    />
  </div>
</template>

<script>
import $utils from '@/services/utils';
import AppAvatar from '@/components/general/Avatar.vue';
import AppImageCropModal from './ImageCropModal.vue';

export default {
  components: {
    AppImageCropModal,
    AppAvatar,
  },
  props: {
    value: {
      type: String,
      required: false,
      default: '',
    },
    name: {
      type: String,
      required: false,
      default: 'Unknown',
    },
  },
  data() {
    return {
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
.avatar-holder {
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  position: relative;
  width: min-content;
  overflow: hidden;
  border: solid 4px var(--cs-gray-00);
  border-radius: 50%;
  cursor: pointer;
  margin-top: 36px;
}
.avatar-holder >>> .ch-avatar {
  --ch-avatar-size: 125px;
}
.avatar-edit-icon-background {
  position: absolute;
  top: 0px;
  left: 0;
  height: 125px;
  width: 125px;
  border-radius: 50%;
  background-color: var(--cs-gray-08);
  opacity: 0.6;
}
.avatar-edit-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
  font-size: 32px;
  color: var(--cs-gray-00);
}
</style>
