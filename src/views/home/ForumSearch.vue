<template>
  <div>
    <app-spinner v-if="!posts" />
    <div v-if="posts">
      <app-post-card v-for="post in posts" :key="post.id" :post="post" />
    </div>
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
        };
      },
    },
  },
};
</script>
