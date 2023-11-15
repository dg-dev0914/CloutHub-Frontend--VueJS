<template>
  <div class="meeting-wrapper">
    <div v-if="meeting" class="meeting-panels">
      <div class="left-panel">
        <app-meeting-back-from-breakout-bar :meeting="meeting" />
        <app-meeting-header
          :meeting="meeting"
          :is-admin="isAdmin"
          @openSigninModal="openSigninModal"
          @openSignupModal="openSignupModal"
          @showConfirmModal="showConfirmModal"
        ></app-meeting-header>
        <app-meeting-button-bar
          :meeting="meeting"
          @openHandoutModal="openHandoutModal"
          @openBreakoutModal="openBreakoutModal"
          @showConfirmModal="showConfirmModal"
        />
        <!-- TRANSCODING -->
        <div v-if="meeting.status === 'TRANSCODING'" class="meeting-info">
          <cs-spinner />
          <div class="cs-textstyle-item-heading">Event Ended</div>
          <div class="cs-textstyle-paragraph">
            The recording of this event is being processed, and will be
            available soon.
          </div>
        </div>
        <!-- ENDED -->
        <div v-if="meeting.status === 'ENDED'" class="flex-full">
          <app-video
            :src="meeting.recordingUrl"
            :stream-id="meeting.streamId"
            :stream-status="meeting.streamStatus"
            :poster="meeting.picture"
            class="meeting-video"
            autoplay
          />
          <div class="meeting-status">
            <div>RECORDED</div>
          </div>
        </div>

        <!-- NOT STARTED -->
        <div v-if="meeting.status == 'NOT_STARTED'" class="meeting-info">
          <div v-if="canModerate" class="ch-ready-info">
            <div class="cs-textstyle-item-heading">Ready to start?</div>
            <div class="cs-textstyle-paragraph mt-2 mb-2">
              Participants will be able to join as soon as you start this
              meeting.
            </div>
            <app-meeting-start-button v-if="isAdmin" :meeting="meeting" />
          </div>
        </div>

        <!-- LIVE -->
        <div v-if="meeting.status == 'LIVE'" class="main-panel">
          <app-meeting-main
            ref="main"
            :meeting="meeting"
            @confirm-modal="showConfirmModal"
            @end-meeting="endMeeting"
          />
        </div>
      </div>
      <div class="right-panel">
        <app-meeting-panel label="People">
          <app-meeting-people-tab
            adminmode
            :meeting="meeting"
            :is-admin="isAdmin"
          />
        </app-meeting-panel>
        <app-meeting-panel label="Chat">
          <app-meeting-chat-tab
            adminmode
            :meeting="meeting"
            :is-admin="isAdmin"
            @showProfile="openProfileModal"
            @confirm-modal="showConfirmModal"
          />
        </app-meeting-panel>
      </div>
    </div>
    <!-- Popup -->
    <app-modal
      v-if="confirmModal"
      :show="confirmModal"
      type="confirm"
      variant="primary"
      title="Sign up/Sign in to continue"
      @close="confirmModal = false"
    >
      <div>Please signup or signin to access this function</div>
      <div class="confirm-btns">
        <cs-button @click="openSignupModal">Signup</cs-button>
        <cs-button @click="openSigninModal">Signin</cs-button>
      </div>
    </app-modal>
    <!-- Signup Modal -->
    <app-meeting-signup
      :show-signup="showSignup"
      @close-signup="closeSignupModal"
      @account-created="authorized"
    />
    <!-- Signin Modal -->
    <app-meeting-signin
      :show-signin="showSignin"
      @close-signin="closeSigninModal"
      @logged-in="authorized"
    />
    <app-create-meeting-modal
      :show="showCreateBreakoutModal"
      :parent-meeting="meeting"
      @close="showCreateBreakoutModal = false"
    />
    <!-- Admin Modals -->
    <app-modal
      title="Handouts"
      :show="showHandoutModal"
      @close="showHandoutModal = false"
    >
      <app-meeting-resources-tab :meeting="meeting" :is-admin="isAdmin" />
    </app-modal>
    <app-modal
      title="Breakouts"
      :show="showBreakoutModal"
      @close="showBreakoutModal = false"
    >
      <app-meeting-breakout-tab
        :meeting="meeting"
        :is-admin="isAdmin"
        @createbreakout="showCreateBreakoutModal = true"
      />
    </app-modal>
  </div>
</template>

<script>
import $meetingsApi from '@/api/meetings';
import $popups from '@/services/popups';
import $auth from '@/services/auth';
import $socket from '@/services/socket';
import $cdn from '@/services/cdn';

