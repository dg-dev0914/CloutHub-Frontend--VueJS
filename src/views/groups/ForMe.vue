<template>
  <div>
    <app-group-page v-if="userHasGroups" class="app-group-page">
      <div class="for-me">
        <div class="for-me-post-list">
          <app-my-groups-post-list />
        </div>
        <div class="for-me-groups">
          <app-my-groups-card />
        </div>
      </div>
    </app-group-page>
    <app-recommended-groups-list v-else :with-search-bar="false" />
  </div>
</template>

<script>
import AppMyGroupsPostList from '@/components/post/lists/MyGroupsPostList.vue';
import AppGroupPage from '@/components/groups/GroupPage.vue';
import AppMyGroupsCard from '@/components/groups/MyGroupsCard.vue';

import ListJoinedGroups from '@/gql/groups/ListJoinedGroups.gql';
import AppRecommendedGroupsList from './RecommendedGroupsList.vue';

export default {
  components: {
    AppMyGroupsPostList,
    AppGroupPage,
    AppMyGroupsCard,
    AppRecommendedGroupsList,
  },
  computed: {
    userHasGroups() {
      return this.groups && this.groups.length;
    },
  },
  apollo: {
    groups: {
      query: ListJoinedGroups,
      variables: {
        limit: 1,
      },
      fetchPolicy: 'network-only',
    },
  },
};
</script>

<style scoped>
.app-group-page {
  background: transparent;
}

.app-group-page >>> .group-page-header {
  position: relative;
  background: #ffffff;
}

.app-group-page >>> .group-page-subheader {
  background: #ffffff;
}

.for-me {
  display: flex;
  margin: 10px 0;
}

.for-me-post-list {
  overflow: hidden;
  flex: 0 0 430px;
  margin-right: 10px;
}

.for-me-groups {
  flex: 1 1 auto;
  overflow: hidden;
}
</style>
