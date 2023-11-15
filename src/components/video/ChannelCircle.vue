<template>
  <div class="channel-circle">
    <app-avatar
      v-router-link="{ name: 'VideoProfile', params: user }"
      :picture="displayPicture"
      :name="displayName"
      size="large"
    />
    <div class="channel-circle-name cs-textstyle-paragraph-small">
      {{ displayName }}
    </div>
    <app-channel-subscribe-button :target="user" size="small" />
  </div>
</template>

<script>
import AppAvatar from '@/components/general/Avatar.vue';
import AppChannelSubscribeButton from '@/components/general/ChannelSubscribeButton.vue';

export default {
  components: {
    AppAvatar,
    AppChannelSubscribeButton,
  },
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  computed: {
    displayName() {
      return this.user.channelName || this.user.displayname;
    },
    displayPicture() {
      return this.user.channelPicture || this.user.profilePhotoUrl;
    },
  },
};
</script>

<style scoped>
.channel-circle {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  justify-content: center;
  width: 120px;
  height: 180px;
  margin-bottom: 10px;
}
.channel-circle-name {
  height: 50px;
}
</style>
