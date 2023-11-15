<template>
  <div class="post-response-user">
    <app-avatar
      v-router-link="{ name: profileView, params: post.user }"
      class="post-response-user-avatar cursor-pointer"
      :picture="post.user.profilePhotoURL"
      :name="post.user.displayname"
      size="medium"
    >
    </app-avatar>
    <div
      v-router-link="{ name: profileView, params: post.user }"
      class="post-response-user-name cursor-pointer"
    >
      <div class="cs-textstyle-paragraph-bold">
        {{ name || post.user.username }}
      </div>
      <div class="cs-textstyle-paragraph-extra-small text-light">
        {{ post.createdAt | moment('from') }}
      </div>
    </div>
    <follow-button
      v-if="!isMe"
      :target="post.user"
      size="small"
    ></follow-button>
    <friend-button
      v-if="!isMe && !hideFriend"
      :target="post.user"
      size="small"
    ></friend-button>
  </div>
</template>

<script>
import $auth from '@/services/auth';
import FollowButton from '@/components/general/FollowButton.vue';
import FriendButton from '@/components/general/FriendButton.vue';
import AppAvatar from '@/components/general/Avatar.vue';

export default {
  components: {
    FollowButton,
    FriendButton,
    AppAvatar,
  },
  props: {
    post: {
      type: Object,
      required: true,
    },
    hideFriend: {
      type: Boolean,
      default: false,
    },
    profileView: {
      type: String,
      default: 'Profile',
    },
    name: {
      type: String,
      required: false,
      default: '',
    },
  },
  computed: {
    isMe() {
      return this.post.user.id === $auth.getUserId();
    },
  },
};
</script>

<style scoped>
.post-response-user-avatar {
  margin-right: 10px;
}
.post-response-user-name {
  flex: 1;
}
.post-response-user {
  display: flex;
  padding: 12px 15px;
  align-items: center;
  border-bottom: solid 1px var(--cs-gray-02);
}
</style>
