<template>
  <div
    v-if="meeting.parentMeeting"
    v-router-link="{
      name: 'MeetingDetail',
      params: meeting.parentMeeting,
    }"
    class="parent-meeting-bar"
  >
    &#x21e0; Back to {{ meeting.parentMeeting.name }}
  </div>
</template>
<script>
export default {
  props: {
    meeting: {
      type: Object,
      default: () => {},
    },
  },
};
</script>
