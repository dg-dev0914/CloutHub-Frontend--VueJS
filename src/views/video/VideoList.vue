<template>
  <div>
    <app-video-list
      v-if="displayVideos"
      :videos="displayVideos"
      :placeholder="currentView.placeholder"
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
  </div>
</template>

<script>
import AppVideoList from '@/components/video/VideoList.vue';
import AppInfiniteSimple from '@/components/general/InfiniteSimple.vue';
import AppInfiniteOffset from '@/components/general/InfiniteOffset.vue';

import ListRecentVideos from '@/gql/videos/ListRecentVideos.gql';
import ListWatchedVideos from '@/gql/videos/ListWatchedVideos.gql';
import ListBookmarkedVideos from '@/gql/videos/ListBookmarkedVideos.gql';
import ListQueuedVideos from '@/gql/videos/ListQueuedVideos.gql';
import ListLiveVideos from '@/gql/videos/ListLiveVideos.gql';
import getScheduledStreams from '@/gql/posts/ScheduleGetSchedule.gql';

const viewSettings = {
  latest: {
    title: 'Latest Videos',
    query: ListRecentVideos,
    timePagination: true,
  },
  history: {
    title: 'Recently Watched',
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
    title: 'Watch Later',
    query: ListQueuedVideos,
    placeholder: "You haven't added any videos to your queue yet.",
    offsetPagination: true,
  },
  liveVideos: {
    title: 'Live videos',
    query: ListLiveVideos,
    placeholder: 'No live videos available',
    timePagination: true,
  },
  upcoming: {
    title: 'Upcoming',
    query: getScheduledStreams,
    placeholder: 'No ppcoming events available',
    timePagination: true,
  },
};

export default {
  components: {
    AppVideoList,
    AppInfiniteSimple,
    AppInfiniteOffset,
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
    },
  },
};
</script>
<style scoped></style>
