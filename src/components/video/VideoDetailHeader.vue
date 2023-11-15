<template>
  <div class="profile-card">
    <div class="video-title-bar">
      <div class="ch-title cs-textstyle-section-heading">
        {{
          post.video.title ||
          post.bodyText ||
          post.video.name ||
          'Untitled Video'
        }}
      </div>
      <div class="action-btns">
        <app-bookmark-button :post="post" v-if="isLoggedIn" />
        <app-queue-button :post="post" v-if="isLoggedIn" />
        <app-share-button v-if="post.video.isLive" :post="post" />
        <app-context-menu class="options-icon" v-if="isLoggedIn" >
          <app-context-menu-item v-if="isAuthor" @click="$emit('editVideo')"
            >Edit Video</app-context-menu-item
          >
          <app-context-menu-item v-if="isAuthor" @click="$emit('deleteVideo')"
            >Delete Video</app-context-menu-item
          >
          <app-context-menu-item v-if="isAuthor" @click="$emit('downloadVideo')"
            >Download Video</app-context-menu-item
          >
          <app-context-menu-item v-if="!isAuthor" @click="report('post')"
            >Report Video</app-context-menu-item
          >
          <app-context-menu-item v-if="isAuthor" @click="report('own-video')"
            >Report Video</app-context-menu-item
          >
          <app-context-menu-item v-if="!isAuthor" @click="report('user')">
            Report <app-username :user="post.user" />
          </app-context-menu-item>
          <app-context-menu-item v-if="!isAuthor" @click="blockAuthor('user')">
            Block <app-username :user="post.user" />
          </app-context-menu-item>
          <app-context-menu-item
            v-if="isSuperAdmin"
            @click="$emit('deleteVideo')"
            >[SA] Delete Video</app-context-menu-item
          >
        </app-context-menu>
      </div>
    </div>
    <div class="profile-info">
      <div
        v-router-link="{ name: 'VideoProfile', params: user }"
        class="avatar-holder"
      >
        <app-img class="square-avatar" :src="displayPicture" :width="85" :height="85" />
      </div>
      <div class="profile-meta">
        <div
          v-router-link="{ name: 'VideoProfile', params: user }"
          class="cs-textstyle-item-heading"
        >
          {{ channelName }}
        </div>
        <div class="cs-textstyle-paragraph-small text-light">
          <span v-router-link="{ name: 'Profile', params: user }">
            <app-username :user="user" /> |
            <span>{{ post.createdAt | moment('from') }}</span>
            <div>
              {{ post.viewCount || 0 }}
              {{ post.viewCount === 1 ? 'view' : 'views' }}
            </div>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import $auth from '@/services/auth';
import $bus from '@/services/bus';
import AppContextMenu from '@/components/general/ContextMenu.vue';
import AppContextMenuItem from '@/components/general/ContextMenuItem.vue';
import AppUsername from '@/components/general/Username.vue';
import AppImg from '@/components/general/Img.vue';
import AppQueueButton from '@/components/post/buttons/QueueButton.vue';
import AppBookmarkButton from '@/components/post/buttons/BookmarkButton.vue';
import AppShareButton from '@/components/post/buttons/ShareButton.vue';

const defaultPicture = require('@/assets/images/placeholders/profile-banner.png');

export default {
  components: {
    AppContextMenu,
    AppContextMenuItem,
    AppImg,
    AppUsername,
    AppQueueButton,
    AppBookmarkButton,
    AppShareButton,
  },
  props: {
    user: {
      type: Object,
      required: true,
    },
    post: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      avatarEditIcon: false,
      bannerEditIcon: false,
      showCreateVideoModal: false,
      isSuperAdmin: $auth.isAdmin(),
      src: this.user.channelPicture, // The current selected image
      bannerSrc: this.user.channelCover,
      selectedImageSrc: null, // Temporary variable used to hold images while being cropped
      avatarEditorOpen: false,
      selectedBannerSrc: null,
      avatarSaving: false,
      defaultPicture,
      isLoggedIn: false,
    };
  },
  async created() {
    this.updateLoginStatus();
  },
  computed: {
    isAuthor() {
      return this.post && this.post.user.id === $auth.getUserId();
    },
    channelName() {
      return this.user.channelName || `${this.user.displayname}'s Channel`;
    },
    isLogged() {
      return this.user.id === $auth.getUserId();
    },
    displayCover() {
      if (this.user.channelCover) {
        return this.user.channelCover;
      }
      return this.defaultPicture;
    },
    displayPicture() {
      return this.user.channelPicture || this.user.profilePhotoURL;
    },
    embedCode() {
      return `<iframe src="${process.env.VUE_APP_SHARE_DOMAIN}/channelembed/${this.user.id}"></iframe>`;
    },
  },
  methods: {
    async updateLoginStatus() {
      this.isLoggedIn = await $auth.isLoggedInAsUser();
    },
    report(type) {
      const reportData = {
        id: type === 'post' ? this.post.id : this.post.user.id,
        type,
      };
      $bus.$emit('show-report-modal', reportData);
    },
    blockAuthor() {
      $bus.$emit('block-user-modal', {
        user: this.post.user,
      });
    },
  },
};
</script>
<style scoped>
.avatar-holder {
  position: relative;
  overflow: hidden;
  border: solid 4px var(--cs-gray-00);
  border-radius: 10%;
  cursor: pointer;
  width: min-content;
}
.square-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}
.profile-info {
  display: flex;
  gap: 10px;
  align-items: center;
}
.profile-meta {
  flex: 1;
}
.ch-title {
  font-size: var(--cs-font-size-300);
}
.video-title-bar {
  display: flex;
  justify-content: space-between;
  line-height: 1px;
}
.action-btns {
  display: flex;
  align-items: center;
  font-size: var(--cs-font-size-200);
}
.profile-card {
  background-color: white;
  padding: 10px;
}
</style>
