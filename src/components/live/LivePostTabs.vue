<template>
  <cs-page-tabs align="justify" class="tabs">
    <cs-page-tab label="Live Chat">
      <app-live-chat :post-id="postId" :is-author="isAuthor" />
    </cs-page-tab>
    <cs-page-tab label="Handouts">
      <app-post-resources :post-id="postId" />
    </cs-page-tab>
  </cs-page-tabs>
</template>

<script>
import AppLiveChat from '@/components/live/LiveChat.vue';
import AppPostResources from '@/components/live/PostResources.vue';
import $socket from '@/services/socket';

export default {
  components: {
    AppLiveChat,
    AppPostResources,
  },
  props: {
    postId: {
      type: String,
      required: true,
    },
    isAuthor: {
      type: Boolean,
    },
  },
  async mounted() {
    try {
      await $socket.connect('post');
      await $socket.joinRoom('post', this.postId);
    } catch (e) {
      console.log('error', e);
    }
  },
};
</script>
