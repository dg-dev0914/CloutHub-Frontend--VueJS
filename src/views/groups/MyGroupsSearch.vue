<template>
  <app-group-list
    :groups-query="groupsQuery"
    :query-variables="searchVariables"
    query-field-name="find_groups"
    hide-item-menu
    two-columns
  >
    <template #no-results>
      <div>No Results</div>
    </template>
  </app-group-list>
</template>

<script>
import MyGroupsSearch from '@/gql/search/MyGroupsSearch.gql';
import AppGroupList from '@/components/groups/GroupList.vue';

export default {
  components: {
    AppGroupList,
  },
  props: {
    query: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      groupsQuery: MyGroupsSearch,
      searchVariables: {
        query: this.query,
      },
    };
  },
};
</script>
