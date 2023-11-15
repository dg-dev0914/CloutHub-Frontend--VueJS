<template lang="html">
  <app-modal :show="show" title="Notification Options" @close="$emit('close')">
    <div class="mb-4">
      <div class="ch-notifcations__apply cs-textstyle-paragraph">
        Please notify me when:
      </div>
    </div>
    <app-toggle
      v-model="notification.connectionAccepted"
      label="Someone accepts my friend request"
    />

    <app-toggle
      v-model="notification.newComments"
      label="Comments on my post"
    />
    <app-toggle
      v-model="notification.newReplies"
      label="Replies to my comment"
    />

    <app-toggle v-model="notification.newFollowers" label="Follow me" />
    <app-toggle
      v-model="notification.newLikes"
      label="Likes my post or comment"
    />
    <app-toggle v-model="notification.postShare" label="Shares my post" />
    <!-- <app-toggle v-model="notification.pendingReview" label="Post Reviewed" />
    <app-toggle v-model="notification.rejectedReview" label="Post Rejected" />
    <app-toggle v-model="notification.completedReview" label="Post Approved" /> -->
    <app-toggle
      v-model="notification.inviteMeeting"
      label="Invites me to an event"
    />
    <app-toggle v-model="notification.meetingStart" label="Starts an event I'm invited to" />
    <app-toggle
      v-model="notification.leaderMeetingInvitation"
      label="Makes me a leader in an event"
    />
    <app-toggle v-model="notification.newVideo" label="A channel I subscribe to posts a video" />
    <app-toggle
      v-model="notification.liveStreaming"
      label="A channel I subscribe to starts live streaming"
    />
    <app-toggle
      v-model="notification.newStoryPublish"
      label="A news agency I follow publishes a new story"
    />

    <cs-button class="float-right px-5 mt-3" @click="setNotification"
      >Save</cs-button
    >
  </app-modal>
</template>

<script>
import AppModal from '@/components/general/Modal.vue';
import AppToggle from '@/components/general/Toggle.vue';
import GetNotificationPreferences from '@/gql/general/GetNotificationPreferences.gql';
import SetNotificationPreferences from '@/gql/general/SetNotificationPreferences.gql';
import _ from 'lodash';

export default {
  components: {
    AppModal,
    AppToggle,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  apollo: {
    get_notification_preferences: {
      query: GetNotificationPreferences,
      variables() {
        return {};
      },
    },
  },
  data() {
    return {
      notification: {},
    };
  },
  mounted() {
    this.getNotification();
  },
  methods: {
    async getNotification() {
      // get notification
      const notificationQuery = await this.$apollo.query({
        query: GetNotificationPreferences,
      });
      // set in object
      const notification = notificationQuery.data.get_notification_preferences;
      this.notification = _.clone(notification);
    },
    async setNotification() {
      const preferencesObj = {
        connectionAccepted: this.notification.connectionAccepted,
        newComments: this.notification.newComments,
        newReplies: this.notification.newReplies,
        newFollowers: this.notification.newFollowers,
        newLikes: this.notification.newLikes,
        newMentions: this.notification.newMentions,
        postShare: this.notification.postShare,
        newStoryPublish: this.notification.newStoryPublish,
        inviteMeeting: this.notification.inviteMeeting,
        meetingStart: this.notification.meetingStart,
        leaderMeetingInvitation: this.notification.leaderMeetingInvitation,
        newVideo: this.notification.newVideo,
        liveStreaming: this.notification.liveStreaming,
        pendingReview: this.notification.pendingReview,
        rejectedReview: this.notification.rejectedReview,
        completedReview: this.notification.completedReview,
      };
      const preferences = JSON.parse(JSON.stringify(preferencesObj));
      await this.$apollo.mutate({
        mutation: SetNotificationPreferences,
        variables: { preferences },
      });
      this.$emit('close');
    },
  },
};
</script>

<style scoped>
.ch-notifcations__apply {
  color: var(--cs-gray-05);
}
</style>
