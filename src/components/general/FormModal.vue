<template>
  <app-modal
    v-bind="$attrs"
    :hide-close="saving"
    :with-closing-alert="withClosingAlert"
    @close="$emit('close')"
  >
    <slot />
    <slot v-if="$slots.footer" slot="footer" name="footer" />
    <div v-if="saving" class="ch-modal-form__overlay">
      <app-spinner class="spinner" />
      <div class="label">
        <span
          v-if="progressLabel"
          class="ch-modal-form__overlay-progress cs-textstyle-paragraph-bold"
          >{{ progressLabel }}</span
        >
        <app-aws-progress
          v-show="showProgress"
          class="ch-modal-form__overlay-progress cs-textstyle-paragraph-bold"
          @progress="onProgress"
          @done="onDoneUploading"
        />
      </div>
    </div>
  </app-modal>
</template>

<script>
import AppModal from '@/components/general/Modal.vue';
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
    AppModal,
    AppSpinner,
    AppAwsProgress,
  },
  props: {
    saving: {
      type: Boolean,
      default: false,
    },
    withClosingAlert: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showProgress: false,
      progressLabel: null,
    };
  },
  watch: {
    progressLabel() {
      this.showProgress = false;
    },
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
};
</script>

<style lang="css" scoped>
.ch-modal-form__overlay::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--cs-gray-06);
  opacity: 0.6;
}
.ch-modal-form__overlay {
  border-radius: 15px;
  overflow: hidden;
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
}
.label {
  z-index: 10;
}
</style>
