<template>
  <div
    v-if="user"
    class="profile-card card-no-padding card-margin sidebar-card"
  >
    <app-img
      v-if="user.bannerImageURL"
      :width="300"
      :original="false"
      :src="user.bannerImageURL"
      class="cover cursor-pointer"
      @click="viewProfile('posts')"
    />
    <app-img
      v-else
      :src="defaultPicture"
      class="cover cursor-pointer"
      @click="viewProfile('posts')"
    />
    <app-avatar
      class="avatar cursor-pointer"
      size="large"
      :name="user.username"
      :picture="user.profilePhotoURL"
      @click="viewProfile('posts')"
    ></app-avatar>
    <div
      class="cs-textstyle-detail-heading cursor-pointer"
      @click="viewProfile('posts')"
    >
      {{ user.displayname }}
    </div>
    <div
      class="cs-textstyle-paragraph-small text-light cursor-pointer"
      @click="viewProfile('posts')"
    >
      <app-username :user="user" />
    </div>
    <div class="counts">
      <div class="count" @click.stop="viewProfile('friends')">
        <div class="count-info cs-textstyle-paragraph-small text-light">
          {{ friendsLabel }}
        </div>
        <div class="count-number cs-textstyle-paragraph-small-bold">
          {{ user.friendCount }}
        </div>
      </div>
      <div class="count" @click.stop="viewProfile('followers')">
        <div class="count-info cs-textstyle-paragraph-small text-light">
          {{ followersLabel }}
        </div>
        <div class="count-number cs-textstyle-paragraph-small-bold">
          {{ user.followerCount }}
        </div>
      </div>
      <div class="count" @click.stop="viewProfile('following')">
        <div class="count-info cs-textstyle-paragraph-small text-light">
          Following
        </div>
        <div class="count-number cs-textstyle-paragraph-small-bold">
          {{ user.followingCount }}
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import $auth from '@/services/auth';
import GetProfile from '@/gql/general/GetProfile.gql';
import AppAvatar from '@/components/general/Avatar.vue';
import AppUsername from '@/components/general/Username.vue';
import AppImg from '@/components/general/Img.vue';

const defaultPicture = require('@/assets/images/placeholders/home-profile-card-banner.png');

export default {
  components: {
    AppAvatar,
    AppImg,
    AppUsername,
  },
  apollo: {
    user: {
      query: GetProfile,
      variables() {
        return {
          id: $auth.getUserId(),
          viewerId: $auth.getUserId(),
        };
      },
    },
  },
  data() {
    return {
      defaultPicture,
    };
  },
  computed: {
    friendsLabel() {
      if (this.user.friendCount === 1) return 'Friend';
      return 'Friends';
    },
    followersLabel() {
      if (this.user.followerCount === 1) return 'Follower';
      return 'Followers';
    },
  },
  methods: {
    viewProfile(view) {
      this.$router.push({
        name: 'UProfile',
        params: {
          username: this.user.username.replace('@', ''),
          view,
        },
      });
    },
  },
};
</script>

<style scoped>
.profile-card {
  text-align: center;
  display: flex;
  align-items: center;
  position: relative;
  flex-direction: column;
  border: none !important;
}
.cover {
  background-color: #efefef;
  height: 100px;
  width: 100%;
  background-size: cover;
  background-position: center;
  position: absolute;
  object-fit: cover;
}
.avatar {
  display: inline-block;
  margin-top: 50px;
  margin-bottom: 5px;
  border: 2px solid #fff;
}
.counts {
  width: 100%;
  border-top: solid 1px var(--cs-gray-02);
  display: flex;
  margin-top: 20px;
  justify-content: space-between;
  font-size: var(--cs-font-size-100);
  padding: 16px 10px 10px;
}
.count {
  flex: 1;
  cursor: pointer;
}
</style>
