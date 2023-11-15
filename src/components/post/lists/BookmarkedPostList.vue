<template>
  <div>
    <div v-if="posts" class="ch-tag-post-list">
      <app-post-card v-for="post in posts" :key="post.id" :post="post" />
    </div>
    <app-infinite-offset
      :query="$apollo.queries.posts"
      sort-key="createdAt"
    ></app-infinite-offset>
  </div>
</template>

<script>
//  Graphql files
import ListBookmarkedPosts from '@/gql/posts/ListBookmarkedPosts.gql';
// Components files
import AppPostCard from '@/components/post/items/PostCard.vue';
import AppInfiniteOffset from '@/components/general/InfiniteOffset.vue';

export default {
  components: {
    AppPostCard,
    AppInfiniteOffset,
  },
  apollo: {
    posts: {
      query: ListBookmarkedPosts,
    },
  },
};
</script>
