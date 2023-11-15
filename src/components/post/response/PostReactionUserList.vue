<template>
  <div>
    <div
      v-if="list_post_reactions && list_post_reactions.length"
      class="ch-user-list"
    >
      <app-user-list
        class="post-reaction-user-list__user-list"
        :users="reactionUsers"
      />
    </div>
    <cs-empty-state
      v-else-if="
        !$apollo.queries.list_post_reactions.loading &&
        list_post_reactions &&
        list_post_reactions.length === 0
      "
      description="No one has reacted to this post yet."
    />
    <app-infinite-simple
      :query="$apollo.queries.list_post_reactions"
      sort-key="createdAt"
    />
  </div>
</template>

<script>
import AppUserList from '@/components/general/UserList.vue';
import AppInfiniteSimple from '@/components/general/InfiniteSimple.vue';

import ListPostReactions from '@/gql/posts/ListPostReactions.gql';

const postTypes = [
  'pray',
  'like',
  'dislike',
  'smile',
  'laugh',
  'love',
  'cry',
  'angry',
  'block',
  'salute',
];

export default {
  components: {
    AppUserList,
    AppInfiniteSimple,
  },
  props: {
    post: {
      type: Object,
      required: true,
    },
    type: {
      type: String,
      default: null,
      validator(x) {
        return postTypes.indexOf(x) > -1;
      },
    },
  },
  apollo: {
    list_post_reactions: {
      query: ListPostReactions,
      variables() {
        return {
          id: this.post.id,
          type: this.type,
        };
      },
      fetchPolicy: 'network-only',
    },
  },
  computed: {
    reactionUsers() {
      return (
        this.list_post_reactions && this.list_post_reactions.map((r) => r.user)
      );
    },
  },
};
</script>

<style scoped>
.post-reaction-user-list__user-list {
  padding: 0;
}
</style>
