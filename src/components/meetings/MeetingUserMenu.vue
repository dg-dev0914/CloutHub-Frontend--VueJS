<template>
  <div class="meeting-user-menu">
    <app-avatar
      id="user-menu"
      class="cursor-pointer"
      :name="name"
      :picture="picture"
      size="medium"
    />
    <div class="cs-textstyle-paragraph-small">{{ name }}</div>
    <b-popover
      ref="popover"
      target="user-menu"
      triggers="click blur"
      placement="leftbottom"
    >
      <div v-if="user" class="meeting-user-username">{{ user.username }}</div>
      <app-context-menu-item v-if="user" @click="signOut()"
        >Sign Out</app-context-menu-item
      >

      <div v-if="!user" class="meeting-user-username">Guest Account</div>
      <app-context-menu-item v-if="!user" @click="signIn()"
        >Sign In</app-context-menu-item
      >
      <app-context-menu-item v-if="!user" @click="createAccount()"
        >Create Account</app-context-menu-item
      >
    </b-popover>
  </div>
</template>
<script>
import $auth from '@/services/auth';
import AppContextMenuItem from '@/components/general/ContextMenuItem.vue';
import AppAvatar from '@/components/general/Avatar.vue';

export default {
  components: {
    AppContextMenuItem,
    AppAvatar,
  },
  data() {
    return {
      user: null,
    };
  },

  computed: {
    name() {
      return (
        this.user &&
        (this.user.displayname.length
          ? this.user.displayname
          : this.user.username.replace('@', ''))
      );
    },
    picture() {
      return (
        (this.user && this.user.profilePhotoURL) ||
        'https://i1.sndcdn.com/avatars-fuFi52Szkbdm16Gg-arzAGQ-t500x500.jpg'
      );
    },
  },
  async mounted() {
    this.user = await $auth.getUser();
  },
  methods: {
    signOut() {
      this.$refs.popover.$emit('close');
      $auth.logout();
      window.location.reload();
    },
    signIn() {
      this.$emit('signin');
      this.$refs.popover.$emit('close');
    },
    createAccount() {
      this.$emit('signup');
      this.$refs.popover.$emit('close');
    },
  },
};
</script>
<style scoped>
.meeting-user-username {
  font-weight: bold;
  border-bottom: solid 1px var(--cs-gray-01);
  padding-bottom: 10px;
}
.meeting-user-menu {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}
</style>
