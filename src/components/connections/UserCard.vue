<template>
  <div class="user-item" :class="itemClass">
    <div class="user-card">
      <app-avatar
        v-router-link="{ name: 'Profile', params: user }"
        class="ch-avatar cursor-pointer"
        :picture="user.profilePhotoURL"
        :name="user.displayname"
        variant="primary"
        size="medium"
      ></app-avatar>
      <div class="user-card-details">
        <div
          v-router-link="{ name: 'Profile', params: user }"
          class="cs-textstyle-paragraph-bold cursor-pointer"
        >
          <app-username :user="user" />
        </div>
        <div
          class="cs-textstyle-paragraph-small user-card-bio"
          style="height: 42px"
        >
          <span v-if="user.bio">{{ user.bio }}</span>
          <span v-else class="cs-gray-04">No bio</span>
        </div>
      </div>
      <div class="user-response-buttons">
        <app-follow-button
          :target="user"
          size="small"
          @changed-follow="statusChanged"
        ></app-follow-button>
      </div>
    </div>
  </div>
</template>

<script>
import AppAvatar from '@/components/general/Avatar.vue';
import AppFollowButton from '@/components/general/FollowButton.vue';
import AppFriendButton from '@/components/general/FriendButton.vue';
import AppUsername from '@/components/general/Username.vue';

export default {
  components: {
    AppAvatar,
    AppFollowButton,
    AppFriendButton,
    AppUsername,
  },
  props: {
    user: {
      type: Object,
      required: true,
    },
    itemClass: {
      type: String,
      required: false,
      default: 'col-md-6',
    },
  },
  methods: {
    statusChanged() {
      this.$emit('status-changed');
    },
  },
};
</script>

<style scoped>
.user-item {
  padding: 10px;
  padding-top: 10px;
  padding-bottom: 0px;
}
.user-card {
  display: flex;
  gap: 10px;
  background-color: white;
  padding: 15px;
  border-radius: 0px;
}
.user-card-details {
  overflow: hidden;
  flex: 1;
}
.user-card-bio {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.user-response-buttons {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.user-response-buttons >>> button {
  width: 120px;
  margin-left: 0px !important;
}
</style>
