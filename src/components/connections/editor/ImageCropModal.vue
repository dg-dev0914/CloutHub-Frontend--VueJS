<template>
  <portal to="modals">
    <div class="edit-banner-picture-modal">
      <app-modal
        :show="show"
        no-backdrop
        title="Crop Image"
        @close="closeModal"
      >
        <div v-if="value">
          <div class="edit-banner-picture-modal__image-wrapper">
            <vue-cropper
              v-if="!croppedImg"
              ref="cropper"
              :aspect-ratio="aspectRatio"
              :src="value"
              preview=".preview"
              drag-mode="none"
              :auto-crop-area="1"
              :zoomable="false"
              :movable="false"
              :crop-box-movable="true"
              :crop-box-resizable="true"
            />
            <img
              v-else
              class="edit-banner-picture-modal__image"
              :src="croppedImg"
            />
          </div>
        </div>
        <div slot="footer" class="edit-banner-picture-modal__buttons">
          <cs-button
            v-if="!croppedImg"
            fill="outline"
            :style="{ 'margin-right': '1rem' }"
            @click="onCropClick()"
          >
            <i
              class="cs-icons-full-screen"
              :style="{ 'margin-right': '0.3rem' }"
            ></i>
            Crop
          </cs-button>
          <cs-button
            v-if="!croppedImg && !enforceRatio"
            fill="outline"
            :style="{ 'margin-right': '1rem' }"
            @click="reset()"
            ><i
              class="cs-icons-pull-refresh"
              :style="{ 'margin-right': '0.3rem' }"
            ></i>
            Don't Crop
          </cs-button>
          <cs-button v-if="croppedImg" @click="use()"> Update </cs-button>
        </div>
      </app-modal>
    </div>
  </portal>
</template>

<script>
import AppModal from '@/components/general/Modal.vue';
import VueCropper from 'vue-cropperjs';
import 'cropperjs/dist/cropper.css';

export default {
  components: {
    AppModal,
    VueCropper,
  },
  props: {
    show: {
      type: Boolean,
      required: false,
      default: false,
    },
    value: {
      type: String,
      required: false,
      default: '',
    },
    aspectRatio: {
      type: Number,
      required: false,
      default: 1 / 1,
    },
    enforceRatio: {
      type: Boolean,
      required: false,
      default: false,
    },
    showPreview: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  data() {
    return {
      croppedImg: null,
    };
  },
  methods: {
    async cropImage() {
      this.croppedImg = this.$refs.cropper.getCroppedCanvas().toDataURL();
    },
    reset() {
      this.croppedImg = this.value;
      const img = new Image();
      img.src = this.croppedImg;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0);
        const dataURI = canvas.toDataURL();
        this.croppedImg = dataURI;
      };
    },
    use() {
      this.$emit('input', this.croppedImg);
      this.croppedImg = null;
      this.$emit('close');
    },
    closeModal() {
      this.croppedImg = null;
      this.$emit('close');
    },
    onCropClick() {
      this.cropImage();

      if (!this.showPreview) {
        this.use();
      }
    },
  },
};
</script>

<style lang="css">
.edit-banner-picture-modal__image-wrapper {
  position: relative;
  overflow: hidden;
  min-height: 300px;
}
.edit-banner-picture-modal__image {
  height: 100%;
  width: 100%;
  object-fit: contain;
  border-radius: 10px;
}
.edit-banner-picture-modal__buttons {
  text-align: right;
}

.preview {
  width: 100%;
  height: calc(372px * (9 / 16));
  overflow: hidden;
}
</style>
