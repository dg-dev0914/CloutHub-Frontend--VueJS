<template>
  <div>
    <div v-if="posts" class="ch-tag-post-list">
      <app-post-card v-for="post in posts" :key="post.id" :post="post" />
    </div>
  </div>
</template>

<script>
// Js files
import $auth from '@/services/auth';
//  Graphql files
import ListTagPosts from '@/gql/posts/ListTagPosts.gql';
// Components files
import AppPostCard from '@/components/post/items/PostCard.vue';

export default {
  components: {
    AppPostCard,
  },
  props: {
    tag: {
      type: String,
      required: true,
    },
  },
  apollo: {
    posts: {
      query: ListTagPosts,
      variables() {
        return {
          tag: this.tag,
          viewerId: $auth.getUserId(),
        };
      },
    },
  },
};
</script>
