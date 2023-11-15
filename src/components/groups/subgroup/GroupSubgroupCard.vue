<template lang="html">
  <div class="sidebar-card">
    <div class="card-header cs-textstyle-paragraph-bold">
      <cs-search-bar
        v-model="searchQuery"
        icon="ch-icons-search"
        placeholder="Search for Subgroups"
        class="group-subgroups-card__search-bar"
      ></cs-search-bar>
    </div>
    <div class="card-content">
      <app-group-subgroup-list
        :groups="groupsDisplayed"
        item-class="col-md-12"
      />

      <div v-if="subgroups && subgroups.length === 0">
        This group doesn't have a subgroup
      </div>
      <div v-else-if="groupsDisplayed.length === 0">No matching subgroups!</div>
    </div>
  </div>
</template>

<script>
// GQL
import ListSubgroupsByGroupId from '@/gql/groups/ListSubgroupsByGroupId.gql';

// Group subgroup components
import AppGroupSubgroupList from '@/components/groups/subgroup/GroupSubgroupList.vue';

export default {
  components: {
    AppGroupSubgroupList,
  },
  props: {
    groupId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      searchQuery: '',
    };
  },
  apollo: {
    subgroups: {
      query: ListSubgroupsByGroupId,
      variables() {
        return {
          parentGroupId: this.groupId,
        };
      },
      update: (data) => data.groups,
    },
  },
  computed: {
    groupsDisplayed() {
      if (!this.subgroups) return [];
      return this.subgroups
        .filter((group) =>
          group.name
            .toLowerCase()
            .trim()
            .includes(this.searchQuery.toLowerCase().trim())
        )
        .slice()
        .sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1));
    },
  },
};
</script>

<style lang="css" scoped>
.sidebar-card {
  margin-bottom: 20px;
  border-radius: 5px;
  box-shadow: 0px 3px 6px #0000000d;
}
.sidebar-card .card-header {
  color: var(--cs-gray-06);
  background-color: var(--cs-gray-00);
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
}
.group-subgroups-card__search-bar {
  width: 100%;
}
</style>
