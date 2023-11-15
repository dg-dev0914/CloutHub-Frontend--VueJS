<template>
  <div>
    <!-- <app-meeting-search /> -->
    <div class="mb-4 cs-textstyle-item-heading">{{ currentView.title }}</div>
    <app-meeting-list
      :meetings="meetings"
      :placeholder="currentView.placeholder"
    ></app-meeting-list>
    <!-- <app-infinite-offset :query="$apollo.queries.meetings" /> -->
  </div>
</template>

<script>
import AppMeetingList from '@/components/meetings/MeetingList.vue';
import AppInfiniteOffset from '@/components/general/InfiniteOffset.vue';
import ListLiveMeetings from '@/gql/meetings/ListLiveMeetings.gql';
import ListScheduledMeetings from '@/gql/meetings/ListScheduledMeetings.gql';
import ListPublicMeetings from '@/gql/meetings/ListPublicMeetings.gql';
import ListAttendingMeetings from '@/gql/meetings/ListAttendingMeetings.gql';
import ListAttendedMeetings from '@/gql/meetings/ListAttendedMeetings.gql';
import ListInvitedMeetings from '@/gql/meetings/ListInvitedMeetings.gql';
import ListCompletedMeetings from '@/gql/meetings/ListCompletedMeetings.gql';

// import AppMeetingSearch from '@/components/meetings/MeetingSearch.vue';

const viewSettings = {
  all: {
    title: 'All Meetings',
    query: ListPublicMeetings,
  },
  live: {
    title: 'Live Meetings',
    query: ListLiveMeetings,
  },
  upcoming: {
    title: 'Upcoming Meetings',
    query: ListScheduledMeetings,
  },
  attending: {
    title: 'Attending Meetings',
    query: ListAttendingMeetings,
  },
  attended: {
    title: 'Attended Meetings',
    query: ListAttendedMeetings,
  },
  invited: {
    title: 'Invited Meetings',
    query: ListInvitedMeetings,
  },
  completed: {
    title: 'Completed Meetings',
    query: ListCompletedMeetings,
  },
};
export default {
  components: {
    AppMeetingList,
    AppInfiniteOffset,
    // AppMeetingSearch
  },
  props: {
    view: {
      type: String,
      required: true,
    },
  },
  apollo: {
    meetings: {
      query() {
        return this.currentView.query;
      },
      fetchPolicy: 'network-only',
    },
  },
  computed: {
    currentView() {
      return viewSettings[this.$route.params.view];
    },
  },
};
</script>

<style scoped></style>
