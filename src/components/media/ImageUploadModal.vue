<template>
  <div>
    <cs-modal :show="show" @close="done()">
      <div slot="header">Upload Images</div>
      <div slot="body" class="image-upload-modal-body">
        <app-spinner v-if="uploading"></app-spinner>
        <app-file-input
          title="Drag images here, or:"
          buttonLabel="Select from computer"
          @selected="handleSelect"
          type="image/"
          accept="image/*"
          :multiple="true"
          v-if="!uploading"
        />
        <div v-if="images.length && !uploading" class="image-upload-modal-previews">
          <div class="image-upload-modal-preview" v-for="img in images" :key="img.localUrl" @click="remove(img)">
            <img :src="img.localUrl">
          </div>
        </div>
        <div class="image-upload-modal-footer">
          <cs-button size="small" :disabled="!images || uploading" @click="upload()">Upload</cs-button>
        </div>
      </div>
    </cs-modal>
  </div>
</template>
<script>
import $aws from '@/services/aws';
import AppSpinner from '@/components/general/Spinner.vue';
import AppFileInput from './FileInput.vue';

export default {
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    AppFileInput,
    AppSpinner,
  },
  watch: {
    show() {
      console.log('Reset');
      this.uploading = false;
      this.images = [];
      this.draft = {};
    },
  },
  data() {
    return {
      uploading: false,
      images: [],
      draft: {},
    };
  },
  methods: {
    handleSelect(files) {
      const newImages = files.map((f) => {
        f.localUrl = URL.createObjectURL(f);
        return f;
      });
      this.images = [...this.images, ...newImages];
    },
    remove(fileToRemove) {
      this.images = this.images.filter((f) => (f !== fileToRemove));
    },
    async upload() {
      this.uploading = true;
      console.log('Uploading...');
      // TODO: maybe replace with $upload.uploadImages
      const urls = await Promise.all(this.images.map((img) => $aws.uploadFile(img)));
      const output = this.images.map((img, i) => ({
        contentType: img.type,
        type: 'image',
        size: img.size,
        url: urls[i],
        name: img.name,
      }));
      this.$emit('selected', output);
      this.done();
    },
    done() {
      this.$emit('close');
    },
  },
};
</script>
<style scoped>
  .image-upload-modal-body
  {
    width: 100%;
  }
  .image-upload-modal-footer
  {
    margin-top: 10px;
    text-align: right;
  }
  .image-upload-modal-previews
  {
    margin-top: 10px;
    display: flex;
  }
  .image-upload-modal-preview
  {
    margin-right: 10px;
    margin-bottom: 10px;
  }
  .image-upload-modal-preview img
  {
    width: 80px;
    height: 80px;
    object-fit: cover;
  }

</style>
