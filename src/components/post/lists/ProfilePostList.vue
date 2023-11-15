<template>
  <div>
    <app-spinner v-if="!posts"></app-spinner>
    <!-- Post list view -->
    <div v-if="posts" class="ch-profile-post-list">
      <app-post-card v-for="post in posts" :key="post.id" :post="post" />
    </div>
    <!-- Infinite post loader -->
    <app-infinite-simple
      :query="$apollo.queries.posts"
      sort-key="createdAt"
    ></app-infinite-simple>
    <!-- Empty Post List view -->
    <cs-empty-state
      v-if="posts && posts.length === 0"
      description="No Posts to display"
    />
  </div>
</template>

<script>
// Js files
import $auth from '@/services/auth';
//  Graphql files
import ListUserPosts from '@/gql/posts/ListUserPosts.gql';
// Components files
import AppPostCard from '@/components/post/items/PostCard.vue';
import AppInfiniteSimple from '@/components/general/InfiniteSimple.vue';
import AppSpinner from '@/components/general/Spinner.vue';

export default {
  components: {
    AppPostCard,
    AppInfiniteSimple,
    AppSpinner,
  },
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  apollo: {
    posts: {
      query: ListUserPosts,
      variables() {
        return {
          id: this.user.id,
        };
      },
    },
  },
  data() {
    return {
      mayHaveMore: true,
    };
  },
};
</script>
