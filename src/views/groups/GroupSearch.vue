<template>
  <app-group-page>
    <groups-page-sub-header page-name="GroupSearch" />
    <app-group-list
      :groups-query="searchGroupsQuery"
      :query-variables="searchVariables"
      query-field-name="find_groups"
      hide-item-menu
      two-columns
    >
      <template #no-results>
        <div>No Results</div>
      </template>
    </app-group-list>
  </app-group-page>
</template>

<script>
import GroupSearch from '@/gql/search/GroupSearch.gql';
import AppGroupPage from '@/components/groups/GroupPage.vue';
import AppGroupList from '@/components/groups/GroupList.vue';
import GroupsPageSubHeader from '@/components/groups/GroupsPageSubHeader.vue';

export default {
  components: {
    AppGroupPage,
    AppGroupList,
    GroupsPageSubHeader,
  },
  props: {
    query: {
      type: String,
      required: true,
    },
    groupsQuery: {
      type: Object,
      default: () => GroupSearch,
    },
  },
  data() {
    return {
      searchGroupsQuery: this.groupsQuery,
      searchVariables: {
        query: this.query,
      },
    };
  },
};
</script>
