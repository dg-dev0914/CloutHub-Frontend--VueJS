<template>
  <div>
    <div class="group-panel">
      <div class="group-column">
        <app-group-list
          :key="'groupsIManage'"
          title="Groups I Manage"
          :groups-query="ListManagedGroups"
          query-field-name="list_managed_groups"
        >
          <template #no-results>
            <div class="no-results">
              <h2 class="no-results-title">You don't own any group.</h2>
              <cs-button
                class="no-results-action"
                @click="showGroupEditor = true"
              >
                Create One
              </cs-button>
            </div>
          </template>
        </app-group-list>
      </div>
      <div class="group-column">
        <app-group-list
          :key="'groupsIJoined'"
          title="Groups I’ve Joined"
          :groups-query="ListJoinedGroups"
          query-field-name="list_joined_groups"
        >
          <template #no-results>
            <app-group-list
              :key="'recommendedGroups'"
              :groups-query="ListRecommendedGroups"
              query-field-name="list_recommended_groups"
              title="Recommended for You"
              hide-item-menu
            />
          </template>
        </app-group-list>
      </div>
    </div>

    <!-- Create group modal -->
    <app-group-editor-modal
      :show="showGroupEditor"
      @close="showGroupEditor = false"
    />
  </div>
</template>

<script>
import ListJoinedGroups from '@/gql/groups/ListJoinedGroups.gql';
import ListManagedGroups from '@/gql/groups/ListManagedGroups.gql';
import ListRecommendedGroups from '@/gql/groups/ListRecommendedGroups.gql';
import AppGroupList from '@/components/groups/GroupList.vue';
import AppGroupEditorModal from '@/components/groups/GroupEditorModal.vue';

export default {
  components: {
    AppGroupList,
    AppGroupEditorModal,
  },
  data() {
    return {
      ListJoinedGroups,
      ListManagedGroups,
      ListRecommendedGroups,
      showGroupEditor: false,
    };
  },
};
</script>

<style scoped>
.group-panel {
  display: flex;
  flex-direction: row;
}

.group-column {
  flex: 0 0 50%;
  overflow: hidden;
}

.group-column:not(:last-child) {
  border-right: 1px solid #e7eaea;
}

.no-results {
  padding: 25px 0;
  text-align: center;
}

.no-results-title {
  margin-bottom: 10px;
  font-size: 22px;
  font-weight: bold;
  color: #000;
}
</style>
