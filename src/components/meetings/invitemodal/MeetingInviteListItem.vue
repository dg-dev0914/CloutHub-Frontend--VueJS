<template>
  <div class="user-list-person">
    <div class="user-list__checkbox">
      <app-meeting-invite-checkbox :checked="checked" />
      <app-avatar
        class="user-list-person-avatar"
        size="small"
        :name="userName"
        :picture="userPicture"
      />
      <div class="user-list-person-names">
        <div class="cs-textstyle-paragraph-bold">
          <app-username v-if="user" :user="user" type="displayname" />
          <span v-else>{{ userName }}</span>
        </div>
        <div class="cs-textstyle-paragraph-small">
          {{ userDescription }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AppMeetingInviteCheckbox from '@/components/meetings/invitemodal/MeetingInviteCheckbox.vue';
import AppAvatar from '@/components/general/Avatar.vue';
import AppUsername from '@/components/general/Username.vue';

export default {
  components: {
    AppMeetingInviteCheckbox,
    AppAvatar,
    AppUsername,
  },
  props: {
    user: {
      type: Object,
    },
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    picture: {
      type: String,
    },
    checked: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    userName() {
      if (this.name) return this.name;
      if (this.user) return this.user.displayname;
      return "";
    },
    userDescription() {
      if (this.description) return this.description;
      if (this.user) return this.user.username;
      return "";
    },
    userPicture() {
      if (this.picture) return this.picture;
      if (this.user) return this.user.profilePhotoURL;
      return null;
    },
  },
}
</script>

<style scoped>
.user-list__checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  cursor: pointer;
}
</style>
