<template>
  <div>
    <div class="mb-2 cs-textstyle-item-heading">
      Video
    </div>
    <div v-if="posts">
      <app-video-list itemClass="row" :videos="posts"></app-video-list>
      <cs-button
        fill="outline"
        size="small"
        v-if="mayHaveMore && !$apollo.queries.posts.loading && posts.length"
        @click="loadMore"
      >
      More videos
      </cs-button>
    </div>
    <app-spinner v-if="$apollo.queries.posts.loading"/>
  </div>
</template>
<script>
import PostSearchByType from '@/gql/search/PostSearchByType.gql';
import AppVideoList from '@/components/video/VideoList.vue';
import AppSpinner from '@/components/general/Spinner.vue';

export default {
  components: {
    AppVideoList,
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
      query: PostSearchByType,
      variables() {
        return {
          type: 'video',
          query: this.query,
          limit: 3
        };
      },
    },
  },
  data() {
    return {
      mayHaveMore: true,
    };
  },
  methods: {
    loadMore() {   
      const offset = this.posts.length      
      this.$apollo.queries.posts.fetchMore({
        variables: {
          offset,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {            
          this.mayHaveMore = !!(fetchMoreResult.posts.length);
          return {
            posts: [...previousResult.posts, ...fetchMoreResult.posts],
          };
        },
      });
    }
  },
  computed: {
    searchedPosts() {
      const safePost = this.posts.filter(post => post.safe)      
      if(safePost.length < 3) this.loadMore()
      else return safePost;
    },
    showEmptyState() {
      if (!this.posts || !this.posts.length) return true;
      return false;
    },
  },
};
</script>
