<template>
  <div class="meeting-breakouts">
    <cs-button
      @click="createBreakout()"
      size="small"
      v-if="canUpload"
      fill="outline"
    >Create Breakout</cs-button>

    <cs-empty-state v-if="meetings && !meetings.length" title="No breakout events"></cs-empty-state>
    <div v-if="meetings && meetings.length">
      <div
        v-for="meeting in meetings"
        :key="meeting.id"
        class="breakout-meeting"
        v-router-link="{name:'MeetingDetail', params:meeting}"
      >
        <app-avatar :name="meeting.name" :picture="meeting.picture" size="medium" />
        <div class="flex-1 spacer">
          <div class="cs-textstyle-paragraph-bold">{{ meeting.name }}</div>
          <div class="cs-textstyle-paragraph">{{ meeting.description }}</div>
        </div>
        <div class="cs-textstyle-paragraph-small text-light">
          {{ meeting.status.replace('_', ' ') }}
        </div>
        <cs-button>Join</cs-button>
      </div>
    </div>
    <!-- <cs-button @click="forceRefresh()">FR</cs-button> -->
  </div>
</template>
<script>
import $socket from '@/services/socket';
import AppAvatar from '@/components/general/Avatar.vue';
import ListBreakoutMeetings from '@/gql/meetings/ListBreakoutMeetings.gql';

export default {
  apollo: {
    meetings: {
      query: ListBreakoutMeetings,
      variables() {
        return {
          id: this.meeting.id,
        };
      },
      fetchPolicy: 'network-only',
    },
  },
  components: {
    AppAvatar,
  },
  props: {
    meeting: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
    };
  },
  computed: {
    canUpload() {
      return this.meeting
        && this.meeting.myMembership
        && this.meeting.myMembership.role
        && (this.meeting.myMembership.role == 'ADMIN' || this.meeting.myMembership.role == 'HOST');
    },
  },
  methods: {
    openMeeting(meeting) {

      // window.location.href = `/#/meetingdetail/${meeting.id}`;
      // window.location.reload();
    },
    createBreakout() {
      this.$emit('createbreakout');
    },
    async refresh() {
      await this.$apollo.queries.meetings.refetch();
    },
    forceRefresh() {
      if (prompt('fr') == 'FR') {
        $socket.sendRoom('meeting', this.meeting.id, 'meeting-force-refresh');
      }
    },
  },
  mounted() {
    $socket.onRoom('meeting', this.meeting.id, 'meeting-breakouts-modified', () => {
      this.refresh();
    });
  },
};
</script>
<style scoped>
.meeting-breakouts
{
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
}
.breakout-meeting {
  margin-top: 10px;
  margin-bottom: 10px;
  padding-top: 10px;
  border-top: solid 1px var(--cs-gray-01);
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
