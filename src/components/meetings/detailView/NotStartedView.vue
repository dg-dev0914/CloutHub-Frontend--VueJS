<template>
  <div class="ch-meeting-card-wrap">
    <div class="btn-wrap">
      <cs-button
        v-if="canModerate"
        variant="primary"
        size="small"
        @click="$emit('manageMeeting')"
      >
        Manage Meeting
      </cs-button>
      <app-meeting-start-button
        v-if="canModerate"
        class="start-btn"
        :meeting="meeting"
      />
      <app-agora-rtmp-button
        v-if="role === 'ADMIN' && meeting.liveStreamMode"
        class="rtmp-btn"
        text="Get RTMP Code"
        fill="solid"
        size="small"
        :meeting="meeting"
      />
      <app-meeting-share-button
        :meeting="meeting"
        size="small"
        class="share-button"
      />
      <app-meeting-invite-button :meeting="meeting" />
    </div>
    <cs-card no-divider class="ch-meeting-card" media-position="left">
      <app-img slot="media" :src="meeting.picture" class="meeting-image" />
      <div slot="header">
        {{ meeting.name }}
      </div>
      <div
        v-if="meeting && meeting.description"
        slot="body"
        class="ch-meeting-description"
      >
        {{ meeting.description }}
      </div>
    </cs-card>
    <div class="meeting-data">
      <div class="ch-meeting-meta-data">
        <span v-if="!isMeetingLive">Meeting will begin</span>
        <div class="cs-textstyle-section-heading">
          {{ displayTime }}
        </div>
        <div v-if="isMeetingLive" class="not-started__is-live-label">Meeting IS LIVE</div>
        <div
          v-if="
            meeting.myMembership &&
            meeting.myMembership.ticketStatus === 'PURCHASED'
          ">
        <div class="ticket-info">Ticket Purchased</div>
        <div v-if="user">A receipt has been sent to {{ user.email }}</div>
      </div>
      <div v-if="
            meeting.myMembership && meeting.myMembership.ticketStatus === 'FREE'
          "
          class="ticket-info"
        >
          Free Ticket
        </div>
        <div class="cs-textstyle-paragraph-small-bold ch-people-list">
          Hosts
        </div>
        <div class="hosts">
          <div v-for="leader in leaderMembers" :key="leader.id" class="host">
            <app-avatar
              :picture="leader.user.profilePhotoURL"
              :name="leader.user.displayname"
              variant="primary"
              size="small"
            />
            {{ leader.user.username }}
          </div>
        </div>
        <div v-if="isMeetingLive" class="join-button">
          <cs-button size="small" class="cs-button" uppercase block @click="switchModalVisibilityTo('join', true)">
            Join
          </cs-button>
        </div>
      </div>
    </div>
    <div class="ch-meeting-footer">
      <app-meeting-leave-button v-if="isMember" variant="default" class="ch-leave-btn" />
    </div>
    <app-modal :show="modalsVisibility['join']" @close="switchModalVisibilityTo('join')">
      <div class="join-modal">
        <div class="join-modal__title">
          Join Meeting
        </div>
        <div class="join-modal__description">
          To attend this meeting, choose one of the following options.
        </div>
        <div class="join-modal__buttons">
          <cs-button size="small" class="join-modal__buttons__button" :to="`/login?redirect=${this.$router.currentRoute.path}`">Sign In</cs-button>
          <cs-button size="small" class="join-modal__buttons__button" :to="`/onboarding/signup/nameform?redirect=${this.$router.currentRoute.path}`">Create an Account</cs-button>
          <!--<cs-button size="small" class="join-modal__buttons__button" @click="switchModalVisibilityTo('asGuest', true)">Join as a Guest</cs-button>-->
        </div>
      </div>
    </app-modal>
    <app-modal :show="modalsVisibility['asGuest']" title="Join as a Guest" @close="switchModalVisibilityTo('asGuest')">
      <div class="as-guest-modal">
        <p class="as-guest-modal__description">
          To join the meeting as a Guest, enter the name you would like to use, select and avatar and enter your email down below. Once you�re set up, you can interact in the event.
        </p>
        <div class="as-guest-modal-form">
          <div class="as-guest-modal-form__inputs">
            <div class="as-guest-modal__name-input">
              <cs-input
                  v-model.trim="guest.displayName"
                  placeholder="Enter your display name"
                  label="Name"
                  :maxLength="10"
                  required
              />
              <span class="as-guest-modal__name-input__chars-counter">
            {{ guestNameLengthTitle }}
          </span>
            </div>
            <div class="as-guest-modal__avatar">
              <div class="guest-avatar">
                <img v-if="guest.avatarURL" :src="guest.avatarURL" alt="guest-avatar">
              </div>
              <span class="as-guest-modal__avatar-title">Select an avatar on the right.</span>
            </div>
            <div class="as-guest-modal__email-input">
              <cs-input
                  v-model.trim="guest.email"
                  placeholder="Enter your email"
                  label="Email"
                  required
              />
            </div>
          </div>
          <div class="as-guest-modal-form__avatars-list">
            <div class="avatar-modal__avatar" :class="{'avatar-modal__avatar--chosen': guest.avatarURL === avatarURL}" v-for="avatarURL in GUEST_AVATARS" @click="chooseAvatar(avatarURL)">
              <img :src="avatarURL" alt="guest avatar">
            </div>
          </div>
        </div>
        <div class="as-guest-modal__done-btn" :class="{'as-guest-modal__done-btn_loading': isGuestSigningUp}">
          <cs-button
              v-if="!isGuestSigningUp"
              size="small"
              uppercase
              :disabled="isGuestDoneBtnDisabled"
              @click="signupGuest"
          >
            Done
          </cs-button>
          <app-spinner v-if="isGuestSigningUp"/>
        </div>
      </div>
    </app-modal>
  </div>
