<template>
  <app-modal :title="title" :show="show" @close="$emit('close')">
    <template v-if="members && meeting">
      <div class="ch-meeting-people-modal__meeting-member">
        <app-meeting-member
          v-for="member in members"
          :key="member.id"
          :member="member"
          :meeting="meeting"
        />
        <cs-empty-state
          v-if="members.length === 0"
          description="No people here yet"
        />
      </div>
    </template>
  </app-modal>
</template>

<script>
import AppModal from '@/components/general/Modal.vue';

import AppMeetingMember from '@/components/meetings/MeetingMember.vue';

export default {
  components: {
    AppModal,
    AppMeetingMember,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
    },
    members: {
      type: Array,
      required: true,
    },
    meeting: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped>
.ch-meeting-people-modal__meeting-member {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row !important;
  text-align: center;
  justify-content: space-between;
  overflow: hidden;
}
.ch-meeting-people-modal__meeting-member::after {
  content: '';
  flex: auto;
}
</style>
