<template>
  <div class="meeting-detail">
    <app-meeting-top-bar :is-moderator="isModerator" />
    <cs-spinner v-if="!meeting" />
    <div v-if="meeting && !isTicketPurchasedOrFree && !canView " class="meeting-detail-not-started">
      <app-not-paid-view
        :meeting="meeting"
        @refetchMeeting="refreshMeetingInfo"
      />
    </div>
    <div v-if="meeting && cannotJoin && canView">
      <cs-empty-state
        title="This is a private meeting"
        description="You must be invited to participate"
      />
    </div>
    <template v-if="meeting && socketReady && !cannotJoin && canView || isTicketPurchasedOrFree">
      <div v-if="!sendToPreview || !user" class="meeting-detail-not-started">
        <app-not-started-view
          :meeting="meeting"
          @manageMeeting="isManageMeeting = true"
        />
      </div>
      <div v-else class="meeting-detail-started">
        <app-meeting-detail :id="id" :meeting="meeting" />
      </div>
    </template>
    <app-modal
      :show="showTimerModal && meeting.status === 'LIVE'"
      title="Ending Meeting"
      @close="showTimerModal = false"
    >
      <div class="counter-info">
        No host present in this meeting. This meeting will end soon
        <div>- press continue to keep going.</div>
        <div class="counter">
          <cs-button
            class="buttons"
            variant="primary"
            size="small"
            @click="setLastActive"
          >
            Continue
          </cs-button>
        </div>
      </div>
    </app-modal>
    <app-modal :show="isWelcomeModalShown" @close="isWelcomeModalShown = false">
      <div class="welcome-modal">
        <div class="welcome-title">Welcome {{ userDisplayName }}!</div>
        <div class="welcome-description">
          We hope you will enjoy this CloutHub event! We offer many features
          designed to give you a great experience.<br /><br />
          During the event you will be able to text chat with other audience
          members, and if the host is taking questions, you can raise your hand
          to ask a question or make a comment and have two way interaction with
          the presenters. There are also handouts and breakout rooms available
          if they host chose to use them.<br /><br />
          Thank you for attending this event. If you have any problems, you can
          contact our support team at
          <a href="mailto:support@clouthub.com" class="ch_website_link"
            >support@clouthub.com</a
          >.<br /><br />
        </div>
        <cs-button size="small" @click="isWelcomeModalShown = false">
          Go into Event
        </cs-button>
      </div>
    </app-modal>
  </div>
</template>

<script>
import $auth from '@/services/auth';
import $socket from '@/services/socket';
import $apollo from '@/services/apollo';

import AppModal from '@/components/general/Modal.vue';
import AppMeetingTopBar from '@/components/meetings/MeetingTopBar.vue';
import AppNotStartedView from '@/components/meetings/detailView/NotStartedView.vue';
import AppNotPaidView from '@/components/meetings/detailView/NotPaidView.vue';
import AppMeetingDetail from '@/components/meetings/detailView/MeetingDetail.vue';

import GetMeeting from '@/gql/meetings/GetMeeting.gql';
import EndMeeting from '@/gql/meetings/EndMeeting.gql';
import ListMeetingMembers from '@/gql/meetings/ListMeetingMembers.gql';
import MeetingSetLastActive from '@/gql/meetings/MeetingSetLastActive.gql';

