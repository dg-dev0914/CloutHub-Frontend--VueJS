<template>
  <b-col>
    <app-post-prompt v-if="isLoggedInUser" room="main"></app-post-prompt>
    <app-profile-post-list :user="user"></app-profile-post-list>
  </b-col>
</template>

<script>
import $auth from '@/services/auth';
import AppPostPrompt from '@/components/post/PostPrompt.vue';
import AppProfilePostList from '@/components/post/lists/ProfilePostList.vue';

export default {
  components: {
    AppPostPrompt,
    AppProfilePostList,
  },
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  computed: {
    isLoggedInUser() {
      return $auth.getUserId() === this.user.id;
    },
  },
};
</script>
