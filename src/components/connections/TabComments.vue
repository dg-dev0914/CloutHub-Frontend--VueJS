<template>
  <div>
    <app-spinner v-if="!comments"></app-spinner>
    <div v-if="comments">
      <app-user-comment
        v-for="comment in comments"
        :key="comment.id"
        class="ch-profile-comment-list"
        :comment="comment"
        :user="user"
      />
    </div>
    <cs-empty-state
      v-if="comments && comments.length === 0"
      description="No Comments to display"
    />
    <app-infinite-simple
      :query="$apollo.queries.comments"
      sort-key="createdAt"
    ></app-infinite-simple>
  </div>
</template>

<script>
import ListUserComments from '@/gql/connections/ListUserComments.gql';
import AppUserComment from '@/components/connections/UserComment.vue';
import AppInfiniteSimple from '@/components/general/InfiniteSimple.vue';
import AppSpinner from '@/components/general/Spinner.vue';

export default {
  components: {
    AppUserComment,
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
    comments: {
      query: ListUserComments,
      variables() {
        return {
          id: this.user.id,
        };
      },
    },
  },
};
</script>

<style scoped>
.ch-profile-comment-list {
  margin: 10px 0;
}
.ch-profile-comment-list:first-child {
  margin-top: 0;
}
</style>
