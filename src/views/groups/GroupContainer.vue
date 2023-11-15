<template>
  <b-container
    fluid="xl"
    :class="{ 'px-0': true, 'container-small': isSmallContainer }"
  >
    <b-row class="row">
      <!-- Sidebar -->
      <b-col>
        <cs-button
          class="key-button mb-3"
          block
          @click="showGroupEditor = true"
        >
          Create Group
        </cs-button>

        <app-page-menu>
          <app-page-menu-item
            label="My Groups"
            :to="{ name: 'MyGroupsList' }"
          />
          <app-page-menu-item label="For Me" :to="{ name: 'GroupsForMe' }" />
          <app-page-menu-item
            label="Find a group"
            :to="{ name: 'FindGroup' }"
          />
          <app-page-menu-item
            label="Recommended"
            :to="{ name: 'RecommendedGroupsList' }"
          />
        </app-page-menu>
      </b-col>

      <!-- Group router view -->
      <b-col md="10" class="col-content">
        <router-view :key="$route.fullPath" />
      </b-col>
    </b-row>

    <!-- Create group modal -->
    <app-group-editor-modal
      :show="showGroupEditor"
      @close="showGroupEditor = false"
    />
  </b-container>
</template>

<style scoped>
@media (min-width: 1400px) {
  .container-small {
    max-width: 820px;
  }
}

.container-small .row {
  --bs-gutter-x: 10px;
}

.container-small .col-content {
  flex: 0 0 auto;
  width: 78%;
}
</style>

<script>
// General components
import AppPageMenu from '@/components/general/PageMenu.vue';
import AppPageMenuItem from '@/components/general/PageMenuItem.vue';

// Group common components
import AppGroupEditorModal from '@/components/groups/GroupEditorModal.vue';

export default {
  components: {
    AppPageMenu,
    AppPageMenuItem,
    AppGroupEditorModal,
  },
  data() {
    return {
      showGroupEditor: false,
    };
  },
  computed: {
    isSmallContainer() {
      return [
        'GroupSearch',
        'RecommendedGroupsList',
        'GroupsForMe',
        'FindGroup',
        'GroupCategory',
        'MyGroupsList',
        'MyGroupsSearch',
      ].includes(this.$route.name);
    },
  },
};
</script>
