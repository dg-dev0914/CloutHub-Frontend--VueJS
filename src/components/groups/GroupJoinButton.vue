<template>
  <div>
    <template v-if="group.myMembership">
      <cs-button
        v-if="group.myMembership.role === 'pending-member'"
        variant="secondary"
        size="small"
        fill="outline"
        disabled
        >{{ short ? 'Pending' : 'Pending Approval' }}</cs-button
      >
    </template>
    <cs-button
      v-else-if="group.privacy === 'public'"
      size="small"
      fill="outline"
      @click="joinGroup()"
    >
      {{ short ? 'Join' : 'Join Group' }}
    </cs-button>
    <cs-button v-else size="small" fill="outline" @click="joinGroup()">
      <i v-if="!short" class="cs-icons-lock"></i>
      {{ short ? 'Join' : 'Request to join' }}
    </cs-button>
  </div>
</template>

<script>
import $groupsApi from '@/api/groups';

export default {
  props: {
    group: {
      type: Object,
      required: true,
    },
    short: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  methods: {
    async joinGroup() {
      await $groupsApi.joinGroup(this.group);
    },
  },
};
</script>
