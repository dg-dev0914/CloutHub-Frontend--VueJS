<template>
  <div>
    <app-meeting-button @click="showInvite">
      <i class="ch-icons-users" /> Invite
    </app-meeting-button>
    <app-invite-modal
      :meeting="meeting"
      :show="showInviteModal"
      @close="showInviteModal = false"
    />
  </div>
</template>
<script>
import $auth from '@/services/auth';

import AppMeetingButton from '@/components/meetings/buttons/MeetingButton.vue';
import AppInviteModal from '@/components/meetings/InviteModal.vue';

export default {
  components: {
    AppMeetingButton,
    AppInviteModal,
  },
  props: {
    meeting: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showInviteModal: false,
    };
  },
  methods: {
    showInvite() {
      if ($auth.getUserId()) {
        this.showInviteModal = true;
      } else {
        this.$emit('confirm-modal');
      }
    },
  },
};
</script>
