<template>
  <div>
    <div v-if="posts">
      <app-news-list :posts="posts"></app-news-list>
      <app-infinite-simple
        :query="$apollo.queries.posts"
        sort-key="createdAt"
      ></app-infinite-simple>
    </div>
    <app-spinner v-if="!posts"></app-spinner>
  </div>
</template>

<script>
import ListNewsByCategory from '@/gql/news/ListNews.gql';
import AppNewsList from '@/components/news/NewsList.vue';
import AppSpinner from '@/components/general/Spinner.vue';
import AppInfiniteSimple from '@/components/general/InfiniteSimple.vue';

export default {
  components: {
    AppNewsList,
    AppSpinner,
    AppInfiniteSimple,
  },
  props: {
    category: {
      type: String,
      required: true,
    },
  },
  apollo: {
    posts: {
      query: ListNewsByCategory,
      variables() {
        return {
          category: this.category,
        };
      },
    },
  },
};
</script>
