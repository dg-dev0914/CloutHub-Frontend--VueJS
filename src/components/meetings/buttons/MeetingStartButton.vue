<template>
  <div>
    <cs-button size="small"  @click="startMeeting()"
      >Start Event
    </cs-button>
  </div>
</template>
<script>
import StartMeeting from '@/gql/meetings/StartMeeting.gql';
import $socket from '@/services/socket';

export default {
  props: {
    meeting: {
      type: Object,
      required: true,
    },
  },

  methods: {
    async startMeeting() {
      const data = await this.$apollo.mutate({
        mutation: StartMeeting,
        variables: {
          meetingId: this.meeting.id,
        },
      });
      console.log('====');
      console.log('====');
      console.log('====');
      console.log('====');
      console.log('====');
      
      console.log('data', data);
      
      $socket.sendRoom('meeting', this.meeting.id, 'meeting-status-changed');
    },
  },
};
</script>

<style scoped>
.video-preview {
  width: 100%;
  height: 400px;
  margin-top: 20px;
}
.setup-dropdown {
  width: 100%;
  margin-top: 10px;
}
.no-video {
  text-align: center;
  background: black;
  color: white;
  padding-top: 200px;
}
.microphone-settions {
  display: flex;
}
.full-width {
  width: 100%;
}
.footer {
  justify-content: space-between;
  display: flex;
}
</style>
