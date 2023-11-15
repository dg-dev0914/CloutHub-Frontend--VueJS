<template>
  <div class="post-response-buttons">
    <cs-action-bar-button
      :id="post.id + '.' + randomNumber + '.reactbutton'"
      :icon="myReaction ? '' : 'ch-icons-reaction'"
      class="capitalize"
      @click="$emit('remove-reaction')"
    >
      <img
        v-if="myReaction"
        class="emoji"
        :src="'/assets/emojis/' + myReaction.value + '.png'"
        :alt="myReaction.name"
      />
      <span v-if="myReaction">{{ myReaction.name }}</span>
      <span v-else>React</span>
    </cs-action-bar-button>

    <cs-action-bar-button
      icon="ch-icons-comments"
      @click="redirectToPostDetailedPage"
    >
      Comment
    </cs-action-bar-button>
    <cs-action-bar-button icon="ch-icons-share" @click="$emit('share')">
      Share
    </cs-action-bar-button>
    <!-- Popover of emojies on hover -->
    <app-post-reaction
      v-if="!myReaction"
      :post="post"
      :target-element-id="post.id + '.' + randomNumber + '.reactbutton'"
    ></app-post-reaction>
  </div>
</template>

<script>
// Components files
import $auth from '@/services/auth';
import AppPostReaction from '@/components/post/response/PostReaction.vue';
export default {
  components: {
    AppPostReaction,
  },
  props: {
    post: {
      type: Object,
      required: true,
    },
    myReaction: {
      type: Object,
    },
  },
  data() {
    return {
      isLoggedIn: false, 
      randomNumber: Math.floor(Math.random() * 1000),
    };
  },
  created() {
    this.updateLoginStatus();
  },
  methods: {
    async updateLoginStatus() {
      this.isLoggedIn = await $auth.isLoggedInAsUser();
    },
    redirectToPostDetailedPage() {
      this.$emit('focus');
      this.$router.push({
        name: 'PostDetail',
        params: { id: this.post.rootPostId },
      });
    },
  },
};
</script>

<style scoped>
.emoji {
  cursor: pointer;
  width: 20px;
  height: 20px;
  margin: 5px;
}
</style>