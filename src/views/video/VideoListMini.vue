<template>
  <div>
    <!-- <div class="mb-4 cs-textstyle-item-heading">{{ currentView.title }}</div> -->
    <b-row v-if="videos">
      <b-col md="8">
        <app-video-list
          :videos="displayVideos"
          :placeholder="currentView.placeholder"
          item-class="col-md-12"
          :view="$route.params.view"
        ></app-video-list>
        <app-infinite-simple
          v-if="currentView.timePagination"
          :query="$apollo.queries.videos"
          sort-key="createdAt"
        ></app-infinite-simple>
        <app-infinite-offset
          v-if="currentView.offsetPagination"
          :query="$apollo.queries.videos"
        ></app-infinite-offset>
      </b-col>
      <b-col md="4">
        <app-recommended-channel />
      </b-col>
    </b-row>
  </div>
</template>

<script>
import AppVideoList from '@/components/video/new/VideoListMini.vue';
import AppInfiniteSimple from '@/components/general/InfiniteSimple.vue';
import AppInfiniteOffset from '@/components/general/InfiniteOffset.vue';
import AppRecommendedChannel from '@/components/video/new/RecommendedChannel.vue';

import ListRecentVideos from '@/gql/videos/ListRecentVideos.gql';
import ListWatchedVideos from '@/gql/videos/ListWatchedVideos.gql';
import ListBookmarkedVideos from '@/gql/videos/ListBookmarkedVideos.gql';
import ListQueuedVideos from '@/gql/videos/ListQueuedVideos.gql';
import ListLiveVideos from '@/gql/videos/ListLiveVideos.gql';

const viewSettings = {
  latest: {
    title: 'Latest Videos',
    query: ListRecentVideos,
    timePagination: true,
  },
  history: {
    title: 'History',
    query: ListWatchedVideos,
    placeholder: "You haven't watched any videos yet.",
    offsetPagination: true,
  },
  bookmarked: {
    title: 'Bookmarked Videos',
    query: ListBookmarkedVideos,
    placeholder: "You haven't bookmarked any videos yet.",
    offsetPagination: true,
  },
  queue: {
    title: 'To Watch',
    query: ListQueuedVideos,
    placeholder: "You haven't added any videos to your queue yet.",
    offsetPagination: true,
  },
  liveVideos: {
    title: 'Live videos',
    query: ListLiveVideos,
    placeholder: 'No live videos available',
    offsetPagination: true,
  },
};

export default {
  components: {
    AppVideoList,
    AppInfiniteSimple,
    AppInfiniteOffset,
    AppRecommendedChannel,
  },
  props: {
    view: {
      type: String,
      required: true,
    },
  },
  computed: {
    currentView() {
      return viewSettings[this.$route.params.view];
    },
    displayVideos() {
      return this.videos && this.videos.filter((v) => !!v.user);
    },
  },
  apollo: {
    videos: {
      query() {
        return this.currentView.query;
      },
      skip() {
        return !this.currentView;
      },
    },
  },
};
</script>
<style scoped></style>
