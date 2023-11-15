<template>
  <div>
    <app-header-segment :title="title" button="View More" @action="viewAll" />
    <app-video-list
      :videos="displayVideos"
      item-class="col-md-6"
      :placeholder="placeholder"
    />
  </div>
</template>
<script>
import AppVideoList from '@/components/video/VideoList.vue';
import AppHeaderSegment from '@/components/general/HeaderSegment.vue';

export default {
  props: {
    title: {
      type: String,
      required: true,
      default: 'Untitled Segment',
    },
    placeholder: {
      type: String,
      required: false,
    },
    query: {
      type: Object,
      required: true,
    },
    count: {
      type: Number,
      required: false,
      default: 6,
    },
    to: {
      type: Object,
    },
  },
  components: {
    AppVideoList,
    AppHeaderSegment,
  },
  apollo: {
    videos: {
      query() {
        return this.query;
      },
    },
  },
  computed: {
    displayVideos() {
      if (!this.videos) return [];
      return (
        this.videos &&
        this.videos.slice(0, this.count)
      );
    },
  },
  methods: {
    viewAll() {
      this.$router.push(this.to);
    },
  },
};
</script>