// Components
import AppMeetingHeader from '@/components/meetings/MeetingHeader.vue';
import AppMeetingMain from '@/components/meetings/MeetingMain.vue';
import AppVideo from '@/components/general/Video.vue';
import AppMeetingEndButton from '@/components/meetings/buttons/MeetingEndButton.vue';
import AppMeetingBackFromBreakoutBar from '@/components/meetings/MeetingBackFromBreakoutBar.vue';
import AppMeetingButtonBar from '@/components/meetings/MeetingButtonBar.vue';
import AppMeetingLinksBar from '@/components/meetings/MeetingLinksBar.vue';

// Tabs
import AppMeetingPeopleTab from '@/components/meetings/MeetingPeopleTab.vue';
import AppMeetingResourcesTab from '@/components/meetings/MeetingResourcesTab.vue';
import AppMeetingChatTab from '@/components/meetings/MeetingChatTab.vue';
import AppMeetingBreakoutTab from '@/components/meetings/MeetingBreakoutTab.vue';

import AppMeetingPanel from '@/components/meetings/MeetingPanel.vue';

import AppMeetingStartButton from '@/components/meetings/buttons/MeetingStartButton.vue';

import AppMeetingSignup from '@/components/meetings/MeetingSignup.vue';
import AppMeetingSignin from '@/components/meetings/MeetingSignin.vue';
import AppModal from '@/components/general/Modal.vue';
import AppCreateMeetingModal from '@/components/meetings/CreateMeetingModal.vue';

// GQL
import JoinMeeting from '@/gql/meetings/JoinMeeting.gql';
import GetAgoraToken from '@/gql/meetings/GetAgoraToken.gql';
import SetMeetingMemberRole from '@/gql/meetings/SetMeetingMemberRole.gql';

export default {
  components: {
    AppMeetingHeader,
    AppMeetingMain,
    AppMeetingPeopleTab,
    AppMeetingResourcesTab,
    AppMeetingChatTab,
    AppMeetingBreakoutTab,
    AppMeetingStartButton,
    AppMeetingSignup,
    AppMeetingSignin,
    AppModal,
    AppVideo,
    AppCreateMeetingModal,
    AppMeetingPanel,
    AppMeetingEndButton,
    AppMeetingBackFromBreakoutBar,
    AppMeetingButtonBar,
    AppMeetingLinksBar,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
    meeting: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showSignup: false,
      showSignin: false,
      confirmModal: false,
      showCreateBreakoutModal: false,
      showHandoutModal: false,
      showBreakoutModal: false,
      participantCount: 0,
      showUser: null,
      rtmpURL: null,
    };
  },
  computed: {
    showButtons() {
      return (
        this.role == 'QUEUE' ||
        ((this.role == 'VIEWER' || this.role == 'ATTENDING' || !this.role) &&
          this.meeting.status == 'LIVE' &&
          this.meeting.enableQueue)
      );
    },
    role() {
      return (
        this.meeting &&
        this.meeting.myMembership &&
        this.meeting.myMembership.role
      );
    },
    canModerate() {
      return this.role === 'ADMIN' || this.role === 'MODERATOR';
    },
    isAdmin() {
      return this.role === 'ADMIN';
    },
    isFuture() {
      return this.meeting && this.meeting.startTime > new Date().toISOString();
    },
    isMember() {
      return !!this.meeting.myMembership;
    },
    displayTime() {
      const currentUserTimezone = this.$moment.tz.guess();
      return (
        this.meeting &&
        this.$moment
          .utc(this.meeting.startTime)
          .local()
          .tz(currentUserTimezone)
          .format('MMM D [|] h:mmA z')
      );
    },
  },
  watch: {
    async meeting() {
      this.joinIfNeeded();
    },
  },
  async mounted() {
    this.joinIfNeeded();
    setInterval(() => {
      this.participantCount = $socket.getRoomCount('meeting', this.id);
    }, 3000);
  },
  methods: {
    openProfileModal(user) {
      this.showUser = user;
    },
    cdnUrl() {
      const id = this.meeting.streamId;
      return $cdn.optimize(
        `${process.env.VUE_APP_VIDEO_DOMAIN}/${id}/playlist.m3u8`
      );
    },
    endMeeting() {
      this.$apollo.queries.meeting.refetch();
    },
    showConfirmModal() {
      this.confirmModal = true;
    },
    // Signup
    openSignupModal() {
      this.confirmModal = false;
      this.showSignup = true;
    },
    closeSignupModal() {
      this.showSignup = false;
    },
    authorized() {
      // TODO: Might have to replace this with something better
      window.location.reload();
    },
    openHandoutModal() {
      this.showHandoutModal = true;
    },
    openBreakoutModal() {
      this.showBreakoutModal = true;
    },
    // Signin
    openSigninModal() {
      this.confirmModal = false;
      this.showSignin = true;
    },
    closeSigninModal() {
      this.showSignin = false;
    },
    async joinIfNeeded() {
      if (
        this.meeting &&
        this.meeting.myMembership &&
        this.meeting.myMembership.role === 'BANNED'
      ) {
        alert('You are not permitted to participate in this meeting.');
        this.$router.push({ name: 'MeetingContainer' });
        return false;
      }
      if (
        this.meeting &&
        !this.isAdmin &&
        this.meeting.status === 'LIVE' &&
        this.meeting.privacy === 'public'
      ) {
        await this.joinMeeting();
      }
      if (
        this.meeting &&
        !this.isAdmin &&
        this.meeting.status === 'LIVE' &&
        this.meeting.privacy === 'private' &&
        this.meeting.myMembership
      ) {
        await this.joinMeeting();
      }
    },
    async joinMeeting() {
      if (this.cannotJoin) return;
      if (
        !this.meeting.myMembership ||
        (this.meeting.myMembership &&
          this.meeting.myMembership.role &&
          (this.meeting.myMembership.role === 'INVITED' ||
            this.meeting.myMembership.role === 'ATTENDING'))
      ) {
        await this.$apollo.mutate({
          mutation: JoinMeeting,
          variables: {
            meetingId: this.id,
          },
        });
        console.log('Join Event Trigger');
        $socket.sendRoom(
          'meeting',
          this.meeting.id,
          'meeting-members-modified'
        );
      } else {
        console.log('Skip Join');
      }
    },
    async signup() {
      try {
        await $meetingsApi.signup(this.meeting.id);
        $socket.sendRoom(
          'meeting',
          this.meeting.id,
          'meeting-members-modified'
        );
      } catch (e) {
        $popups.alert(
          'There was an error saving.  Please try again or contact support.'
        );
        throw e;
      }
    },
    raiseHand() {
      if ($auth.getUserId()) {
        this.setRole('QUEUE');
      } else {
        this.confirmModal = true;
      }
    },
    async setRole(role, userId) {
      userId = userId || $auth.getUserId();
      await this.$apollo.mutate({
        mutation: SetMeetingMemberRole,
        variables: {
          meetingId: this.meeting.id,
          userId,
          role,
        },
      });
      $socket.sendRoom('meeting', this.meeting.id, 'meeting-members-modified');
    },
  },
  async beforeRouteLeave(to, from, next) {
    if (this.$refs.main) {
      await this.$refs.main.leave();
    }
    next();
  },
  async beforeRouteUpdate(to, from, next) {
    if (this.$refs.main) {
      await this.$refs.main.leave();
    }
    next();
  },
};
</script>

