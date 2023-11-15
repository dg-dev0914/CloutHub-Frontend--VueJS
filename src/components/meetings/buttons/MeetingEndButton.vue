<template>
  <button size="medium" class="cs-button" @click="endMeeting()">
    End Event
  </button>
</template>
<script>
import $popups from '@/services/popups';
import $socket from '@/services/socket';

import EndMeeting from '@/gql/meetings/EndMeeting.gql';

export default {
  props: {
    meeting: Object,
  },
  methods: {
    async endMeeting() {
      const confirmEnd = await $popups.confirm({
        title: 'End Event?',
        message:
          "Are you sure you wish to end this event? You won't be able to start it again.",
      });
      if (!confirmEnd) return;
      await this.$apollo.mutate({
        mutation: EndMeeting,
        variables: {
          meetingId: this.meeting.id,
        },
      });
      this.$toast.open({
        message:
          'This event has ended. You will be able to watch the video again shortly',
        type: 'success',
        duration: 2000,
        dismissible: true,
        position: 'top',
      });
      $socket.sendRoom('meeting', this.meeting.id, 'meeting-status-changed');
    },
  },
};
</script>

<style scoped>
.cs-button {
  padding: 7px 27px;
  min-width: 150px;
  font-family: var(--cs-font-primary);
  font-size: var(--cs-font-size-100);
  font-weight: var(--cs-font-weight-bold);
  line-height: var(--cs-line-height-base);
  background-color: #666;
  color: var(--cs-primary-contrast);
  border-radius: 60px;
  border: none;
}
</style>
