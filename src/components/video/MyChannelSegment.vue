<template>
  <div>
    <div class="cs-textstyle-item-heading mb-2">My Channel</div>
    <cs-spinner v-if="!user" />
    <div
      v-if="user && !user.channelName && !user.videoPosts.count"
      class="my-channel"
    >
      <img
        v-router-link="{ name: 'VideoProfile', params: { id: user.id } }"
        :src="require('@/assets/images/placeholders/profile-banner.png')"
        class="cover cursor-pointer"
      />
      <div class="my-channel-content">
        <div class="cs-textstyle-paragraph-bold">Start Your Channel</div>
        <div class="cs-textstyle-paragraph-small">
          Share your view. Create a CloutHub Channel today.
        </div>
        <cs-button
          v-router-link="{ name: 'VideoProfile', params: { id: user.id } }"
          block
          class="cursor-pointer"
          fill="outline"
          size="small"
          >Create Channel</cs-button
        >
      </div>
    </div>
    <div
      v-if="user && (user.channelName || user.videoPosts.count)"
      class="my-channel"
    >
      <app-img
        v-if="user.channelCover"
        v-router-link="{ name: 'VideoProfile', params: { id: user.id } }"
        :src="user.channelCover"
        class="cover cursor-pointer"
      />
      <img
        v-else
        v-router-link="{ name: 'VideoProfile', params: { id: user.id } }"
        :src="require('@/assets/images/placeholders/profile-banner.png')"
        class="cover cursor-pointer"
      />
      <div class="my-channel-content">
        <div class="cs-textstyle-paragraph-bold">{{ user.channelName }}</div>
        <div class="cs-textstyle-paragraph-small-bold text-light">
          {{ user.videoPosts.count }} {{ videosLabel }}
        </div>
        <div class="cs-textstyle-paragraph-small">
          Share your voice, and build a following today! Build your CloutHub
          Channel.
        </div>
        <cs-button
          v-router-link="{ name: 'VideoProfile', params: { id: user.id } }"
          block
          class="cursor-pointer"
          fill="outline"
          size="small"
          >Go To My Channel</cs-button
        >
      </div>
    </div>
  </div>
</template>
<script>
import GetChannel from '@/gql/videos/GetChannel.gql';
import $auth from '@/services/auth';
import AppImg from '@/components/general/Img.vue';

export default {
  components: {
    AppImg,
  },
  apollo: {
    user: {
      query: GetChannel,
      variables() {
        return {
          id: $auth.getUserId(),
        };
      },
    },
  },
  computed: {
    viewsLabel() {
      if (this.user.videoPosts.viewCount === 1) return 'view';
      return 'views';
    },
    videosLabel() {
      if (this.user.videoPosts.count === 1) return 'video';
      return 'videos';
    },
  },
};
</script>
<style scoped>
.my-channel {
  width: 100%;
  text-align: center;
  background-color: white;
  margin-bottom: 25px;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  overflow: hidden;
  gap: 10px;
}
.my-channel .cover {
  width: 100%;
  height: 100px;
  object-fit: cover;
}
.my-channel-content {
  display: flex;
  flex-direction: column;
  padding: 10px;
  gap: 10px;
}
</style>
