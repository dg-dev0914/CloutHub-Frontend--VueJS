<template>
  <div>
    <!-- <app-meeting-search /> -->
    <div class="mb-4 cs-textstyle-item-heading">Events</div>
    <app-meeting-list itemClass="row" :meetings="meetings"></app-meeting-list>
  </div>
</template>

<script>
import AppMeetingList from '@/components/meetings/MeetingList.vue';
import MeetingSearch from '@/gql/search/MeetingSearch.gql';
// import AppMeetingSearch from '@/components/meetings/MeetingSearch.vue';

export default {
  components: {
    AppMeetingList,
    // AppMeetingSearch
  },
  props: {
    query: {
      type: String,
      required: true,
    },
  },
  apollo: {
    meetings: {
      query: MeetingSearch,
      variables() {
        return {
          query: this.query,
        };
      },
    },
  },
};
</script>

<style scoped></style>
