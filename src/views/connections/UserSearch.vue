<template>
  <div class="ch-profile__card">
    <div class="mb-2 cs-textstyle-item-heading capitalize">{{ query }}</div>
    <app-quick-find :initial-query="query" />
    <app-spinner v-if="!users" />
    <div v-if="users" class="row">
      <app-user-card v-for="user in users" :key="user.id" :user="user" />
      <app-infinite-loader
        :paused="$apollo.queries.users.loading"
        :finished="!mayHaveMore"
        @more="loadMore()"
      />
    </div>
    <cs-empty-state v-if="users && users.length === 0" description="No users" />
  </div>
</template>

<script>
import UserSearch from '@/gql/search/UserSearch.gql';
import AppUserCard from '@/components/connections/UserCard.vue';
import AppSpinner from '@/components/general/Spinner.vue';
import AppInfiniteLoader from '@/components/general/InfiniteLoader.vue';
import AppQuickFind from '@/components/general/QuickFind.vue';

export default {
  components: {
    AppUserCard,
    AppSpinner,
    AppInfiniteLoader,
    AppQuickFind,
  },
  props: {
    query: {
      type: String,
      required: true,
    },
  },
  apollo: {
    users: {
      query: UserSearch,
      variables() {
        return {
          query: this.query,
        };
      },
    },
  },
  data() {
    return {
      mayHaveMore: true,
    };
  },
  methods: {
    loadMore() {
      if (this.mayHaveMore) {
        this.mayHaveMore = false;
        const offset = this.users.length;
        this.$apollo.queries.users.fetchMore({
          variables: {
            query: this.query,
            offset,
          },
          updateQuery: (previousResult, { fetchMoreResult }) => {
            this.mayHaveMore = !!fetchMoreResult.users.length;
            return {
              users: [...previousResult.users, ...fetchMoreResult.users],
            };
          },
        });
      }
    },
  },
};
</script>
