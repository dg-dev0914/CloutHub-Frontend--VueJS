<template lang="html">
  <div class="groups-group-member-menu">
    <!-- If the user is pending to join, show an Accept or Decline button instead of the menu -->
    <template v-if="memberIsPending">
      <cs-button v-if="userIsAdmin" size="small" @click="setRole('member')"
        >Accept</cs-button
      >
      <cs-button
        v-if="userIsAdmin"
        size="small"
        variant="danger"
        fill="outline"
        @click="removeMember"
      >
        Decline
      </cs-button>
    </template>

    <!-- If the member is not the logged in user, show the menu button -->
    <app-context-menu v-if="memberNotUser || isSiteAdmin">
      <app-context-menu-item @click="sendMessage()">
        Send Message
      </app-context-menu-item>
      <template v-if="userHasMemberStatus || isSiteAdmin">
        <app-context-menu-item @click="reportUser()">
          Report User
        </app-context-menu-item>
        <app-context-menu-item
          v-if="isAvailable('removeFromGroup')"
          @click="removeMember()"
        >
          Remove from Group
        </app-context-menu-item>
        <app-context-menu-item
          v-if="isAvailable('makeModerator')"
          @click="setRole('moderator')"
        >
          Make Moderator
        </app-context-menu-item>
        <app-context-menu-item
          v-if="isAvailable('makeMember')"
          @click="setRole('member')"
        >
          Make Member
        </app-context-menu-item>
        <app-context-menu-item
          v-if="isAvailable('makeAdmin')"
          @click="setRole('admin')"
        >
          Make Admin
        </app-context-menu-item>
      </template>
    </app-context-menu>
  </div>
</template>

<script>
import $auth from '@/services/auth';
import $bus from '@/services/bus';
import $groupsApi from '@/api/groups';

import AppContextMenu from '@/components/general/ContextMenu.vue';
import AppContextMenuItem from '@/components/general/ContextMenuItem.vue';

const memberRules = {
  admin: {
    admin: [
      'sendMessage',
      'reportUser',
      'removeFromGroup',
      'makeModerator',
      'makeMember',
    ],
    moderator: [
      'sendMessage',
      'reportUser',
      'removeFromGroup',
      'makeMember',
      'makeAdmin',
    ],
    member: [
      'sendMessage',
      'reportUser',
      'removeFromGroup',
      'makeModerator',
      'makeAdmin',
    ],
    'pending-member': [
      'sendMessage',
      'reportUser',
      'makeModerator',
      'makeAdmin',
      'makeMember',
    ],
  },
  moderator: {
    admin: ['sendMessage', 'reportUser'],
    moderator: ['sendMessage', 'reportUser'],
    member: ['sendMessage', 'reportUser', 'removeFromGroup', 'makeModerator'],
    'pending-member': [
      'sendMessage',
      'reportUser',
      'makeModerator',
      'makeMember',
    ],
  },
  member: {
    admin: ['sendMessage', 'reportUser'],
    moderator: ['sendMessage', 'reportUser'],
    member: ['sendMessage', 'reportUser'],
    'pending-member': ['sendMessage', 'reportUser'],
  },
};

export default {
  components: {
    AppContextMenu,
    AppContextMenuItem,
  },
  props: {
    group: {
      type: Object,
      required: true,
    },
    member: {
      type: Object,
      required: true,
    },
  },
  computed: {
    userIsAdmin() {
      return this.userRole === 'admin';
    },
    userRole() {
      if (!this.group || !this.group.myMembership) return '';
      return this.group.myMembership.role;
    },
    memberRole() {
      return this.member.role;
    },
    availableActions() {
      return memberRules[this.userRole][this.memberRole];
    },
    userHasMemberStatus() {
      return Object.keys(memberRules).includes(this.userRole);
    },
    memberNotUser() {
      return this.member.user.id !== $auth.getUserId();
    },
    memberIsPending() {
      return this.member.role === 'pending-member';
    },
    isSiteAdmin() {
      return $auth.isAdmin();
    },
  },
  methods: {
    isAvailable(action) {
      return this.isSiteAdmin || this.availableActions.includes(action);
    },
    async sendMessage() {
      $bus.$emit('new-message-modal', { user: this.member.user });
    },
    async reportUser() {
      const reportData = {
        id: this.member.user.id,
        type: 'user',
      };
      $bus.$emit('show-report-modal', reportData);
    },
    async setRole(role) {
      await $groupsApi.updateMember(this.group, this.member, role);
    },
    async removeMember() {
      await $groupsApi.removeMember(this.group, this.member);
    },
  },
};
</script>

<style lang="css" scoped>
.groups-group-member-menu {
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>
