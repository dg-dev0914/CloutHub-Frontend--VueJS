<template>
  <app-post-list :query="ListMyGroupsPosts" />
</template>

<script>
import ListMyGroupsPosts from '@/gql/posts/ListMyGroupsPosts.gql';

import AppPostList from './PostList.vue';

export default {
  components: {
    AppPostList,
  },
  data() {
    return {
      ListMyGroupsPosts,
    };
  },
};
</script>
