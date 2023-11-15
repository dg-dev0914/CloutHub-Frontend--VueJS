<template>
  <span>
    <span @click="openUploadVideoModal">
      <slot/>
    </span>
    <app-create-video-modal v-if="loadModal" :show="showModal" @close="closeUploadVideoModal" @published="handlePublish"></app-create-video-modal>
  </span>
</template>

<script>
import AppCreateVideoModal from '@/components/video/CreateVideoModal.vue';

export default {
  components: {
    AppCreateVideoModal,
  },
  data() {
    return {
      loadModal: false,
      showModal: false,
    };
  },
  methods: {
    async openUploadVideoModal() {
      this.loadModal = true;
      await this.$nextTick();
      this.showModal = true;
    },
    async closeUploadVideoModal() {
      this.showModal = false;
      await this.$nextTick();
      setTimeout(() => {
        this.loadModal = false;
      }, 300);
    },
    handlePublish(video) {
      this.$router.push({ name: 'VideoDetail', params: video });
    },
  },
};
</script>
