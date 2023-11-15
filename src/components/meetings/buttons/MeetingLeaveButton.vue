<template>
  <app-meeting-leave-slot v-bind="$props">
    <cs-button size="small" class="cs-button" fill="outline" :variant="variant">
      Leave Event
    </cs-button>
  </app-meeting-leave-slot>
</template>

<script>
import AppMeetingLeaveSlot from '@/components/meetings/buttons/MeetingLeaveSlot.vue';

export default {
  components: {
    AppMeetingLeaveSlot,
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
<style scoped>
.cs-button {
  min-width: 150px;
}
</style>
