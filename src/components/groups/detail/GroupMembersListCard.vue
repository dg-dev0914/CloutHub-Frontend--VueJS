<template>
  <div v-show="memberCount > 0" class="card-no-padding group-members-list-card">
    <div v-if="memberCount > 0" class="card-header">
      <span v-if="role" class="cs-textstyle-paragraph-bold">
        {{ roles[role] }}
      </span>
      <cs-button
        v-if="role === 'member'"
        size="small"
        fill="clear"
        @click="showMembersModal = true"
      >
        View All
      </cs-button>
    </div>
    <app-group-members-list
      :group="group"
      :role="role"
      @member-count="updateCount"
    />
    <app-group-members-list-modal
      v-if="role === 'member'"
      :group="group"
      :role="role"
      :show="showMembersModal"
      @close="showMembersModal = false"
    />
  </div>
</template>

<script>
import AppGroupMembersList from '@/components/groups/detail/GroupMembersList.vue';
import AppGroupMembersListModal from '@/components/groups/detail/GroupMembersListModal.vue';

export default {
  components: {
    AppGroupMembersList,
    AppGroupMembersListModal,
  },
  props: {
    group: {
      type: Object,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      memberCount: 0,
      showMembersModal: false,
      roles: {
        admin: 'Admins',
        moderator: 'Moderators',
        'pending-member': 'Pending Members',
        member: 'Members',
      },
    };
  },
  methods: {
    updateCount(count) {
      this.memberCount = count;
    },
  },
};
</script>

<style scoped>
.group-members-list-card {
  margin-bottom: 10px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  padding: 15px 20px;
  background-color: var(--cs-gray-00);
  color: var(--cs-gray-06);
}
.card-header .cs-button {
  --cs-button-padding: 0 0 0 4px;
}
</style>
