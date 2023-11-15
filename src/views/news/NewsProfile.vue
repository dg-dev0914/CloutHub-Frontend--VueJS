<template>
  <div class="news-profile">
    <app-spinner v-if="!user" />
    <div v-if="user">
      <app-profile-header :user="user" is-news />
    </div>
    <div v-if="posts" class="news-items">
      <app-news-list :posts="posts" />
      <app-infinite-simple
        :query="$apollo.queries.posts"
        sort-key="createdAt"
      ></app-infinite-simple>
    </div>
  </div>
</template>

<script>
import AppProfileHeader from '@/components/connections/ProfileHeader.vue';
import GetProfile from '@/gql/general/GetProfile.gql';
import UserNews from '@/gql/news/UserNews.gql';
import AppNewsList from '@/components/news/NewsList.vue';
import AppSpinner from '@/components/general/Spinner.vue';
import AppInfiniteSimple from '@/components/general/InfiniteSimple.vue';

export default {
  components: {
    AppProfileHeader,
    AppNewsList,
    AppSpinner,
    AppInfiniteSimple,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  apollo: {
    user: {
      query: GetProfile,
      variables() {
        return {
          id: this.id,
        };
      },
    },
    posts: {
      query: UserNews,
      variables() {
        return {
          userId: this.id,
        };
      },
    },
  },
};
</script>
<style scoped>
.news-profile {
  margin-top: 8px;
}
.news-items {
  padding: 5px 6px;
}
</style>
