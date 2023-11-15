<template>
  <div
    v-router-link="{ name: 'NewsProfile', params: user }"
    class="publisher-circle"
  >
    <app-avatar :picture="displayPicture" :name="displayName" size="large" />
    <div class="publisher-circle-name cs-textstyle-paragraph-small">
      {{ displayName }}
    </div>
    <app-follow-button
      variant="secondary"
      size="small"
      fill="outline"
      :target="user"
      class="follow-btn"
    ></app-follow-button>
  </div>
</template>

<script>
import AppAvatar from '@/components/general/Avatar.vue';
import AppFollowButton from '@/components/general/FollowButton.vue';
import GetChannel from '@/gql/videos/GetChannel.gql';

export default {
  components: {
    AppAvatar,
    AppFollowButton,
  },
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      channel: null,
    };
  },
  computed: {
    displayName() {
      return this.user.displayname;
    },
    displayPicture() {
      return this.user.profilePhotoURL;
    },
  },
  async mounted() {
    const resp = await this.$apollo.query({
      query: GetChannel,
      variables: {
        id: this.user.id,
      },
    });
    this.channel = { ...resp.data.user };
  },
};
</script>

<style scoped>
.publisher-circle {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 150px;
  height: 200px;
}
.publisher-circle-name {
  display: -webkit-box;
  height: 40px;
  text-align: center;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: var(--cs-gray-05);
}
.follow-btn {
  margin-top: 5px;
}
</style>
