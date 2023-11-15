<template>
  <div class="ch-upload-progress ch-upload-progress__overlay">
    <app-spinner/>
    <div>
      <span v-if="progressLabel" class="ch-modal-form__overlay-progress cs-textstyle-paragraph-bold">{{ progressLabel }}</span>
      <app-aws-progress v-show="showProgress" @progress="onProgress" @done="onDoneUploading" class="ch-modal-form__overlay-progress cs-textstyle-paragraph-bold" />
    </div>
  </div>
</template>

<script>
import AppSpinner from '@/components/general/Spinner.vue';
import AppAwsProgress from '@/components/general/AwsProgress.vue';

const typeLabels = {
  image: 'Image',
  video: 'Video',
  document: 'Document',
  default: 'File',
};

export default {
  components: {
    AppSpinner,
    AppAwsProgress,
  },
  data() {
    return {
      showProgress: false,
      progressLabel: null,
    };
  },
  methods: {
    onProgress($event) {
      this.showProgress = true;
      const filetype = $event.type ? $event.type.split('/')[0] : 'default';
      const label = typeLabels[filetype] || typeLabels.default;
      let plural = $event.multiple ? 's' : '';
      // Currently CreateVideoModal uploads image at the same time as video so it says "Videos"
      if (filetype === 'video') plural = '';
      this.progressLabel = `Uploading ${label}${plural}`;
    },
    onDoneUploading() {
      this.showProgress = false;
      this.progressLabel = 'Saving';
    },
  },
  watch: {
    progressLabel() {
      this.showProgress = false;
    },
  },
};
</script>

<style scoped>
.ch-upload-progress__overlay::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--cs-gray-00);
  opacity: 0.4;
}
.ch-upload-progress__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  color: var(--cs-gray-07);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1;
}
</style>