</template>

<script>
import AppImg from '@/components/general/Img.vue';
import AppAvatar from '@/components/general/Avatar.vue';
import ListMeetingMembers from '@/gql/meetings/ListMeetingMembers.gql';
import AppMeetingLeaveButton from '@/components/meetings/buttons/MeetingLeaveButton.vue';
import AppMeetingShareButton from '@/components/meetings/buttons/MeetingShareButton.vue';
import GetMe from '@/gql/general/GetMe.gql';
import AppMeetingStartButton from '@/components/meetings/buttons/MeetingStartButton.vue';
import AppAgoraRtmpButton from '@/components/meetings/detailView/AgoraRTMPButton.vue';
import AppMeetingInviteButton from '@/components/meetings/buttons/MeetingInviteButton.vue';
import AppModal from "@/components/general/Modal";
import AppSpinner from "@/components/general/Spinner";
import $popups from '@/services/popups';
import RegisterGuest from '@/gql/general/RegisterGuest.gql';

export default {
  components: {
    AppImg,
    AppAvatar,
    AppAgoraRtmpButton,
    AppMeetingLeaveButton,
    AppMeetingShareButton,
    AppMeetingStartButton,
    AppMeetingInviteButton,
    AppModal,
    AppSpinner,
  },
  props: {
    meeting: {
      type: Object,
      required: true,
    },
  },
  apollo: {
    user: {
      query: GetMe,
      skip() {
        return !this.isMember;
      }
    },
    members: {
      query: ListMeetingMembers,
      variables() {
        return {
          meetingId: this.meeting.id,
        };
      },
    },
  },
  computed: {
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
    leaderMembers() {
      if (this.members) {
        const leaders = this.members.filter((m) => ['ADMIN', 'MODERATOR', 'PRESENTER'].includes(m.role));
        return leaders.sort((a, b) => (a.role < b.role ? -1 : 1));
      }
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
    isMember() {
      return this.meeting && !!this.meeting.myMembership;
    },
    isMeetingLive() {
      return this.meeting.status !== 'NOT_STARTED';
    },
    guestNameLengthTitle() {
      return `${this.guest.displayName.length}/10 characters`
    },
    isGuestDoneBtnDisabled() {
      return !this.guest.displayName || !this.guest.email || !this.guest.avatarURL;
    },
  },
  data() {
    return {
      modalsVisibility: {
        join: false,
        asGuest: false,
        welcome: false,
      },
      GUEST_AVATARS: [
        'https://chforum.backendcdn.com/291f0e8d-212f-4cee-8b42-7c57bc2b48d7?',
        'https://chforum.backendcdn.com/61a9da40-7011-4815-a5bd-7c787a2bb980?',
        'https://chforum.backendcdn.com/604afb77-f851-4fa2-b80e-cc62e8208d91?',
        'https://chforum.backendcdn.com/5af4bb25-9845-4fa5-a8f8-9a60111d0402?',
        'https://chforum.backendcdn.com/a0538e8f-c581-48fd-8cca-66cc9081bc96?',
        'https://chforum.backendcdn.com/b017dd6c-dade-4c3a-8723-b1f9dda37c0b?',
        'https://chforum.backendcdn.com/aa542d0e-8ddb-402a-a180-147359929df7?',
        'https://chforum.backendcdn.com/a42e545f-87a4-49fb-a0d5-f8a41bfedf3e?',
        'https://chforum.backendcdn.com/f414e0fe-fc1a-472a-872a-f4b190e30e0b?',
        'https://chforum.backendcdn.com/758c5b4f-0b61-4a8b-bd8c-e1fd596f6d82?',
        'https://chforum.backendcdn.com/cd36b9c1-bd97-4ac9-b1ab-1d9bf22c4cc5?',
        'https://chforum.backendcdn.com/a75f15d2-8a5c-4a76-b794-a95e822b4f25?',
      ],
      guest: {
        displayName: '',
        email: '',
        avatarURL: null,
      },
      isGuestSigningUp: false,
    }
  },
  mounted() {
    if (window.location !== window.parent.location) {
      window.parent.location.href = window.location.href;
    }
  },
  methods: {
    switchModalVisibilityTo(modalName, operation) {
      this.modalsVisibility[modalName] = operation;
    },
    chooseAvatar(avatarURL) {
      this.guest.avatarURL = avatarURL;
    },
    async signupGuest() {
      try {
        this.isGuestSigningUp = true;
        const res = await this.$apollo.mutate({
          mutation: RegisterGuest,
          variables: {
            email: this.guest.email,
            displayName: this.guest.displayName,
            avatarURL: this.guest.avatarURL,
          },
        })
        localStorage.access_token = res.data.token;
        window.location.reload();
      } catch (e) {
        console.error(e);
        await $popups.alert(e.message);
      } finally {
        this.isGuestSigningUp = false;
      }
    },
  }
};
</script>

<style scoped>
.ch-meeting-card-wrap {
  margin: 0 auto;
  padding: 80px;
  background: white;
  height: fit-content;
  max-width: 850px;
  position: relative;
}
.ch-meeting-card {
  /* padding: 80px; */
}
.meeting-image {
  padding-right: 20px;
}

.meeting-data {
  display: flex;
  justify-content: center;
  text-align: center;
}
.ch-people-list {
  margin-top: 20px;
}
.ch-meeting-footer {
  width: 100%;
  background: black;
  /* margin-top: 20px; */
  height: 70px;
  position: absolute;
  left: 0;
  bottom: 0;
  color: white;
}

.ch-leave-btn {
  display: flex !important;
  justify-content: center;
  align-items: center;
  margin: auto !important;
  margin-top: 10px !important;
}
.btn-wrap {
  display: flex;
  gap: 5px;
}
.ch-meeting-description {
  max-height: 300px;
  overflow: auto;
  font-size: 12px;
  color: #4a4a4a;
}
.ticket-info {
  border: dashed 2px var(--cs-primary-base);
  color: var(--cs-primary-base);
  margin-top: 10px;
  padding: 10px;
  border-radius: 10px;
}
.rtmp-btn {
  text-align: center;
}
.hosts {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin: 15px 0;
}
.host {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.not-started__is-live-label {
  color: #e02020;
  text-align: center;
  font-weight: 900;
}
.join-button {
  margin: 0 auto 5px;
  max-width: 110px;
}
.join-modal__title {
  font-family: Lato, serif;
  font-size: 24px;
  font-weight: bold;
  line-height: normal;
  text-align: center;
  color: #000;
  margin-bottom: 25px;
}
.join-modal__description {
  font-family: Lato, serif;
  font-size: 14px;
  line-height: normal;
  letter-spacing: normal;
  text-align: center;
  color: #4a5359;
  margin-bottom: 40px;
}
.join-modal__buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.join-modal__buttons__button {
  width: 192px;
  margin-bottom: 35px;
}
.as-guest-modal-form {
  display: flex;
}
.as-guest-modal-form__inputs {
  flex: 1;
  margin-right: 15px;
}
.as-guest-modal-form__avatars-list {
  flex: 1;
  margin-left: 15px;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
}
.as-guest-modal__name-input {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}
.as-guest-modal__name-input__chars-counter {
  font-size: 12px;
  align-self: flex-end;
  color: #4a4a4a;
}
.as-guest-modal__email-input {
  display: flex;
  flex-direction: column;
}
.as-guest-modal__avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.guest-avatar {
  width: 128px;
  height: 128px;
  border-radius: 50%;
  background-color: #d8d8d8;
  margin-bottom: 10px;
  text-align: center;
  line-height: 128px;
}
.guest-avatar img {
  width: 128px;
}
.as-guest-modal__avatar-title {
  font-family: Lato, serif;
  font-size: 12px;
  line-height: normal;
  color: #4a5359;
  margin-bottom: 25px;
}
.avatar-modal__avatar {
  border-radius: 50%;
  border: 7px solid transparent;
}
.avatar-modal__avatar:hover {
  cursor: pointer;
}
.avatar-modal__avatar img {
  width: 85px;
}
.avatar-modal__avatar--chosen {
  padding: 3px;
  border: solid 4px #e2896e;
}
.as-guest-modal__done-btn {
  display: flex;
  justify-content: flex-end;
  margin-top: 13px;
}
.as-guest-modal__done-btn_loading {
  display: flex;
  justify-content: center;
  margin-top: 0;
}
.as-guest-modal__done-btn button {
  width: 160px;
  margin-left: auto;
}
</style>
