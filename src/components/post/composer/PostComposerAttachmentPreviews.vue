<template>
  <div class="">
    <app-post-attachment
      v-if="value.video"
      :attachment="value.video"
      @remove="removeVideo"
    ></app-post-attachment>
    <app-post-attachment
      v-if="value.document"
      :attachment="value.document"
      @remove="removeDocument"
    ></app-post-attachment>
    <app-post-attachment
      v-if="value.images && value.images.length"
      :attached-image="value.images"
      @remove="removeImage"
    ></app-post-attachment>
  </div>
</template>

<script>
import AppPostAttachment from '@/components/general/Attachments.vue';

export default {
  components: {
    AppPostAttachment,
  },
  props: {
    value: {
      type: Object,
      required: true,
    },
  },
  methods: {
    removeVideo() {
      this.$emit('input', { ...this.value, video: null });
    },
    removeDocument() {
      this.$emit('input', { ...this.value, document: null });
    },
    removeImage($event) {
      const images = this.value.images.filter((image) => $event !== image);
      this.$emit('input', { ...this.value, images });
    },
  },
};
</script>

<style scoped></style>
