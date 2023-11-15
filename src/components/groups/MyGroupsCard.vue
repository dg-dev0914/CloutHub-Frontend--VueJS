<template>
  <div v-if="groups && groups.length" class="my-groups-card">
    <h3 class="my-groups-card-title">My Groups</h3>
    <app-group-item
      v-for="group in groups"
      :key="group.id"
      :group="group"
      slim
      class="group-item"
    />
    <cs-button
      v-router-link="{ name: 'MyGroupsList' }"
      class="button-more"
      variant="default"
    >
      See More
    </cs-button>
  </div>
</template>

<script>
import ListJoinedGroups from '@/gql/groups/ListJoinedGroups.gql';

import AppGroupItem from './GroupItem.vue';

export default {
  components: {
    AppGroupItem,
  },
  apollo: {
    groups: {
      query: ListJoinedGroups,
      variables: {
        limit: 5,
      },
      fetchPolicy: 'network-only',
    },
  },
};
</script>

<style scoped>
.my-groups-card {
  padding: 10px;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.15);
  background: #ffffff;
}

.my-groups-card-title {
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: bold;
  color: #000;
}

.group-item {
  margin-bottom: 15px;
}

.cs-button.button-more {
  display: block;
  width: 100%;
  border-radius: 6px;
  background-color: #d8d8d8;
  border-color: #d8d8d8;
  font-size: 12px;
  font-weight: bold;
  color: #000;
}
</style>
