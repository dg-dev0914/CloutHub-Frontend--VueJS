<template>
  <div class="">
    <app-video-response :post="post"></app-video-response>
  </div>
</template>

<script>
import $auth from '@/services/auth';
import $bus from '@/services/bus';
import AppVideoResponse from '@/components/video/VideoResponse.vue';

export default {
  components: {
    AppVideoResponse,
  },
  props: {
    post: {
      type: Object,
      required: true,
    },
  },
  computed: {
    isAuthor() {
      return this.post && this.post.user.id === $auth.getUserId();
    },
  },
  methods: {
    report(type) {
      const reportData = {
        id: type === 'post' ? this.post.id : this.post.user.id,
        type,
      };
      $bus.$emit('show-report-modal', reportData);
    },
    blockAuthor() {
      $bus.$emit('block-user-modal', {
        user: this.post.user,
      });
    },
  },
};
</script>

<style scoped>
.video-info-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
.video-detail-share-icon {
  margin-right: 10px;
}
.options-icon {
  margin-left: 10px;
  cursor: pointer;
}
</style>
