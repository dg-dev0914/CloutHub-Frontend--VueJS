<template>
  <div>
    <app-spinner v-if="!videos"></app-spinner>
    <b-row v-if="videos">
      <div
        v-for="video in safeVideos"
        :key="video.id"
        class="video-card-wrapper"
        :class="itemClass"
      >
        <app-video-item :video="video" :view="view"></app-video-item>
      </div>
      <cs-empty-state
        v-if="!videos.length"
        :title="placeholder"
        class="empty-state-border"
      >
      </cs-empty-state>
    </b-row>
  </div>
</template>
<script>
import AppSpinner from '@/components/general/Spinner.vue';
import AppVideoItem from '@/components/video/new/VideoItemMini.vue';

export default {
  components: {
    AppVideoItem,
    AppSpinner,
  },
  props: {
    videos: {
      type: Array,
      required: true,
    },
    itemClass: {
      type: String,
      default: 'col-md-6',
    },
    placeholder: {
      type: String,
      default: 'No matching videos',
    },
    view: {
      type: String,
      required: false,
      default: '',
    },
  },
  computed: {
    safeVideos() {
      return this.videos
        .filter((video) => video.safe)
        .filter((video) => video.user);
    },
  },
};
</script>
<style scoped>
.video-card-wrapper {
  padding: 10px;
  padding-top: 0px;
}
.empty-state-border {
  border: dashed 1px var(--cs-gray-02);
  border-radius: 10px;
}
</style>
