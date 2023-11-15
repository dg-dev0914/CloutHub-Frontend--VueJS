<template>
  <div class="ch-streaming-details">
    <app-meeting-button @click="showDetails">
      Streaming Details
    </app-meeting-button>
    <app-modal :show="showModal" title="Streaming Details" @close="closeModal">
      <div class="mb-4">Please use the following settings:</div>
      <b-row>
        <b-col md="3">Stream Address:</b-col>
        <b-col md="9">{{ baseRtmpUrl }}</b-col>
      </b-row>
      <b-row>
        <b-col md="3">Stream Key:</b-col>
        <b-col md="9">{{ get_meeting_livestream_key }}</b-col>
      </b-row>
    </app-modal>
  </div>
</template>

<script>
import AppMeetingButton from '@/components/meetings/buttons/MeetingButton.vue';
import AppModal from '@/components/general/Modal.vue';

import GetMeetingLivestreamKey from '@/gql/meetings/GetMeetingLivestreamKey.gql';

export default {
  components: {
    AppModal,
    AppMeetingButton,
  },
  props: {
    meetingId: {
      type: String,
    },
  },
  apollo: {
    get_meeting_livestream_key: {
      query: GetMeetingLivestreamKey,
      variables() {
        return {
          meetingId: this.meetingId,
        };
      },
    },
  },
  data() {
    return {
      liveStreamKey: null,
      showModal: false,
      baseRtmpUrl: 'rtmp://rtmp.clouthub.com:5222/app',
    };
  },
  methods: {
    async showDetails() {
      // if(!this.liveStreamKey) {
      //   const {data} = await this.$apollo.query({
      //     query: GetMeetingLivestreamKey,
      //     variables: {
      //       meetingId: this.meetingId
      //     },
      //   })
      //   this.liveStreamKey = data.get_meeting_livestream_key
      // }
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
  },
};
</script>

<style scoped>
.ch-streaming-details {
  text-align: center;
  padding: 10px;
}
</style>
