<template>
  <div ref="friendRequestList" class="requests-view">
    <div class="requests-header cs-textstyle-paragraph-bold">Requests</div>
    <cs-empty-state
      v-if="people && people.length === 0"
      title="Zero Requests"
      description="Hooray, you're all caught up with your friend requests!"
    >
      <cs-button :to="{ name: 'FriendsList' }">See Friends</cs-button>
    </cs-empty-state>
    <div v-if="people">
      <request-item v-for="user in people" :key="user.id" :user="user" />
      <app-infinite-offset :query="$apollo.queries.people" />
    </div>
  </div>
</template>

<script>
import RequestItem from '@/components/requests/RequestItem.vue';
import AppInfiniteOffset from '@/components/general/InfiniteOffset.vue';

import ListFriendRequests from '@/gql/connections/ListFriendRequests.gql';
import $auth from '@/services/auth';

export default {
  components: {
    RequestItem,
    AppInfiniteOffset,
  },
  apollo: {
    people: {
      query: ListFriendRequests,
      variables() {
        return {
          viewerId: $auth.getUserId(),
        };
      },
    },
  },
};
</script>

<style scoped>
.requests-view {
  background: white;
  border-radius: 5px;
  height: calc(100vh - 100px);
  overflow: auto;
}
.requests-header {
  padding: 10px;
  border-bottom: 1px solid #e6eaea;
}
</style>
