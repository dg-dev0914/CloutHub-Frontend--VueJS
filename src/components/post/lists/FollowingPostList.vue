<template>
  <app-post-list :query="ListFollowingPosts" />
</template>

<script>
import ListFollowingPosts from '@/gql/posts/ListFollowingPosts.gql';

import AppPostList from './PostList.vue';

export default {
  components: {
    AppPostList,
  },
  data() {
    return {
      ListFollowingPosts,
    };
  },
};
</script>
