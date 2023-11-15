<template>
  <div
    v-router-link="{ name: 'NewsProfile', params: user }"
    class="cursor-pointer"
    :class="itemClass"
  >
    <div class="channel-item">
      <div class="news-follow">
        <app-avatar
          v-router-link="{ name: 'NewsProfile', params: user }"
          :name="user.displayname"
          :picture="user.profilePhotoURL"
          size="medium"
        />
        <app-follow-button
          variant="secondary"
          size="small"
          fill="outline"
          :target="channel"
        >
        </app-follow-button>
      </div>
      <div
        v-router-link="{ name: 'NewsProfile', params: user }"
        class="channel-card"
      >
        <div class="cs-textstyle-paragraph-bold">
          <app-username :user="user" type="displayname" />
        </div>
        <div class="cs-textstyle-paragraph-small news-publisher-description">
          {{ user.bio }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AppAvatar from '@/components/general/Avatar.vue';
import AppUsername from '@/components/general/Username.vue';
import AppFollowButton from '@/components/general/FollowButton.vue';

import GetChannel from '@/gql/videos/GetChannel.gql';

export default {
  components: {
    AppAvatar,
    AppUsername,
    AppFollowButton,
  },
  props: {
    itemClass: {
      type: String,
      default: 'col-md-4',
    },
    user: {
      required: true,
      type: Object,
    },
  },
  data() {
    return {
      channel: {
        myRelationship: {
          isFollowing: null,
        },
      },
    };
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
.news-follow {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.channel-item {
  display: flex;
  flex-direction: row;
  padding: 15px;
  border-radius: 5px;
  background-color: white;
  gap: 10px;
  cursor: pointer;
}
.news-publisher-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

* >>> .username {
  width: 200px;
}
</style>
