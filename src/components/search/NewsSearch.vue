<template>
  <div>
    <div class="mb-2 cs-textstyle-item-heading">News</div>
    <cs-empty-state
      v-if="showEmptyState"
      title="No matching news articles"
      class="cs-textstyle-detail-heading"
    />
    <app-news-list
      v-if="posts"
      :show-empty="false"
      :posts="posts"
      item-class="row"
    ></app-news-list>
    <app-spinner v-if="$apollo.queries.posts.loading" />
    <cs-button
      v-if="mayHaveMore && !$apollo.queries.posts.loading && posts.length"
      fill="outline"
      size="small"
      @click="loadMore"
    >
      More news
    </cs-button>
  </div>
</template>

<script>
import NewsArticleSearch from '@/gql/search/NewsArticleSearch.gql';
import AppNewsList from '@/components/news/NewsList.vue';
import AppSpinner from '@/components/general/Spinner.vue';

export default {
  components: {
    AppNewsList,
    AppSpinner,
  },
  props: {
    query: {
      type: String,
      required: true,
    },
  },
  apollo: {
    posts: {
      query: NewsArticleSearch,
      variables() {
        return {
          type: 'news',
          query: this.query,
          limit: 3,
        };
      },
    },
  },
  data() {
    return {
      mayHaveMore: true,
    };
  },
  computed: {
    searchedPosts() {
      if (this.posts) {
        const safePost = this.posts.filter((post) => post.safe);
        if (safePost.length < 3) this.loadMore();
        else return safePost;
      }
    },
    showEmptyState() {
      if (!this.posts || !this.posts.length) return true;
      return false;
    },
  },
  methods: {
    loadMore() {
      const offset = this.posts.length;
      this.$apollo.queries.posts.fetchMore({
        variables: {
          offset,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          this.mayHaveMore = !!fetchMoreResult.posts.length;
          return {
            posts: [...previousResult.posts, ...fetchMoreResult.posts],
          };
        },
      });
    },
  },
};
</script>

<style scoped>
* >>> .cursor-pointer {
  margin-bottom: 0.5rem !important;
}
</style>
