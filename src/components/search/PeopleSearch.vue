<template>
  <div class="ch-profile__card">
    <div class="mb-2 cs-textstyle-item-heading capitalize">People</div>
    <div v-if="users && users.length">
      <!-- <div class="row"> -->
      <app-user-card
        itemClass="row"
        v-for="user in users"
        :key="user.id"
        :user="user"
      />
      <!-- </div> -->
      <cs-button
        fill="outline"
        size="small"
        v-if="mayHaveMore && !$apollo.queries.users.loading"
        @click="loadMore"
      >
        More people
      </cs-button>
    </div>
    <app-spinner v-if="$apollo.queries.users.loading" />
    <cs-empty-state v-if="showEmptyState" title="No matching people" />
  </div>
</template>

<script>
import UserSearch from '@/gql/search/UserSearch.gql';
import AppUserCard from '@/components/connections/UserCard.vue';
import AppSpinner from '@/components/general/Spinner.vue';
import AppInfiniteLoader from '@/components/general/InfiniteLoader.vue';

export default {
  components: {
    AppUserCard,
    AppSpinner,
    AppInfiniteLoader,
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
          limit: 3,
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
      const offset = this.users.length;
      this.$apollo.queries.users.fetchMore({
        variables: {
          offset,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          this.mayHaveMore = !!fetchMoreResult.users.length;
          return {
            users: [...previousResult.users, ...fetchMoreResult.users],
          };
        },
      });
    },
  },
  computed: {
    showEmptyState() {
      if (!this.users || !this.users.length) return true;
      return false;
    },
  },
};
</script>
