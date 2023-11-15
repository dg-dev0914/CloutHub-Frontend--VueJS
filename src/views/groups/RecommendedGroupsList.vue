<template>
  <app-group-page>
    <groups-page-sub-header page-name="RecommendedGroupsList" />
    <div class="group-list-head">
      <h2 class="group-list-title">Recommended for You</h2>
      <p class="group-list-subtitle">Groups you might be interested in.</p>
    </div>
    <app-group-list
      two-columns
      query-field-name="list_recommended_groups"
      hide-item-menu
      :groups-query="ListRecommendedGroups"
    />
  </app-group-page>
</template>

<script>
import ListRecommendedGroups from '@/gql/groups/ListRecommendedGroups.gql';
import AppGroupPage from '@/components/groups/GroupPage.vue';
import AppGroupList from '@/components/groups/GroupList.vue';
import GroupsPageSubHeader from '@/components/groups/GroupsPageSubHeader.vue';

export default {
  components: {
    AppGroupPage,
    AppGroupList,
    GroupsPageSubHeader,
  },
  data() {
    return {
      ListRecommendedGroups,
    };
  },
};
</script>

<style scoped>
.group-list-head {
  padding: 0 10px;
  margin: 10px 0;
}

.group-list-title {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #000;
}

.group-list-subtitle {
  margin: 0;
  font-size: 14px;
  font-weight: normal;
  color: #747576;
}
</style>
