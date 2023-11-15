<template>
  <div>
    <div class="mb-2 cs-textstyle-item-heading">Posts</div>
    <cs-empty-state
      v-if="showEmptyState"
      title="No matching posts"
      class="cs-textstyle-detail-heading"
    />
    <div v-if="posts && posts.length">
      <app-post-card v-for="post in posts" :key="post.id" :post="post" />
      <cs-button
        fill="outline"
        size="small"
        v-if="mayHaveMore && !$apollo.queries.posts.loading && posts && posts.length"
        @click="loadMore"
      >
      More posts
      </cs-button>
    </div>
    
    <app-spinner v-if="$apollo.queries.posts.loading"/>
  </div>
</template>
<script>
import PostSearch from '@/gql/search/PostSearch.gql';
import AppPostCard from '@/components/post/items/PostCard.vue';
import AppSpinner from '@/components/general/Spinner.vue';

export default {
  components: {
    AppPostCard,
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
      query: PostSearch,
      variables() {
        return {
          query: this.query,
          limit: 3
        };
      },
    },
  },
  data() {
    return {
      mayHaveMore: true,
      fetchaa: false
    };
  },
  methods: {
    loadMore() { 
      this.fetchaa = true
      const offset = this.posts.length            
      this.$apollo.queries.posts.fetchMore({
        variables: {
          offset,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {            
          this.mayHaveMore = !!(fetchMoreResult.posts.length);                    
          return {
            posts: [...previousResult.posts, ...fetchMoreResult.posts]
          };
        },
      });      
    }
  },
  computed: {
    showEmptyState() {
      if (!this.posts || !this.posts.length) return true;
      return false;
    },
  },
};
</script>
