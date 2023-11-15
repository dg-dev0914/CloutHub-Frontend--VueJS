<template>
  <div>
    <app-connections-quick-find />
    <app-spinner v-if="isLoading" />
    <div v-else-if="$route.params.view === 'recommended'" class="row">
      <app-user-card
        v-for="user in filteredPeople"
        :key="user.id"
        :user="user"
      />
    </div>
    <div v-else class="row">
      <app-user-card
        v-for="user in filteredPeople"
        :key="user.id"
        :user="user"
      />
      <app-infinite-offset :query="$apollo.queries.people" />
    </div>
  </div>
</template>

<script>
import AppUserCard from '@/components/connections/UserCard.vue';
import AppSpinner from '@/components/general/Spinner.vue';
import AppInfiniteOffset from '@/components/general/InfiniteOffset.vue';
import AppConnectionsQuickFind from '@/components/general/ConnectionsQuickFind.vue';

import ListRecommendedUsers from '@/gql/connections/RecommendedUsers.gql';
import ListFollowers from '@/gql/connections/ListFollowers.gql';
import ListFollowing from '@/gql/connections/ListFollowing.gql';
import ListFriends from '@/gql/connections/ListFriends.gql';

const viewSettings = {
  recommended: {
    title: 'You Should Meet',
    query: ListRecommendedUsers,
  },
  friends: {
    title: 'Your Friends',
    query: ListFriends,
  },
  following: {
    title: 'People You Follow',
    query: ListFollowing,
  },
  followers: {
    title: 'Following You',
    query: ListFollowers,
  },
};

export default {
  apollo: {
    people: {
      fetchPolicy: 'cache-only',
      query() {
        return this.currentView.query;
      },
    },
  },
  components: {
    AppUserCard,
    AppSpinner,
    AppInfiniteOffset,
    AppConnectionsQuickFind,
  },
  data() {
    return {
      loading: false,
      people: [],
    };
  },
  computed: {
    currentView() {
      return viewSettings[this.$route.params.view];
    },
    filteredPeople() {
      if (this.$route.params.view === 'recommended') {
        return (
          this.people &&
          this.people.filter(
            (person) =>
              !person.myRelationship.isBlocked &&
              !person.myRelationship.isFollower
          )
        );
      }
      return this.people.filter((person) => !person.myRelationship.isBlocked);
    },
    isLoading() {
      return this.loading;
    },
  },
  async mounted() {
    this.loading = true;
    await this.$apollo.queries.people.refetch();
    this.loading = false;
  },
};
</script>
