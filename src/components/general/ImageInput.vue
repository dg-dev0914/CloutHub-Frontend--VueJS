<template lang="html">
  <div class="group-editor-image-input">
    <div class="group-editor-image-input__label cs-textstyle-label-text">
      {{ label }}
    </div>
    <div
      v-if="!imageSource"
      class="group-editor-image-input__wrapper"
      @click="selectImg"
    >
      <cs-file-input
        class="group-editor-image-input__input"
        application-id="0"
        accept-type="image/*"
      />
    </div>
    <div v-else class="group-editor-image-input__img-holder">
      <app-img :src="imageSource" class="group-editor-image-input__img" />
      <i
        v-if="showDeleteIcon"
        class="cs-icons-delete group-editor-image-input__delete"
        @click="remove"
      />
      <i
        v-if="fromEdit && value"
        class="cs-icons-edit group-editor-image-input__delete"
      />
      <cs-button
        v-if="showUploadButton"
        size="small"
        class="upload-button"
        @click="selectImg"
        >Upload</cs-button
      >
    </div>
    <!-- Modal to handle cropping -->
    <app-image-crop-modal
      :value="imageSource"
      :show="showImageEditor"
      :aspect-ratio="enforceRatio"
      :show-preview="false"
      enforce-ratio
      @input="onImageResize"
      @close="onImageCropClose"
    />
  </div>
</template>

<script>
import $utils from '@/services/utils';
import AppImg from '@/components/general/Img.vue';
import AppImageCropModal from '@/components/connections/editor/ImageCropModal.vue';

export default {
  components: {
    AppImg,
    AppImageCropModal,
  },
  props: {
    label: {
      type: String,
    },
    value: {
      type: [String, File],
    },
    fromEdit: {
      type: Boolean,
      default: false,
      required: false,
    },
    showUploadButton: {
      type: Boolean,
      default: false,
      required: false,
    },
    enforceRatio: {
      type: Number,
      required: false,
    },
  },
  data() {
    return {
      file: null,
      showImageEditor: false,
    };
  },
  computed: {
    imageSource() {
      if (this.file && this.file.dataurl) return this.file.dataurl;
      if (this.file && this.file.url) return this.file.url;
      if (this.value && this.value.dataurl) return this.value.dataurl;
      if (this.value && this.value.url) return this.value.url;
      if (this.value) return this.value;
      return null;
    },
    showDeleteIcon() {
      if (this.showUploadButton) {
        return false;
      }
      if (this.fromEdit) {
        return false;
      }
      return true;
    },
  },
  methods: {
    async selectImg() {
      if (!this.fromEdit) {
        const file = await $utils.selectFile('image/*');
        file.dataurl = URL.createObjectURL(file);
        this.file = file;

        if (this.enforceRatio) {
          this.showImageEditor = true;
        } else {
          this.$emit('input', this.file);
        }
      }
    },
    async onImageResize(src) {
      this.file = await $utils.dataURLtoFile(src, this.file.name);
      this.file.dataurl = URL.createObjectURL(this.file);

      this.showImageEditor = false;
      this.$emit('input', this.file);
    },
    onImageCropClose() {
      this.showImageEditor = false;
      this.remove();
    },
    remove() {
      this.file = '';
      this.$emit('input', this.file);
    },
  },
};
</script>

<style lang="css" scoped>
.group-editor-image-input {
}
.group-editor-image-input__wrapper {
  flex: 1;
}
.group-editor-image-input__label {
  color: var(--cs-gray-05);
  margin-bottom: var(--cs-form-label-margin-y-bottom);
}
.group-editor-image-input__input {
  pointer-events: none;
}
.group-editor-image-input__input >>> label {
  display: block;
}
.group-editor-image-input__img-holder {
  width: 100%;
  position: relative;
}
.group-editor-image-input__img {
  height: 100%;
  width: 100%;
  object-fit: contain;
  border-radius: 5px;
}
.group-editor-image-input__delete {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  backdrop-filter: blur(3px);
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.2);
  height: 50px;
  width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}
.upload-button {
  --cs-button-color: var(--cs-gray-00) !important;
  --cs-button-color-hover: var(--cs-gray-00) !important;
  --cs-button-text-color: var(--cs-gray-07) !important;
  --cs-button-padding: 2px 12px !important;
  position: absolute;
  right: 10px;
  bottom: 10px;
}
</style>
