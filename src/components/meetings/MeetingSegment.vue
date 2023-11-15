<template>
  <div>
    <app-header-segment :title="title" button="View More" @action="viewAll" />
    <app-meeting-list :meetings="displayMeetings" :placeholder="placeholder" />
  </div>
</template>

<script>
import AppMeetingList from '@/components/meetings/MeetingList.vue';
import AppHeaderSegment from '@/components/general/HeaderSegment.vue';
import apolloGoodClient from '@/services/apollo';

export default {
  components: {
    AppHeaderSegment,
    AppMeetingList,
  },
  props: {
    title: {
      type: String,
      required: true,
      default: 'Untitled Segment',
    },
    placeholder: {
      type: String,
      required: false,
    },
    query: {
      type: Object,
      required: true,
    },
    count: {
      type: Number,
      required: false,
      default: 6,
    },
    to: {
      type: Object,
    },
  },
  apollo: {
    meetings: {
      query() {
        return this.query;
      },
    },
    fetchPolicy: 'network-only',
  },
  computed: {
    displayMeetings() {
      return (
        this.meetings &&
        this.meetings
          .filter(
            (meeting) =>
              meeting.privacy === 'public' ||
              (meeting.privacy === 'private' && meeting.myMembership)
          )
          .slice(0, this.count)
      );
    },
  },
  methods: {
    viewAll() {
      this.$router.push(this.to);
    },
  },
};
</script>

<style scoped></style>
