<template>
  <div v-if="user" class="avatar">
    <app-avatar
      id="navbarAvatar"
      size="small"
      :picture="user.profilePhotoURL"
      :name="name"
      tabindex="-1"
    >
    </app-avatar>
    <b-popover
      ref="profilePopover"
      target="navbarAvatar"
      placement="leftbottom"
      triggers="click blur"
    >
      <div>
        <div
          v-router-link="{
            name: 'UProfile',
            params: { username: user.username.replace('@', '') },
          }"
          class="profile-menu-header cursor-pointer"
          @click="closeProfilePopover"
        >
          <app-avatar
            :picture="user.profilePhotoURL"
            :name="name"
            variant="primary"
            size="small"
            class="profile-menu-avatar"
          ></app-avatar>
          <div>
            <div class="cs-textstyle-paragraph-bold">{{ name }}</div>
            <div class="ch-textstyle-paragraph-extrasmall">
              <app-username :user="user" />
            </div>
          </div>
        </div>
        <div class="profile-menu-body">
          <div
            v-router-link="{
              name: 'UProfile',
              params: { username: user.username.replace('@', '') },
            }"
            class="profile-menu-item cursor-pointer"
            @click="closeProfilePopover"
          >
            <i class="ch-icons-user"></i>
            View Profile
          </div>
          <div
            v-router-link="{ name: 'Settings' }"
            class="profile-menu-item cursor-pointer"
            @click="closeProfilePopover"
          >
            <i class="cs-icons-settings"></i>
            Settings
          </div>
          <div class="profile-menu-item cursor-pointer" @click="reportBug()">
            <i class="cs-icons-help"></i>
            Report a Bug
          </div>
          <div class="profile-menu-item" @click="logout">
            <i class="ch-icons-logout"></i>
            Sign Out
          </div>
        </div>
      </div>
    </b-popover>
  </div>
</template>
<script>
import $auth from '@/services/auth';
import AppAvatar from '@/components/general/Avatar.vue';
import AppUsername from '@/components/general/Username.vue';
// import Logout from '@/gql/general/Logout.gql';
import GetProfile from '@/gql/general/GetProfile.gql';

export default {
  components: {
    AppAvatar,
    AppUsername,
  },
  data() {
    return {
      user: null,
    };
  },
  apollo: {
    user: {
      query: GetProfile,
      variables() {
        return {
          id: $auth.getUserId(),
        };
      },
    },
  },
  computed: {
    name() {
      return `${this.user.firstname} ${this.user.lastname}`;
    },
  },
  methods: {
    async logout() {
      this.closeProfilePopover();
      const loggedOut = true;
      // Mutation is not needed on desktop version at the moment since there are no FCM tokens
      // const loggedOut = await this.$apollo.mutate({
      //   mutation: Logout,
      // });
      if (loggedOut) {
        $auth.logout();
        this.$router.push({ name: 'Login' });
      }
    },
    async reportBug() {
      const user = await $auth.getUser();
      const feedbackLink = `/feedback.html?uid=${user.id}&email=${user.email}&device=web`;
      window.open(feedbackLink, '_blank');
      this.closeProfilePopover();
    },
    closeProfilePopover() {
      this.$refs.profilePopover.$emit('close');
    },
  },
};
</script>
<style scoped>
.profile-menu-header {
  display: flex;
  align-items: center;
  border-bottom: solid 1px var(--cs-gray-01);
  padding-bottom: 10px;
  margin-bottom: 10px;
  cursor: pointer;
}
.profile-menu-avatar {
  margin-right: 10px;
}
.profile-menu-item {
  margin-top: 10px;
  margin-bottom: 10px;
  cursor: pointer;
}
</style>
