<template>
  <div class="profile-card">
    <div class="profile-banner-holder">
      <app-img
        v-if="user.bannerImageURL"
        class="profile-banner"
        :src="user.bannerImageURL"
        :width="1200"
      />
      <img v-else class="profile-banner" :src="placeholderImg" alt="" />
    </div>
    <div class="profile-info">
      <div class="info-button">
        <div class="info-only">
          <div class="avatar-holder">
            <app-avatar
              :picture="user.profilePhotoURL"
              :name="user.firstname"
              variant="primary"
              size="large"
              :width="200"
              :height="200"
              @click.stop="openLightbox()"
            />
            <vue-easy-lightbox
              move-disabled
              :visible="showLightbox"
              :imgs="user.profilePhotoURL"
              :index="lightboxIndex"
              @hide="showLightbox = false"
            />
          </div>
          <h3 class="cs-textstyle-item-heading title">
            <app-username :user="user" type="displayname" />
          </h3>
          <p class="cs-textstyle-paragraph title">{{ user.username }}</p>
          <p class="cs-textstyle-paragraph-small title">
            Member since {{ user.createdAt | moment('MMMM YYYY') }}
          </p>
        </div>
        <div v-if="!isPreview" class="button-only">
          <div v-if="isLogged" class="first-row">
            <cs-button
              v-if="user.id === '435004d1-7885-421f-9b48-79af938d69bf'"
              size="small"
              variant="danger"
              class="group-detail-view__action_button"
              href="https://www.supportcleanelections.com"
              target="_blank"
              >Report Fraud</cs-button
            >
            <cs-button
              v-router-link="{ name: 'VideoProfile', params: { id: user.id } }"
              size="small"
              >My Channel</cs-button
            >
            <cs-button
              v-router-link="{
                name: 'EditProfile',
                params: { id: user.id },
              }"
              fill="outline"
              size="small"
              class="cursor-pointer"
              >Edit Profile</cs-button
            >
          </div>
          <div v-if="!isLogged" class="first-row">
            <cs-button
              v-if="user.id === '435004d1-7885-421f-9b48-79af938d69bf'"
              variant="danger"
              class="group-detail-view__action_button"
              href="http://www.supportcleanelections.com"
              target="_blank"
              >Report Fraud</cs-button
            >
            <cs-button
              v-if="hasVideo"
              v-router-link="{ name: 'VideoProfile', params: { id: user.id } }"
              class="channel-btn"
              >Channel</cs-button
            >
            <app-follow-button :target="user"></app-follow-button>
            <app-friend-button :target="user"></app-friend-button>
            <div>
              <cs-button
                size="medium"
                class="profile-message-button"
                @click="openNewMessageModal"
                >Message</cs-button
              >
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="!isLogged"
        class="ch-profile__follow-back cs-textstyle-paragraph-small"
      >
        <div class="cs-textstyle-paragraph-extra-small-bold">
          <span v-if="user.myRelationship.isFollowing">Follows you</span>
          <span
            v-if="showFollowBackButton"
            class="ch-profile__follow-back-button"
            @click="followPerson"
            >Follow back</span
          >
        </div>
      </div>
      <div v-if="isLogged" class="friend-info">
        <div class="count-info" @click.stop="viewProfile('friends')">
          <b> {{ user.friendCount }} </b> {{ friendsLabel }}
        </div>
        <div class="count-info" @click.stop="viewProfile('followers')">
          <b> {{ user.followerCount }} </b> {{ followersLabel }}
        </div>
        <div class="count-info" @click.stop="viewProfile('following')">
          <b> {{ user.followingCount }} </b> following
        </div>
      </div>
      <div v-if="!isLogged" class="friend-info">
        <div class="count-info">
          <b> {{ user.followerCount }} </b> {{ followersLabel }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import $auth from '@/services/auth';
import $relationshipsApi from '@/api/connections';
import AppFriendButton from '@/components/general/FriendButton.vue';
import AppFollowButton from '@/components/general/FollowButton.vue';
import AppAvatar from '@/components/general/Avatar.vue';
import AppUsername from '@/components/general/Username.vue';
import $bus from '@/services/bus';
import GetChannel from '@/gql/videos/GetChannel.gql';
import AppImg from '@/components/general/Img.vue';

import placeholderImg from '@/assets/images/placeholders/profile-banner.png';

export default {
  components: {
    AppFriendButton,
    AppFollowButton,
    AppAvatar,
    AppUsername,
    AppImg,
  },
  props: {
    user: {
      type: Object,
      required: true,
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      placeholderImg,
      showMenu: false,
      showDialog: false,
      lightboxIndex: 0,
      showLightbox: false,
      channel: null,
    };
  },
  computed: {
    isLogged() {
      return this.user.id === $auth.getUserId();
    },
    showFollowBackButton() {
      return (
        this.user.myRelationship.isFollowing &&
        !this.user.myRelationship.isFollower
      );
    },
    friendsLabel() {
      return this.user.friendCount === 1 ? 'friend' : 'friends';
    },
    followersLabel() {
      return this.user.followerCount === 1 ? 'follower' : 'followers';
    },
    hasVideo() {
      return (
        this.channel &&
        (this.channel.videoPosts.count > 0 || this.channel.channelName)
      );
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
  methods: {
    async followPerson() {
      await $relationshipsApi.followUser(this.user);
    },
    openLightbox(index) {
      if (this.user.profilePhotoURL) {
        this.lightboxIndex = index || 0;
        this.showLightbox = true;
      }
    },
    openNewMessageModal() {
      $bus.$emit('new-message-modal', {
        user: this.user,
      });
    },
    openReportModal(user) {
      const reportData = {
        id: user.id,
        type: 'user',
      };
      $bus.$emit('show-report-modal', reportData);
    },
    blockUser() {
      $bus.$emit('block-user-modal', {
        user: this.user,
      });
    },
    async follow(person) {
      person.isFollower = true;
    },
    async unfollow(person) {
      person.isFollower = false;
    },
    async unfriend(person) {
      person.isFriend = false;
      person.friendStatus = 'none';
    },
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
.profile-banner-holder {
  position: relative;
}
.profile-banner {
  height: 300px;
  width: 100%;
  object-fit: cover;
}
.profile-card {
  position: relative;
}
.profile-card .ch-avatar__content {
  border: 2px solid #fff;
}
.cover {
  background-color: #efefef;
  height: 300px;
  background-size: cover;
  background-position: center;
}
.profile-info {
  padding-left: 20px;
  background: var(--cs-gray-00);
}
.friend-info {
  display: flex;
}
.count-info {
  display: flex;
  padding-right: 20px;
  cursor: pointer;
}
.count-info b {
  padding-right: 7px;
}
.info-button {
  display: flex;
  flex-direction: row;
  position: relative;
  justify-content: space-between;
}
.info-only {
  margin-top: -70px;
  width: 380px;
}
.avatar-holder {
  position: relative;
  overflow: hidden;
  border: solid 4px var(--cs-gray-00);
  border-radius: 50%;
  cursor: pointer;
  width: min-content;
}
.avatar-holder .ch-avatar {
  --ch-avatar-size: 125px;
  --cs-avatar-font-size: 35px;
}
.button-only {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100px;
  position: absolute;
  right: 0;
  margin-top: 25px;
  margin-right: 25px;
}
.first-row {
  display: flex;
  justify-content: flex-end;
  flex-direction: row;
  flex: 1;
}
.first-row >>> .cs-button {
  height: fit-content;
}
.first-row >>> .cs-button:hover {
  background: #f06027 !important;
  color: white;
}
.first-row > * {
  margin-left: 5px;
}
.cs-avatar .cs-avatar__image {
  background: var(--cs-gray-00) !important;
}

.profile-message-button {
  margin-left: 10px;
}
.channel-btn {
  margin-right: 10px;
}
.title {
  width: 500px;
  margin-bottom: 8px;
  margin-top: 8px;
}
.ch-profile__follow-back {
  margin-top: 5px;
}
.ch-profile__follow-back-button {
  background: var(--cs-gray-03);
  padding: 1px 4px;
  border-radius: 2px;
  cursor: pointer;
  margin-left: 5px;
}
</style>
