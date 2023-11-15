<template>
  <div
    v-if="!notification.lastActor.myRelationship.isBlocked"
    class="notification-item"
  >
    <app-avatar
      v-router-link="{ name: 'Profile', params: notification.lastActor }"
      :picture="notification.lastActor.profilePhotoURL"
      :name="notification.lastActor.username"
      size="small"
      class="notification-item-avatar"
    />
    <div @click="viewDetails()">
      <div class="width-setting">
        <span class="cs-textstyle-paragraph-small-bold">
          {{ notification.lastActor.username }}
        </span>
        <span class="cs-textstyle-paragraph-small">
          {{ more }}
          <template v-if="!loading">
            {{ description }}
          </template>
          <template v-else> Loading... </template>
        </span>
        <!-- Add the following slot to the template -->
        <slot name="more"></slot>
      </div>
      <div class="cs-textstyle-paragraph-small">
        {{ notification.updatedAt | moment('from') }}
      </div>
    </div>
  </div>
</template>

<script>
import AppAvatar from '@/components/general/Avatar.vue';
import GetPostType from '@/gql/posts/GetPostType.gql';
import $apollo from '@/services/apollo';

async function getPostType(postId) {
  const resp = await $apollo.query({
    query: GetPostType,
    variables: {
      id: postId,
    },
  });
  let postType = resp.data.post.type;

  // Videos posted on the timeline do not have correct type field
  if (resp.data.post.video) {
    postType = 'video';
  }

  return postType;
}

export default {
  components: {
    AppAvatar,
  },
  props: {
    notification: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      postType: undefined,
    };
  },
  computed: {
    isModerationNotification() {
      return ['pendingReview', 'rejectedReview'].includes(
        this.notification.type
      );
    },
    description() {
      const descriptionMap = {
        follower: 'followed you.',
        like: 'liked your post.',
        postMention: 'mentioned you in a post.',
        newMention: 'mentioned you in a post.',
        newComment: 'commented on your post.',
        replyComment: 'replied to your comment.',
        share: 'shared your post.',
        glimpseLike: 'liked your video.',
        newVideo: 'uploaded a new video',
        liveStreaming: 'is livestreaming',
        react: 'reacted to your post.',
        reaction: 'reacted to your post.', // For backwards compatibility
        connectionAccepted: 'accepted your friend request.',
        pendingReview: 'Your post is being reviewed by our safety team.',
        pendingReview_images:
          'The content of an image you are posting was not properly recognized by the Artificial Intelligence we use to prevent inappropriate images. It has been sent to a staff person to review it. This should only take a moment. Thank you for your understanding.',
        pendingReview_video:
          'The content of a video you are posting was not properly recognized by the Artificial Intelligence we use to prevent inappropriate videos. It has been sent to a staff person to review it. This should only take a moment. Thank you for your understanding.',
        completedReview:
          'Your image or video reviewed by our AI was fine. Thank you for contributing to our site!',
        rejectedReview: 'Your post has been rejected by our safety team.',
        rejectedReview_images:
          'It appears the image you are attempting to post may not comply with CloutHub’s Terms of Use. Please choose a different image for your post and try again. For questions, contact support@clouthub.com',
        rejectedReview_video:
          'It appears the video you are attempting to post may not comply with CloutHub’s Terms of Use. Please choose a different video for your post and try again. For questions, contact support@clouthub.com',
        newStoryPublished: 'published a story.',
        channelSubscribeInvitation: this.notification.lastActor
          ? `has invited you to subscribe to ${this.notification.lastActor.channelName}`
          : 'invited you to subscribe to their channel',
        newAnnouncement: `added a new announcement to "${
          this.notification.announcement
            ? this.notification.announcement.group.name
            : ''
        }"`,
        meetingInvitation: this.notification.meetingId
          ? ` has invited you to the event ${this.notification.meeting.name} which starts on ${this.displayTime} `
          : 'invited you',
        meetingStarted: this.notification.meetingId
          ? `has started a event  ${this.notification.meeting.name} on ${this.displayTime}  `
          : 'event started',
        leaderMeetingInvitation: this.notification.meetingId
          ? `has made you leader of a event ${this.notification.meeting.name} which starts on ${this.displayTime} `
          : 'has made you leader event',
      };
      let { type } = this.notification;
      if (this.isModerationNotification && this.postType) {
        type = `${type}_${this.postType}`;
      }

      const description = descriptionMap[type] || type;

      return description;
    },
    displayTime() {
      const currentUserTimezone = this.$moment.tz.guess();
      return (
        this.notification.meeting &&
        this.$moment
          .utc(this.notification.meeting.startTime)
          .local()
          .tz(currentUserTimezone)
          .format('MMM D [|] h:mmA z')
      );
    },

    more() {
      if (this.notification.itemCount === 2) {
        return 'and 1 other';
      }
      if (this.notification.itemCount > 2) {
        return `and ${this.notification.itemCount - 1} others`;
      }
      return '';
    },
  },
  async created() {
    if (this.notification.postId && this.isModerationNotification) {
      this.loading = true;
      this.postType = await getPostType(this.notification.postId);
      this.loading = false;
    }
  },
  methods: {
    viewDetails() {
      if (this.notification.type === 'liveStreaming') {
        this.$router.push({
          name: 'VideoDetail',
          params: { id: this.notification.postId },
        });
      } else if (this.notification.postId) {
        this.$router.push({
          name: 'PostDetail',
          params: { id: this.notification.postId },
        });
      } else if (this.notification.meetingId) {
        this.$router.push({
          name: 'MeetingDetail',
          params: this.notification.meeting,
        });
      } else if (this.notification.type === 'newAnnouncement') {
        if (this.$route.params.id !== this.notification.id) {
          this.$router.push({
            name: 'Announcement',
            params: {
              id: this.notification.announcement.id,
            },
          });
        }
        // $bus.$emit('announcement-modal', {
        //   notification: this.notification,
        //   group: this.notification.announcement.group,
        // });
      } else if (this.notification.type === 'channelSubscribeInvitation') {
        this.$router.push({
          name: 'VideoProfile',
          params: { id: this.notification.actorId },
        });
      } else {
        this.$router.push({
          name: 'Profile',
          params: this.notification.lastActor,
        });
      }
    },
  },
};
</script>

<style scoped>
.notification-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 10px 10px;
  border-bottom: 1px solid var(--cs-gray-02);
  cursor: pointer;
}
.notification-item-avatar {
  margin-right: 16px;
}
.width-setting {
  word-break: break-word;
}
</style>
