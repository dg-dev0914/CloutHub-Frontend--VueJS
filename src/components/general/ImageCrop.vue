<template>
  <div class="image-crop">
    <div class="image-crop__cropper">
      <vue-cropper
        v-if="!croppedImg"
        ref="cropper"
        :aspect-ratio="aspectRatio"
        :src="image"
        drag-mode="crop"
        :movable="true"
        :crop-box-movable="true"
        :crop-box-resizable="true"
        :class="{ 'icon-cropper': channelIcon }"
      />
    </div>
    <div class="image-crop__btns">
      <cs-button size="small" @click="cropImage">Crop</cs-button>
    </div>
  </div>
</template>

<script>
import VueCropper from 'vue-cropperjs';
import 'cropperjs/dist/cropper.css';

const dataURLtoFile = async (dataURL, filename) => {
  const blob = await fetch(dataURL).then((r) => r.blob());
  const file = new File([blob], filename, {
    lastModified: Date.now(),
    type: blob.type,
  });
  file.dataurl = URL.createObjectURL(blob);
  return file;
};

export default {
  components: {
    VueCropper,
  },
  props: {
    image: {
      type: String,
      required: true,
    },
    aspectRatio: {
      type: Number,
      required: false,
      default: 1 / 1,
    },
    channelIcon: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  data() {
    return {
      croppedImg: null,
      file: null,
    };
  },
  methods: {
    async cropImage() {
      this.croppedImg = this.$refs.cropper.getCroppedCanvas().toDataURL();
      this.croppedCover(this.croppedImg);
    },
    async croppedCover(image) {
      const imageFiles = await Promise.all([
        dataURLtoFile(image, 'channel-banner.png'),
      ]);
      this.file = imageFiles[0];
      this.useCroppedImage();
    },
    useCroppedImage() {
      this.$emit('cropped', this.file);
      this.croppedImg = null;
    },
  },
};
</script>

<style scoped>
.image-crop {
  position: relative;
}
.image-crop__cropper {
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 300px;
}
.image-crop__btns {
  margin-top: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
}
.image-crop__reset {
  height: 100%;
  width: 100%;
  object-fit: contain;
  border-radius: 10px;
}
.icon-cropper >>> .cropper-view-box {
  border-radius: 100% !important;
}

.icon-cropper >>> .cropper-face {
  border-radius: 100% !important;
}
</style>
