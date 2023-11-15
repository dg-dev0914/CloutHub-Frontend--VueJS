<template>
  <app-group-list
    two-columns
    query-field-name="list_category_groups"
    hide-item-menu
    :groups-query="ListCategoryGroups"
    :query-variables="queryVariables"
  />
</template>

<script>
// GQL
import ListCategoryGroups from '@/gql/groups/ListCategoryGroups.gql';

import AppGroupList from '@/components/groups/GroupList.vue';

export default {
  components: {
    AppGroupList,
  },
  props: {
    category: {
      type: String,
      required: true,
      default: '',
    },
  },
  data() {
    return {
      ListCategoryGroups,
      queryVariables: {
        category: this.category,
        before: new Date(),
      },
    };
  },
};
</script>