export default {
  components: {
    AppNotStartedView,
    AppMeetingDetail,
    AppMeetingTopBar,
    AppNotPaidView,
    AppModal,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  apollo: {
    meeting: {
      query: GetMeeting,
      variables() {
        return {
          id: this.id,
        };
      },
      pollInterval: 60000,
      fetchPolicy: 'network-only',
    },
    members: {
      query: ListMeetingMembers,
      variables() {
        return {
          meetingId: this.id,
        };
      },
    },
  },
  data() {
    return {
      meeting: null,
      showHelpModal: false,
      socketReady: false,
      isManageMeeting: false,
      user: null,
      showTimerModal: false,
      lastActive: 0,
      endMeetingTimer: null,
      isWelcomeModalShown: false,
    };
  },
  computed: {
    isTicketPurchasedOrFree() {
      return (
        this.meeting &&
        this.meeting.myMembership &&
        (this.meeting.myMembership.ticketStatus === 'PURCHASED' ||
          this.meeting.myMembership.ticketStatus === 'FREE')
      );
    },
    canView() {
      if (this.isModerator) return true;
      if (!this.meeting.ticketPrice || this.meeting.ticketPrice < 1)
        return true;
      if (!this.user) return false;
      if (!this.meeting.myMembership) return false;

      return false;
    },
    sendToPreview() {
      return this.isManageMeeting || !(this.meeting.status === 'NOT_STARTED');
    },
    cannotJoin() {
      if (!this.meeting) {
        return false;
      }
      return this.meeting.privacy === 'private' && !this.meeting.myMembership;
    },
    isModerator() {
      const role =
        this.meeting &&
        this.meeting.myMembership &&
        this.meeting.myMembership.role;

      return role === 'ADMIN' || role === 'MODERATOR';
    },
    userDisplayName() {
      return this.user && this.user.displayname;
    },
  },
  watch: {
    async meeting() {
      if (
        this.meeting &&
        this.meeting.myMembership &&
        this.meeting.myMembership.role === 'BANNED'
      ) {
        alert('You are not permitted to participate in this meeting.');
        await this.$router.push({ name: 'MeetingContainer' });
        return false;
      }

      return true;
    },
  },
  async mounted() {
    this.user = await $auth.getUser();
    if (
      this.user &&
      this.user &&
      this.user.role === 'GUEST' &&
      !localStorage.getItem('is-welcome-guest-shown')
    ) {
      localStorage.setItem('is-welcome-guest-shown', 'true');
      this.isWelcomeModalShown = true;
    }

    document.documentElement.style.setProperty('--cs-font-primary', 'Lato');
    await $socket.connect();
    await $socket.joinRoom('meeting', this.id);
    $socket.onRoom('meeting', this.id, 'meeting-edited', () => {
      this.refreshMeetingInfo();
    });
    $socket.onRoom('meeting', this.id, 'meeting-status-changed', () => {
      this.refreshMeetingInfo();
    });
    $socket.onRoom('meeting', this.id, 'meeting-members-modified', () => {
      this.refreshMeetingInfo();
    });
    $socket.onRoom('meeting', this.id, 'meeting-deleted', () => {
      this.$router.push({ name: 'MeetingContainer' });
    });
    $socket.onRoom('meeting', this.id, 'meeting-force-refresh', () => {
      const timeout = Math.floor(Math.random() * 5 * 60000);
      setTimeout(() => {
        window.location.reload();
      }, timeout);
    });
    this.socketReady = true;
    // if(this.isModerator)
    // this.checkLastActive()
  },
  beforeDestroy() {
    document.documentElement.style.setProperty('--cs-font-primary', 'Roboto');
  },
  methods: {
    checkLastActive() {
      if (
        this.meeting.status === 'LIVE' &&
        this.$route.name === 'MeetingDetail'
      ) {
        setTimeout(() => {
          this.checkLastActive();
        }, 60004);
        if (
          this.meeting.myMembership &&
          this.meeting.myMembership.role === 'ADMIN'
        ) {
          this.setLastActive();
        }
        const lastActive = new Date(this.meeting.lastActive);
        const currentTime = new Date();
        let diff = (currentTime.getTime() - lastActive.getTime()) / 1000;
        diff /= 60;
        if (diff === 15 || (diff > 15 && !this.showTimerModal)) {
          this.showTimerModal = true;
          this.endMeetingTimer = setTimeout(() => {
            this.endMeeting();
            this.showTimerModal = false;
          }, 60000);
        }
      }
    },
    async endMeeting() {
      await this.$apollo.mutate({
        mutation: EndMeeting,
        variables: {
          meetingId: this.meeting.id,
        },
      });
      this.$toast.open({
        message:
          'This event has ended. You will be able to watch the video again shortly',
        type: 'success',
        duration: 2000,
        dismissible: true,
        position: 'top',
      });
      $socket.sendRoom('meeting', this.meeting.id, 'meeting-status-changed');
    },
    async setLastActive() {
      console.log('setLastActive');

      await $apollo.mutate({
        mutation: MeetingSetLastActive,
        variables: {
          id: this.meeting.id,
        },
      });
      this.showTimerModal = false;
      clearTimeout(this.endMeetingTimer);
    },
    refreshMeetingInfo() {
      this.$apollo.queries.meeting.refetch();
      this.$apollo.queries.members.refetch();
    },
  },
};
</script>
<style scoped>
.meeting-detail {
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.meeting-detail-not-started {
  max-width: 850px;
  width: 100%;
  margin: 0 auto;
  overflow: auto;
}
.meeting-detail-started {
  display: flex;
  flex: 1;
}
.counter {
  margin: 20px;
}
.counter-info {
  text-align: center;
}
.buttons {
  margin: 0 8px;
}
.welcome-modal {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.welcome-title {
  font-size: 25px;
  font-weight: bold;
  text-align: center;
  margin: 0 0 15px;
}
.welcome-description {
  font-size: 16px;
  color: #4a5359;
}
.welcome-description a {
  color: #0091ff;
}
</style>
