<template>
  <div class="group-menu">
    <app-context-menu class="group-menu__icon">
      <app-context-menu-item v-if="userIsAdmin" @click="showGroupEditor = true">
        Edit Group
      </app-context-menu-item>
      <app-context-menu-item @click="reportGroup">
        Report Group
      </app-context-menu-item>
      <app-context-menu-item
        v-if="userIsMember || userIsPending"
        @click="leaveGroup"
      >
        Leave Group
      </app-context-menu-item>
      <app-context-menu-item v-if="userIsAdmin" @click="deleteGroup">
        Delete Group
      </app-context-menu-item>
      <app-context-menu-item v-if="userIsSuperAdmin" @click="deleteGroup">
        [SA] Delete Group
      </app-context-menu-item>
    </app-context-menu>

    <app-group-editor-modal
      v-if="userIsAdmin"
      :group-data="group"
      :show="showGroupEditor"
      @close="showGroupEditor = false"
    />
  </div>
</template>

<script>
import $auth from '@/services/auth';
import $bus from '@/services/bus';
import $popups from '@/services/popups';
import $groupsApi from '@/api/groups';
import $group from '@/services/group';

import AppContextMenu from '@/components/general/ContextMenu.vue';
import AppContextMenuItem from '@/components/general/ContextMenuItem.vue';
import AppGroupEditorModal from '@/components/groups/GroupEditorModal.vue';

const getConfirmMessage = (name) => ({
  title: 'Delete Group',
  message: `Are you sure you wish to delete ${name}? This can't be undone.`,
});

export default {
  components: {
    AppContextMenu,
    AppContextMenuItem,
    AppGroupEditorModal,
  },
  props: {
    group: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showGroupEditor: false,
      showGroupOptions: false,
    };
  },
  computed: {
    userRole() {
      return $group.getUserGroupRole(this.group);
    },
    userIsAdmin() {
      return this.userRole === 'admin';
    },
    userIsModerator() {
      if (this.userIsAdmin) return true;
      return this.userRole === 'moderator';
    },
    userIsMember() {
      if (this.userIsModerator) return true;
      return this.userRole === 'member';
    },
    userIsPending() {
      return this.userRole === 'pending-member';
    },
    userIsSuperAdmin() {
      return $auth.isAdmin();
    },
  },
  methods: {
    reportGroup() {
      const data = {
        id: this.group.id,
        type: 'group',
      };
      $bus.$emit('show-report-modal', data);
    },
    async deleteGroup() {
      const confirmDelete = await $popups.confirmDelete(
        getConfirmMessage(this.group.name)
      );
      if (!confirmDelete) return;
      $groupsApi.deleteGroup(this.group);
      if (this.group.parentGroupId) {
        this.$router.push({
          name: 'GroupDetail',
          params: { id: this.group.parentGroupId },
        });
      } else {
        this.$router.replace({ name: 'GroupContainer' });
      }
    },
    async leaveGroup() {
      await $group.leaveGroup(this.group);
    },
  },
};
</script>

<style scoped>
.group-menu {
  padding: 12px 20px;
}
</style>
