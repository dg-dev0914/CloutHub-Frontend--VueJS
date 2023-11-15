<template>
  <div>
    <div class="mb-2 cs-textstyle-item-heading capitalize">Groups</div>

    <div v-if="groups && groups.length">
      <app-group-grid :groups="groups" />
      <cs-button
        fill="outline"
        size="small"
        v-if="mayHaveMore && !$apollo.queries.groups.loading"
        @click="loadMore"
      >
        More groups
      </cs-button>
    </div>
    <app-spinner v-if="$apollo.queries.groups.loading" />
    <cs-empty-state v-if="showEmptyState" title="No matching groups" />
  </div>
</template>

<script>
import GroupSearch from '@/gql/search/GroupSearch.gql';
import AppGroupGrid from '@/components/groups/GroupGrid.vue';
import AppSpinner from '@/components/general/Spinner.vue';

export default {
  components: {
    AppGroupGrid,
    AppSpinner,
  },
  props: {
    query: {
      type: String,
      required: true,
    },
  },
  apollo: {
    groups: {
      query: GroupSearch,
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
      const offset = this.groups.length;
      this.$apollo.queries.groups.fetchMore({
        variables: {
          offset,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          this.mayHaveMore = !!fetchMoreResult.groups.length;
          return {
            groups: [...previousResult.groups, ...fetchMoreResult.groups],
          };
        },
      });
    },
  },
  computed: {
    showEmptyState() {
      if (!this.groups || !this.groups.length) return true;
      return false;
    },
  },
};
</script>
