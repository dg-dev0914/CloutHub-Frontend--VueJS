<template>
  <div class="attachment-popup">
    <b-popover
      ref="attachmentPopover"
      :target="target"
      :placement="placement"
      :triggers="triggers"
    >
      <div class="attachment-popup__list">
        <div
          class="attachment-popup__list-option"
          @click="onOptionClick('image/*')"
        >
          <i class="ch-icons-add-media list-icons"></i><span>Image</span>
        </div>
        <div class="attachment-popup__list-option" @click="onOptionGIF">
          <i class="ch-icons-gif list-icons"></i><span>GIF</span>
        </div>
        <div
          class="attachment-popup__list-option"
          @click="onOptionClick('video/*')"
        >
          <i class="cs-icons-video-file list-icons"></i><span>Video</span>
        </div>
        <div
          class="attachment-popup__list-option"
          @click="onOptionClick('conversation/pdf')"
        >
          <i class="cs-icons-pdf attachment-popup__list-icons"></i
          ><span>PDF</span>
        </div>
      </div>
    </b-popover>
  </div>
</template>

<script>
export default {
  props: {
    show: Boolean,
    placement: {
      type: String,
      required: false,
      default: 'top',
    },
    triggers: {
      type: String,
      required: false,
      default: 'click blur',
    },
    target: {
      type: String,
      required: true,
    },
  },
  methods: {
    closeAttachPopover() {
      this.$refs.attachmentPopover.$emit('close');
    },
    onOptionClick(type) {
      this.$emit('attach', type);
      this.closeAttachPopover();
    },
    onOptionGIF() {
      this.$emit('open');
      this.closeAttachPopover();
    },
  },
};
</script>

<style scoped>
.attachment-popup__list > * {
  cursor: pointer;
}
.attachment-popup__list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 16px;
  color: var(--cs-gray-05);
}
.attachment-popup__list-option {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
}
.attachment-popup__list-icons {
  font-size: 20px;
}
</style>
