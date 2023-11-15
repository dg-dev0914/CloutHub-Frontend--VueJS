<template>
  <div>
    <div v-if="isMyNews">
      <app-my-news :publishers="users" />
    </div>
    <div v-else>
      <div v-if="posts" class="news-list">
        <app-news-list
          :posts="posts"
          :empty-state="currentView.title"
          :is-latest-news="isLatestNews"
          item-class="col-md-12"
        ></app-news-list>
        <app-infinite-simple
          v-if="isLatestNews"
          :query="$apollo.queries.posts"
          sort-key="createdAt"
        ></app-infinite-simple>
        <app-infinite-offset
          v-else
          :query="$apollo.queries.posts"
          sort-key="createdAt"
        ></app-infinite-offset>
      </div>
    </div>
  </div>
</template>

<script>
import AppNewsList from '@/components/news/NewsList.vue';
import AppMyNews from '@/components/news/MyNews.vue';
import AppInfiniteSimple from '@/components/general/InfiniteSimple.vue';
import ListNewsLatest from '@/gql/news/ListNewsLatest.gql';
import ListNewsBookmarked from '@/gql/news/ListNewsBookmarked.gql';
import ListNewsHistory from '@/gql/news/ListNewsHistory.gql';
import ListNewsQueued from '@/gql/news/ListNewsQueued.gql';
import ListFollowingPublishers from '@/gql/news/ListFollowingPublishers.gql';
import AppInfiniteOffset from '@/components/general/InfiniteOffset.vue';

const viewSettings = {
  latest: {
    title: 'Latest News',
    query: ListNewsLatest,
  },
  bookmarked: {
    title: 'Bookmarked Articles',
    query: ListNewsBookmarked,
  },
  following: {
    title: 'News You Follow',
    query: ListFollowingPublishers,
  },
  history: {
    title: 'Recently Read',
    query: ListNewsHistory,
  },
  queue: {
    title: 'Read Later',
    query: ListNewsQueued,
  },
  find: {
    // title: 'Find',
    // query: '',
  },
};

export default {
  components: {
    AppNewsList,
    AppMyNews,
    AppInfiniteSimple,
    AppInfiniteOffset,
  },
  computed: {
    currentView() {
      return viewSettings[this.$route.params.view];
    },
    isMyNews() {
      return this.$route.params.view === 'following';
    },
    isLatestNews() {
      return this.$route.params.view === 'latest';
    },
  },
  apollo: {
    posts: {
      query() {
        return this.currentView.query;
      },
      skip() {
        return this.$route.params.view === 'following';
      },
    },
    users: {
      query() {
        return this.currentView.query;
      },
      skip() {
        return this.$route.params.view !== 'following';
      },
    },
  },
  async mounted() {
    await this.$apollo.queries.users.refetch();
  },
};
</script>
<style scoped>
.news-list {
  padding: 5px 0px 5px 11px;
}
</style>
