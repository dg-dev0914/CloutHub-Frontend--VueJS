<template>
  <app-group-page>
    <groups-page-sub-header
      search-route="MyGroupsSearch"
      page-name="MyGroupsList"
    />
    <router-view :key="$route.fullPath" />
  </app-group-page>
</template>

<script>
import AppGroupPage from '@/components/groups/GroupPage.vue';
import GroupsPageSubHeader from '@/components/groups/GroupsPageSubHeader.vue';

export default {
  components: {
    GroupsPageSubHeader,
    AppGroupPage,
  },
};
</script>
