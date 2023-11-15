<template>
  <div class="meeting-header">
    <div class="meeting-header__profile">
      <app-img
        :src="meeting.picture"
        auto-optimize
        class="meeting-header__image"
      />
      <div class="meeting-header__info">
        <div class="meeting-header__title">
          {{ meeting.name }}
          <i
            v-if="meeting.privacy === 'private'"
            class="meeting-header__private-icon cs-icons-lock"
          />
        </div>
        <div class="cs-textstyle-paragraph meeting-header__description">
          {{ meeting.description }}
        </div>
        <div class="meeting-header__footer">
          <div class="cs-textstyle-paragraph-small">
            <span v-if="isScheduled">Starts at</span>
            <span v-else>Started on</span>
            {{ displayTime }}
          </div>
          <span class="cs-textstyle-paragraph-small">
            {{ meeting.membersCount }}
            {{ meeting.membersCount === 1 ? 'Attendee' : 'Attendees' }}
          </span>
        </div>
      </div>
    </div>
    <div v-if="showButtons" class="meeting-header__buttons">
      <cs-button v-if="canLeaveQueue" size="small" @click="setRole('VIEWER')">
        Leave Queue
      </cs-button>
      <cs-button v-if="canRiseHand" size="small" @click="raiseHand()">
        ✋Raise Hand
      </cs-button>
    </div>
    <app-meeting-user-menu
      :meeting="meeting"
      @signin="$emit('openSigninModal')"
      @signup="$emit('openSignupModal')"
    />
  </div>
</template>
<script>
import $auth from '@/services/auth';
import $popups from '@/services/popups';
import $socket from '@/services/socket';
import $meetingsApi from '@/api/meetings';

import AppImg from '@/components/general/Img.vue';
import AppMeetingUserMenu from '@/components/meetings/MeetingUserMenu.vue';

import SetMeetingMemberRole from '@/gql/meetings/SetMeetingMemberRole.gql';

export default {
  components: {
    AppImg,
    AppMeetingUserMenu,
  },
  props: {
    meeting: {
      type: Object,
      default: () => {},
    },
    isAdmin: Boolean,
  },
  computed: {
    isQueueAble() {
      return this.meeting.status === 'LIVE' && this.meeting.enableQueue;
    },
    isAudience() {
      return this.role === 'VIEWER' || this.role === 'ATTENDING' || !this.role;
    },
    isInQueue() {
      return this.role === 'QUEUE';
    },
    showButtons() {
      return (this.isInQueue || this.isAudience) && this.isQueueAble;
    },
    canRiseHand() {
      return this.isAudience && this.isQueueAble;
    },
    canLeaveQueue() {
      return this.role === 'QUEUE';
    },
    role() {
      return (
        this.meeting &&
        this.meeting.myMembership &&
        this.meeting.myMembership.role
      );
    },
    isScheduled() {
      return new Date(this.meeting.startTime).getTime() > new Date().getTime();
    },
    displayTime() {
      const currentUserTimezone = this.$moment.tz.guess();
      return (
        this.meeting &&
        this.$moment
          .utc(this.meeting.startTime)
          .local()
          .tz(currentUserTimezone)
          .format('MMM D [|] h:mm A z')
      );
    },
  },
  methods: {
    async setRole(role) {
      await this.$apollo.mutate({
        mutation: SetMeetingMemberRole,
        variables: {
          meetingId: this.meeting.id,
          userId: $auth.getUserId(),
          role,
        },
      });
      $socket.sendRoom('meeting', this.meeting.id, 'meeting-members-modified');
    },
    raiseHand() {
      this.setRole('QUEUE');
    },
    async signup() {
      await $meetingsApi.signup(this.meeting.id);
    },
    async unsignup() {
      try {
        await $meetingsApi.unsignup(this.meeting.id);
      } catch (e) {
        $popups.alert(
          'There was an error saving. Please try again or contact support.'
        );
        throw e;
      }
    },
  },
};
</script>

<style scoped>
.meeting-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 0 15px 0 0;
  color: #4a4a4a;
  background-color: white;
}
.meeting-header__title {
  font-family: var(--cs-font-primary);
  font-size: 18px;
  font-weight: bold;
}
.meeting-header__info {
  min-width: 370px;
}
.meeting-header__profile {
  display: flex;
  gap: 10px;
  align-items: center;
}
.meeting-header__image {
  width: 100px;
  height: 100px;
  object-fit: cover;
}
.meeting-header__private-icon {
  color: var(--cs-primary-base);
  margin-right: 1px;
}
.meeting-header__description {
  margin: 10px 0;
  max-height: 120px;
  max-width: 500px;
  font-size: 16px;
  color: #4a4a4a;
  line-height: 1;
}
.meeting-header__footer {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin: 3px 0;
}
.meeting-header__buttons {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 130px;
}
</style>
