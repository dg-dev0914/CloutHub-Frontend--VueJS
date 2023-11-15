<template>
  <div class="ch-meeting-card-wrap">
    <cs-card no-divider class="ch-meeting-card" media-position="left">
      <app-img slot="media" :src="meeting.picture" class="meeting-image" />
      <div slot="header">
        {{ meeting.name }}
      </div>
      <div slot="body" class="ch-meeting-description">
        {{ meeting.description }}
      </div>
    </cs-card>
    <div v-if="meeting" class="meeting-data">
      <div
        v-if="meeting.myMembership && meeting.myMembership.role === 'INVITED'"
      >
        You are invited to this event
      </div>
      <div
        v-if="
          meeting.myMembership && meeting.myMembership.ticketStatus === 'FREE'
        "
      >
        Please accept your free ticket :
        <cs-button
          variant="primary"
          size="small"
          class="accept-btn"
          @click="acceptInvite"
        >
          Accept
        </cs-button>
      </div>
      <div v-else-if="userId" class="ticket-btn">
        <div class="cs-textstyle-paragraph-small" style="margin-bottom: 10px">
          Buy a ticket to attend this event.
        </div>
        <cs-button variant="primary" :href="paymentUrl">
          Buy ticket: ${{ meeting.ticketPrice }}
        </cs-button>
        <img
          class="cc-logos"
          src="https://chforum.backendcdn.com/us-west-2:5a31b81d-68e1-4f92-8e36-5d8c94f25048/3bf6d9b7-1019-45a1-8ba1-d3a6fac16af5.png"
        />
        <div>
          For help, for questions about your transactions, or to request a
          refund, please contact the organization office at
          <a href="mailto:support@clouthub.com">support@clouthub.com</a>
        </div>
      </div>
      <div
        v-if="!userId && meeting.ticketPrice"
        style="border: dashed 1px #ccc; padding: 20px"
      >
        <div class="cs-textstyle-paragraph-small" style="margin-bottom: 10px">
          This is a ticketed event. You must be a CloutHub member to purchase a
          ${{ meeting.ticketPrice }} ticket.
        </div>
        <cs-button variant="primary" @click="join()">
          Sign-In or Sign-Up
        </cs-button>
      </div>
      <div class="cs-textstyle-paragraph-small-bold ch-people-list">
        Hosts
      </div>
      <div style="display:flex; flex-direction:column; align-items: center;">
        <app-avatar :picture="meeting.host.profilePhotoURL" :name="meeting.host.displayname" variant="primary" size="small" class="mb-1" />
        {{meeting.host.username}}
      </div>
    </div>
    <div class="ch-meeting-footer">
      <app-meeting-leave-button variant="default" class="ch-leave-btn" />
    </div>
  </div>
</template>

<script>
import AppMeetingLeaveButton from '@/components/meetings/buttons/MeetingLeaveButton.vue';
import AppImg from '@/components/general/Img.vue';
import AcceptMeetingInvite from '@/gql/meetings/AcceptMeetingInvite.gql';
import $apollo from '@/services/apollo';
import $auth from '@/services/auth';
import AppAvatar from '@/components/general/Avatar.vue';
// const paymentUrl = process.env.VUE_APP_PAY_ENDPOINT;

export default {
  components: {
    AppMeetingLeaveButton,
    AppImg,
    AppAvatar,
  },
  props: {
    meeting: {
      type: Object,
      required: true,
    },
  },
  data() {
    const userId = $auth.getUserId();
    const displayTime = this.$moment(this.meeting.startTime).format(
      'dddd, MMMM Do YYYY, h:mm a'
    );
    const next = encodeURIComponent(window.location.href);
    const env = process.env.VUE_APP_GRAPH_ENDPOINT.includes('dev')
      ? 'dd'
      : 'dp';
    const params = new URLSearchParams({
      meeting_id: this.meeting.id,
      meeting_name: this.meeting.name,
      user_id: userId,
      start_time: displayTime,
      amount: this.meeting.ticketPrice,
      next,
      env,
    });
    return {
      userId,
      paymentUrl: `${process.env.VUE_APP_PAY_ENDPOINT}/rp/?${params.toString()}`,
    };
  },
  mounted() {
    const error = this.$route.query.error;
    if (window.location !== window.parent.location) {
      window.parent.location.href = window.location.href;
    } else if (error) {
      alert(error);
    }
  },
  methods: {
    join() {
      const path = encodeURIComponent(`/meetingdetail/${this.meeting.id}`);
      window.location.href = `/#/onboarding?redirect=${path}`;
    },
    async acceptInvite() {
      await $apollo.mutate({
        mutation: AcceptMeetingInvite,
        variables: {
          meetingId: this.meeting.id,
        },
        update: () => {
          this.$emit('refetchMeeting');
        },
      });
    },
  },
};
</script>

<style scoped>
.ch-meeting-card-wrap {
  margin: 0px auto;
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
  justify-content: center;
  text-align: center;
}
.ch-meeting-meta-data >>> .ch-avatar__content {
  margin: auto;
}
.ticket-btn {
  margin-bottom: 10px;
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
  /* color: white !important; */
}
.ch-start-meeting {
  /* display: block; */
  margin-right: 5px;
}
.admin-menu {
  position: absolute;
  right: 5 px;
  right: 23px;
  font-size: 27px;
}
.btn-wrap {
  display: flex;
}
.ch-meeting-description {
  max-height: 300px;
  overflow: scroll;
}
.accept-btn {
  display: block !important;
  margin: auto;
}
.cc-logos {
  width: 120px;
  display: block;
  margin-left: auto;
  margin-right: auto;
  margin-top: 15px;
  margin-bottom: 15px;
}
</style>
