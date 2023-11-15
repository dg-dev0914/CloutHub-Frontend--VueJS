<template>
  <div class="meeting-people-tab">
    <cs-spinner v-if="!members" />
    <div v-if="members">
      <app-add-leader-button
        v-if="isAdmin"
        :meeting="meeting"
        :members="members"
        class="meeting-people-tab__leader-button"
      />
      <app-meeting-people-tab-segment
        type="leaders"
        :members="leaderMembers"
        :meeting="meeting"
        title="Leaders"
      />
      <app-meeting-people-tab-segment
        type="speakers"
        title="Speakers"
        :members="speakerMembers"
        :meeting="meeting"
      />
      <app-meeting-people-tab-segment
        type="queued"
        title="Speaker Queue"
        :members="queuedMembers"
        :meeting="meeting"
      />
      <app-meeting-people-tab-segment
        type="audience"
        title="Audience"
        :members="audienceMembers"
        :meeting="meeting"
      />
      <app-meeting-people-tab-segment
        v-if="attendingMembers && attendingMembers.length"
        type="attending"
        title="Attending"
        :members="attendingMembers"
        :meeting="meeting"
      />
      <app-meeting-people-tab-segment
        type="invited"
        title="Invited"
        :members="invitedMembers"
        :meeting="meeting"
      />
    </div>
  </div>
</template>
<script>
import $socket from '@/services/socket';

import AppMeetingPeopleTabSegment from '@/components/meetings/MeetingPeopleTabSegment.vue';

import ListMeetingMembers from '@/gql/meetings/ListMeetingMembers.gql';
import AppAddLeaderButton from '@/components/meetings/AddLeaderButton.vue';

export default {
  components: {
    AppMeetingPeopleTabSegment,
    AppAddLeaderButton,
  },
  props: {
    meeting: {
      type: Object,
      required: true,
    },
  },
  apollo: {
    members: {
      query: ListMeetingMembers,
      variables() {
        return {
          meetingId: this.meeting.id,
        };
      },
      fetchPolicy: 'no-cache',
    },
  },
  data() {
    return {
      interval: null,
      onlineMembers: [],
      lastActive: new Date(),
      inActiveMinutes: 0,
    };
  },
  computed: {
    fmembers() {
      return (
        this.members &&
        this.members.map((m) => {
          const y = { ...m };
          y.online = this.onlineMembers.includes(m.user.id);
          return y;
        })
      );
    },
    leaderMembers() {
      const leaders = this.fmembers.filter((m) =>
        ['ADMIN', 'MODERATOR', 'PRESENTER', 'PRESENTER_QUEUE'].includes(m.role)
      );
      return leaders.sort((a, b) => (a.role < b.role ? -1 : 1));
    },
    speakerMembers() {
      return this.fmembers.filter((m) => 'SPEAKER'.indexOf(m.role) > -1);
    },
    queuedMembers() {
      return this.fmembers.filter((m) => 'QUEUE'.indexOf(m.role) > -1);
    },
    audienceMembers() {
      //TODO: temporary fix for performance reason
      const audienceLimitedList = this.fmembers.filter(
        (m) => 'VIEWER'.indexOf(m.role) > -1
      );
      if (audienceLimitedList.length > 500) {
        audienceLimitedList.length = 500;
      }
      return audienceLimitedList;
    },
    attendingMembers() {
      return this.fmembers.filter((m) => 'ATTENDING'.indexOf(m.role) > -1);
    },
    invitedMembers() {
      return this.fmembers.filter((m) => 'INVITED'.indexOf(m.role) > -1);
    },
    myRole() {
      return (
        this.meeting &&
        this.meeting.myMembership &&
        this.meeting.myMembership.role
      );
    },
    isAdmin() {
      return this.myRole === 'ADMIN';
    },
    isQueued() {
      return this.myRole === 'QUEUE';
    },
    participantsCount() {
      return (
        this.fmembers &&
        !this.speakerMembers.length &&
        !this.queuedMembers.length &&
        !this.audienceMembers.length &&
        !this.attendingMembers.length &&
        !this.invitedMembers.length
      );
    },
  },
  mounted() {
    $socket.onRoom(
      'meeting',
      this.meeting.id,
      'meeting-members-modified',
      this.refresh
    );
    this.interval = setInterval(async () => {
      if (this.$route.name !== 'MeetingDetail') return;
      this.onlineMembers = await $socket.listRoomMembers(
        'meeting',
        this.meeting.id
      );
    }, 5000);
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
  methods: {
    refresh() {
      this.$apollo.queries.members.refetch();
    },
  },
};
</script>
<style scoped>
.meeting-people-tab {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 10px 0 0;
}
.meeting-people-tab__leader-button {
  position: absolute;
  right: 2px;
  top: 13px;
}
.ch-meeting-people-tab__header-wrapper {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
.ch-meeting-people-tab__header-wrapper:nth-child(1) {
  margin-top: 0;
}
.ch-meeting-people-tab__header {
  color: var(--cs-gray-04);
  margin-bottom: 10px;
}

.queue-notice {
  border: dashed 1px var(--cs-primary-base);
  padding: 10px;
  margin-bottom: 10px;
  display: flex;
  gap: 5px;
  flex-direction: column;
  align-items: center;
}
.queue-notice i {
  font-size: 20px;
  color: var(--cs-primary-base);
}
</style>
