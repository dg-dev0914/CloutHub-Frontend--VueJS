<template>
  <div>
    <cs-spinner v-if="!post" />
    <div v-if="post">
      <app-post-card :post="post" :autoplay="true"></app-post-card>
    </div>
  </div>
</template>

<script>
import GetPost from '@/gql/posts/GetPost.gql';
import AppPostCard from '@/components/post/items/PostCard.vue';

export default {
  components: {
    AppPostCard,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  apollo: {
    post: {
      query: GetPost,
      variables() {
        return {
          id: this.id,
        };
      },
    },
  },
};
</script>
