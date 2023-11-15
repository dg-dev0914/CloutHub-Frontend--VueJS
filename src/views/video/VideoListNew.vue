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
import $auth from '@/services/auth';
import AppVideoList from '@/components/video/VideoList.vue';
import AppInfiniteSimple from '@/components/general/InfiniteSimple.vue';
import AppInfiniteOffset from '@/components/general/InfiniteOffset.vue';

import ListRecentVideos from '@/gql/videos/ListRecentVideos.gql';
import ListWatchedVideos from '@/gql/videos/ListWatchedVideos.gql';
import ListBookmarkedVideos from '@/gql/videos/ListBookmarkedVideos.gql';
import ListQueuedVideos from '@/gql/videos/ListQueuedVideos.gql';
import ListLiveVideos from '@/gql/videos/ListLiveVideos.gql';

// Public versions
import ListRecentVideosPublic from '@/gql/videos/PublicListRecentVideos.gql';
import ListLiveVideosPublic from '@/gql/videos/PublicListLiveVideos.gql';

export default {
  components: {
    AppVideoList,
    AppInfiniteSimple,
    AppInfiniteOffset,
  },
  data() {
    return {
      isLoggedIn: false,
    };
  },
  async created() {
    this.isLoggedIn = await $auth.isLoggedInAsUser();
  },
  props: {
    view: {
      type: String,
      required: true,
    },
  },
  computed: {
    viewSettings() {
      return {
        latest: {
          title: 'Latest Videos',
          query: this.isLoggedIn ? ListRecentVideos : ListRecentVideosPublic,
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
          query: this.isLoggedIn ? ListLiveVideos : ListLiveVideosPublic,
          placeholder: 'No live videos available',
          timePagination: true,
        },
      };
    },
    currentView() {
      return this.viewSettings[this.$route.params.view];
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
