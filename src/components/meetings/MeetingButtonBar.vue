<template>
  <div class="meeting-button-bar">
    <div class="meeting-button-bar__left">
      <app-meeting-button @click="$emit('openHandoutModal')">
        Handouts
      </app-meeting-button>
      <app-meeting-button @click="$emit('openBreakoutModal')">
        Breakouts Rooms
      </app-meeting-button>
    </div>
    <div class="meeting-button-bar__right">
      <app-meeting-share-button :meeting="meeting" />
      <app-meeting-invite-button
        :meeting="meeting"
        @confirm-modal="$emit('showConfirmModal')"
      />
      <app-meeting-leave-bar-button :meeting-id="meeting.id" />
      <app-meeting-admin-menu
        v-if="canModerate"
        :meeting="meeting"
        is-setting-icon
      />
    </div>
  </div>
</template>
<script>
import AppMeetingButton from '@/components/meetings/buttons/MeetingButton.vue';
import AppMeetingInviteButton from '@/components/meetings/buttons/MeetingInviteButton.vue';
import AppMeetingShareButton from '@/components/meetings/buttons/MeetingShareButton.vue';
import AppMeetingAdminMenu from '@/components/meetings/buttons/MeetingAdminMenu.vue';
import AppMeetingLeaveBarButton from '@/components/meetings/buttons/MeetingLeaveBarButton.vue';

export default {
  components: {
    AppMeetingButton,
    AppMeetingInviteButton,
    AppMeetingShareButton,
    AppMeetingAdminMenu,
    AppMeetingLeaveBarButton,
  },
  props: {
    meeting: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    role() {
      return (
        this.meeting &&
        this.meeting.myMembership &&
        this.meeting.myMembership.role
      );
    },
    canModerate() {
      return this.role === 'ADMIN' || this.role === 'MODERATOR';
    },
  },
};
</script>
<style scoped>
.meeting-button-bar {
  display: flex;
  padding: 10px 15px;
  gap: 8px;
  justify-content: space-between;
  align-items: center;
  background: var(--cs-gray-00);
}
.meeting-button-bar__left {
  display: flex;
  gap: 25px;
}

.meeting-button-bar__right {
  display: flex;
  align-items: center;
  gap: 25px;
}
</style>
