<template>
  <b-container>
    <b-row>
      <!-- <app-meeting-search/> -->
      <b-col md="12">
        <app-meeting-segment
          title="Live Meeting"
          :query="liveMeetings"
          :count="4"
          class="mb-6"
          :to="{ name: 'MeetingList', params: { view: 'live' } }"
        />
        <app-meeting-segment
          title="Upcoming Meetings"
          :query="upcomingMeetings"
          :count="4"
          class="mb-6"
          :to="{ name: 'MeetingList', params: { view: 'upcoming' } }"
        />
        <app-meeting-segment
          title="Invited Meetings"
          :query="invitedMeetings"
          :count="4"
          class="mb-6"
          :to="{ name: 'MeetingList', params: { view: 'invited' } }"
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import AppMeetingSegment from '@/components/meetings/MeetingSegment.vue';
// GQL
import ListLiveMeetings from '@/gql/meetings/ListLiveMeetings.gql';
import ListScheduledMeetings from '@/gql/meetings/ListScheduledMeetings.gql';
import ListInvitedMeetings from '@/gql/meetings/ListInvitedMeetings.gql';
// import AppMeetingSearch from '@/components/meetings/MeetingSearch.vue';

export default {
  components: {
    AppMeetingSegment,
    // AppMeetingSearch
  },
  data() {
    return {
      liveMeetings: ListLiveMeetings,
      upcomingMeetings: ListScheduledMeetings,
      invitedMeetings: ListInvitedMeetings,
    };
  },
};
</script>

<style scoped></style>
