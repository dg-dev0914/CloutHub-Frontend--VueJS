<template>
  <div class="meeting-chat-message">
    <app-avatar
      ref="menuButton"
      :name="message.postedByUser.displayname"
      :picture="message.postedByUser.profilePhotoURL"
      tabindex="0"
      size="medium"
    />
    <b-popover
      v-if="mounted"
      ref="menuPopover"
      :target="$refs.menuButton"
      placement="left"
      triggers="click blur"
      fallback-placement="counterclockwise"
      custom-class="role-menu"
    >
      <div @click="$refs.menuPopover && $refs.menuPopover.$emit('close')">
        <div class="meeting-member-profile" @click="viewProfile()">
          <app-meeting-member-info :user="message.postedByUser" />
        </div>
      </div>
    </b-popover>
    <div class="meeting-chat-body">
      <div class="meeting-chat-body__header">
        <div class="cs-textstyle-paragraph-small-bold">
          {{ message.postedByUser.displayname }}
        </div>
        <div class="cs-textstyle-paragraph-small">
          {{ message.createdAt | moment('h:mm A') }}
        </div>
      </div>
      <div class="cs-textstyle-paragraph-small">
        {{ message.bodyText }}
      </div>
    </div>
    <app-context-menu v-if="canDelete" placement="left">
      <app-context-menu-item @click="deleteMessage()"
        >Delete</app-context-menu-item
      >
    </app-context-menu>
  </div>
</template>

<script>
import $auth from '@/services/auth';
import AppContextMenu from '@/components/general/ContextMenu.vue';
import AppContextMenuItem from '@/components/general/ContextMenuItem.vue';
import AppAvatar from '@/components/general/Avatar.vue';
import DeleteMeetingMessage from '@/gql/meetings/DeleteMeetingMessage.gql';
import DeletePostMessage from '@/gql/posts/DeletePostMessage.gql';
import ListMeetingMessages from '@/gql/meetings/ListMeetingMessages.gql';
import ListPostMessages from '@/gql/live/ListPostMessages.gql';
import AppMeetingMemberInfo from '@/components/meetings/MeetingMemberInfo.vue';

export default {
  components: {
    AppAvatar,
    AppContextMenu,
    AppContextMenuItem,
    AppMeetingMemberInfo,
  },
  props: {
    message: {
      type: Object,
      required: true,
    },
    meeting: Object,
    postId: {
      type: String,
      default: null,
    },
    isAuthor: {
      type: Boolean
    }
  },
  data() {
    return {
      mounted: false,
    };
  },
  computed: {
    isrefcreated() {
      return !!this.$refs.userProfile;
    },
    canDelete() {
      if (this.postId) {
        return this.message.postedByUserId === $auth.getUserId() || this.isAuthor;
      } else
      return (
        this.message.postedByUserId === $auth.getUserId() ||
        (this.meeting.myMembership &&
          (this.meeting.myMembership.role === 'ADMIN' ||
            this.meeting.myMembership.role === 'MODERATOR'))
      );
    },
  },
  mounted() {
    this.mounted = true;
  },
  methods: {
    viewProfile() {
      this.$router.push({
        name: 'Profile',
        params: this.message.postedByUser,
      });
    },
    async deleteMessage() {
      if (this.postId) {
        await this.$apollo.mutate({
          mutation: DeletePostMessage,
          variables: {
            id: this.message.id,
          },
          refetchQueries: [
            {
              query: ListPostMessages,
              variables: {
                postId: this.postId,
              },
            },
          ],
        });
      } else {
        await this.$apollo.mutate({
          mutation: DeleteMeetingMessage,
          variables: {
            id: this.message.id,
          },
          refetchQueries: [
            {
              query: ListMeetingMessages,
              variables: {
                meetingId: this.message.meetingId,
              },
            },
          ],
        });
      }
    },
  },
};
</script>
<style scoped>
.meeting-chat-message {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}
.meeting-chat-body {
  flex: 1;
  background: var(--cs-gray-01);
  padding: 5px;
  border-radius: 5px;
  width: 120px;
  word-wrap: break-word;
}
.meeting-chat-body__header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-family: var(--cs-font-primary);
}
.meeting-chat-body__header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-family: var(--cs-font-primary);
}
</style>