<style scoped>
.meeting-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.meeting-panels {
  display: flex;
  flex: 1;
}
.left-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 5px 0 0;
}
.right-panel {
  display: flex;
  gap: 5px;
  padding: 5px 0 0 5px;
  width: 800px;
}

@media only screen and (max-width: 1410px) {
  .right-panel {
    flex-direction: column;
    width: 400px;
  }
}

.meeting-live__waiting {
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: silver;
  color: var(--cs-gray-07);
  display: flex;
  flex-direction: column;
}
.meeting-info {
  border: dashed 1px var(--cs-primary-base);
  padding: 50px;
  margin-top: 20px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  text-align: center;
}
.meeting-active {
  flex: 1;
  display: flex;
  flex-direction: row;
}

.main-panel {
  flex: 1;
  background-color: black;
  display: flex;
  flex-direction: column;
}
.main-video {
  flex: 1;
}

/** MEETING PAGE TABS **/
.meeting-page-tabs {
  display: flex !important;
  flex-direction: column;
  flex: 1;
}
.meeting-page-tabs >>> .cs-page-tabs__content {
  display: flex;
  flex: 1;
  position: relative;
}
.meeting-page-tabs >>> .cs-page-tab {
  flex: 1;
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
}
.parent-meeting-bar {
  padding: 15px;
  font-weight: bold;
  color: var(--cs-primary-base);
  background-color: var(--cs-gray-00);
  cursor: pointer;
}
.confirm-btns {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  margin-top: 10px;
}
.flex-full {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.meeting-video {
  padding: 0;
  background-color: black;
  flex: 1;
  display: flex;
}
.cs-buttons {
  --cs-button-padding: 0px !important;
}
.share-button >>> .meeting-share-button {
  padding: 0px;
}
.align-center {
  text-align: center;
}
.ch-ready-info {
  margin-bottom: 10px;
}
.meeting-status {
  display: flex;
  min-width: 200px;
  justify-content: space-between;
  margin-bottom: 5px;
}
.meeting-actions {
  display: flex;
  justify-content: space-between;
  min-width: 160px;
}
.external-software-input {
  width: 100%;
}
</style>
