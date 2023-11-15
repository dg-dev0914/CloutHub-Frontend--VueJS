<template>
  <div @click="leaveMeeting">
    <slot />
  </div>
</template>

<script>
import $auth from '@/services/auth';
import $socket from '@/services/socket';

import LeaveMeeting from '@/gql/meetings/LeaveMeeting.gql';

export default {
  props: {
    variant: {
      type: String,
      default: 'primary',
    },
    meetingId: {
      type: String,
    },
  },
  methods: {
    async leaveMeeting() {
      if ($auth.getUserId()) {
        if (this.meetingId) {
          await this.$apollo.mutate({
            mutation: LeaveMeeting,
            variables: {
              meetingId: this.meetingId,
            },
          });
          await $socket.leaveRoom('meeting', this.meetingId);
        }
        await this.$router.push({ name: 'MeetingContainer' });
      } else {
        this.$emit('confirm-modal');
      }
    },
  },
};
</script>
