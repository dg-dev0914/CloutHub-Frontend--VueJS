<template>
  <app-meeting-leave-slot v-bind="$props">
    <app-meeting-button>
      <i class="ch-icons-logout" /> Leave Event
    </app-meeting-button>
  </app-meeting-leave-slot>
</template>

<script>
import AppMeetingButton from '@/components/meetings/buttons/MeetingButton.vue';
import AppMeetingLeaveSlot from '@/components/meetings/buttons/MeetingLeaveSlot.vue';

export default {
  components: {
    AppMeetingLeaveSlot,
    AppMeetingButton,
  },
  props: {
    variant: {
      type: String,
      default: 'primary',
    },
    meetingId: {
      type: String,
    },
  },
};
</script>