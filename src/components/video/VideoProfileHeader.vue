<template>
  <div class="profile-card">
    <div
      v-if="isLogged"
      class="profile-banner-holder"
      @mouseover="bannerEditIcon = true"
      @mouseleave="bannerEditIcon = false"
    >
      <app-img :src="displayCover" class="profile-banner" original />
      <div
        v-if="bannerEditIcon"
        class="banner-edit-icon-background"
        @click="editBanner()"
      />
      <div v-if="bannerEditIcon" class="avatar-edit-icon" @click="editBanner()">
        <i class="cs-icons-edit" />
      </div>
    </div>
    <div
      v-if="!isLogged"
      v-router-link="{ name: 'VideoProfile', params: user }"
      class="profile-banner-holder"
    >
      <app-img class="profile-banner" :src="displayCover" :width="750" />
    </div>
    <div class="profile-info__container">
      <div class="profile-info">
        <div
          v-if="isLogged"
          class="avatar-holder"
          @mouseover="avatarEditIcon = true"
          @mouseleave="avatarEditIcon = false"
        >
          <app-img class="rounded-circle" :src="displayPicture" />
          <div
            v-if="avatarEditIcon"
            class="avatar-edit-icon-background"
            @click="editPicture()"
          />
          <app-spinner v-if="avatarSaving" class="avatar-spinner" />
          <div
            v-if="avatarEditIcon"
            class="avatar-edit-icon"
            @click="editPicture(false)"
          >
            <i class="cs-icons-edit" />
          </div>
          <app-image-crop-modal
            v-model="selectedImageSrc"
            :show="avatarEditorOpen"
            @input="useSelected"
            @close="onModalClose()"
          />
        </div>
        <div
          v-else
          v-router-link="{ name: 'VideoProfile', params: user }"
          class="avatar-holder"
        >
          <app-img class="rounded-circle" :src="displayPicture" />
        </div>
        <div class="profile-meta">
          <div
            v-router-link="{ name: 'VideoProfile', params: user }"
            class="channel-name cs-textstyle-item-heading"
          >
            {{ channelName }}
          </div>
          <div class="cs-textstyle-paragraph-small text-light">
            <span v-router-link="{ name: 'Profile', params: user }">
              <app-username :user="user" /> |
              <span>{{ user.subscribersCount }} {{ subscribersLabel }}</span>
            </span>
          </div>
        </div>
        <div class="channel-btns">
          <div class="channel-btns__top">
            <cs-button
              size="small"
              variant="secondary"
              fill="clear"
              class="share-btn"
              @click="share()"
            >
              <i class="ch-icons-share" />
              <div class="cs-textstyle-paragraph-small-bold">Share Channel</div>
            </cs-button>

            <cs-button
              size="medium"
              fill="clear"
              icon="ch-icons-rss"
              class="no-padding"
              :href="'`${process.env.VUE_APP_GRAPH_ENDPOINT}/rss/channels/${user.id}`'"
              target="blank"
              variant="secondary"
            ></cs-button>
            <cs-button
              v-if="!!isLogged"
              size="medium"
              fill="clear"
              icon="cs-icons-settings"
              variant="secondary"
              class="no-padding"
              @click="$emit('edit')"
            ></cs-button>
            <!-- Context Menu -->
            <app-context-menu v-if="isLoggedIn" placement="leftbottom">
              <app-context-menu-item v-if="!isAuthor" @click="report('post')"
                >Report Video</app-context-menu-item
              >
              <app-context-menu-item
                v-if="isAuthor"
                @click="report('own-video')"
                >Report Videos</app-context-menu-item
              >
              <app-context-menu-item @click="openReportModal(user)"
                >Report <app-username :user="user"
              /></app-context-menu-item>
              <app-context-menu-item @click="blockUser()"
                >Block <app-username :user="user"
              /></app-context-menu-item>
            </app-context-menu>
          </div>
          <div class="channel-btns__bottom">
            <cs-button
              v-if="user.channelButtonLabel && user.channelButtonLink"
              size="small"
              :href="buttonLink(user.channelButtonLink)"
              target="blank"
              class="mr-4"
            >
              {{ user.channelButtonLabel }}
            </cs-button>
            <cs-button
              v-if="user.channelButtonLabel2 && user.channelButtonLink2"
              size="small"
              :href="buttonLink(user.channelButtonLink2)"
              target="blank"
              class="mr-4"
            >
              {{ user.channelButtonLabel2 }}
            </cs-button>
            <app-upload-video v-if="!!isLogged">
              <cs-button size="small">Upload Video </cs-button>
            </app-upload-video>
            <app-live-button v-if="enableLive" />
            <app-channel-subscribe-button
              v-if="isLoggedIn"
              :target="user"
              size="small"
            />
          </div>
        </div>
      </div>
      <div class="cs-textstyle-paragraph">
        <div v-if="!user.channelDescription" class="description-block">
          No Description
        </div>
        <div v-else class="description-block">
          <span>
            {{ displayedText }}
          </span>
          <span
            v-if="user.channelDescription.length > 250"
            class="see-more-button"
            @click="showFullText = !showFullText"
          >
            ...{{ readMoreText }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import $auth from '@/services/auth';
import $bus from '@/services/bus';
import AppChannelSubscribeButton from '@/components/general/ChannelSubscribeButton.vue';
import AppContextMenu from '@/components/general/ContextMenu.vue';
import AppContextMenuItem from '@/components/general/ContextMenuItem.vue';
import AppUsername from '@/components/general/Username.vue';
import AppImg from '@/components/general/Img.vue';
import AppUploadVideo from '@/components/video/UploadVideo.vue';
import AppLiveButton from '@/components/live/LiveButton.vue';
import AppImageCropModal from '@/components/connections/editor/ImageCropModal.vue';

import AppSpinner from '@/components/general/Spinner.vue';
import $utils from '@/services/utils';
import $upload from '@/services/upload';
import $popups from '@/services/popups';
import $videosApi from '@/api/videos';

const dataURLtoFile = async (dataURL, filename) => {
  if (!dataURL || !dataURL.startsWith('data:')) return dataURL;
  const blob = await fetch(dataURL).then((r) => r.blob());
  return new File([blob], filename, {
    lastModified: Date.now(),
    type: blob.type,
  });
};

const defaultPicture = require('@/assets/images/placeholders/profile-banner.png');

export default {
  components: {
    AppChannelSubscribeButton,
    AppContextMenu,
    AppContextMenuItem,
    AppImg,
    AppUploadVideo,
    AppUsername,
    AppLiveButton,
    AppImageCropModal,
    AppSpinner,
  },
  props: {
    user: {
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
      showFullText: false,
      isLoggedIn: false,
    };
  },
  computed: {
    isAuthor() {
      return this.user.id === $auth.getUserId();
    },
    channelName() {
      return this.user.channelName || `${this.user.displayname}'s Channel`;
    },
    isLogged() {
      return this.user.id === $auth.getUserId();
    },
    subscribersLabel() {
      if (this.user.subscribersCount === 1) return 'subscriber';
      return 'subscribers';
    },
    displayCover() {
      if (this.user.channelCover) {
        return this.user.channelCover;
      }
      return this.defaultPicture;
    },
    enableLive() {
      return !!this.isLogged && this.user.liveStreamUrl;
    },
    displayPicture() {
      return this.user.channelPicture || this.user.profilePhotoURL;
    },
    embedCode() {
      return `<iframe width="710" height="400" allowfullscreen="true" src="${process.env.VUE_APP_SHARE_DOMAIN}/channelembed/${this.user.id}"></iframe>`;
    },
    displayedText() {
      if (!this.showFullText) {
        return this.user.channelDescription.slice(0, 249);
      }
      return this.user.channelDescription;
    },
    readMoreText() {
      return this.showFullText ? 'see less' : 'see more';
    },
  },
  created() {
    this.updateLoginStatus();
  },
  methods: {
    async updateLoginStatus() {
      this.isLoggedIn = await $auth.isLoggedInAsUser();
    },
    buttonLink(link) {
      const prefix = link.startsWith('http');
      const modifiedLink = prefix ? link : 'http://'.concat(link);
      return modifiedLink;
    },
    openReportModal(user) {
      const reportData = {
        id: user.id,
        type: 'user',
      };
      $bus.$emit('show-report-modal', reportData);
    },
    share() {
      const link = `/c/${this.user.channelSlug || this.user.id}`;
      $bus.$emit('show-share-other', {
        link,
        title: 'Share Channel',
        embedCode: this.embedCode,
      });
    },
    openUploadVideoModal() {},
    async editPicture() {
      const file = await $utils.selectFile('image/*');
      this.selectedImageSrc = URL.createObjectURL(file);
      this.avatarEditorOpen = true;
    },
    async editBanner() {
      this.$emit('edit-channel-cover');
    },
    onModalClose() {
      this.avatarEditorOpen = false;
    },
    blockUser() {
      $bus.$emit('block-user-modal', {
        user: this.user,
      });
      this.$emit('refresh');
    },
    async useSelected(pic) {
      this.avatarSaving = true;
      this.src = pic;
      try {
        const imageFiles = await Promise.all([
          dataURLtoFile(this.src, 'channel-profile.png'),
        ]);
        const images = await $upload.uploadImages(imageFiles);
        const channelPicture =
          images[0] && images[0].url ? images[0].url : this.src;
        const vars = {
          id: this.user.id,
          channelName: this.user.channelName,
          channelPicture,
        };
        await $videosApi.updateChannel(vars);
        this.selectedImageSrc = null;
        this.avatarSaving = false;
      } catch (e) {
        this.avatarSaving = false;
        $popups.alert(`Error Saving: ${JSON.stringify(e)}`);
      }
    },
    report(type) {
      const reportData = {
        id: type === 'post' ? this.user.id : this.user.id,
        type,
      };
      $bus.$emit('show-report-modal', reportData);
    },
  },
};
</script>
<style scoped>
.profile-banner-holder {
  position: relative;
  height: 0;
  padding-bottom: calc(100% * (1 / 5.75));
}

.profile-banner {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  object-fit: cover;
}
.avatar-holder {
  position: relative;
  overflow: hidden;
  border-radius: 10%;
  cursor: pointer;
  width: min-content;
}
.rounded-circle {
  border-radius: 50% !important;
  height: 80px !important;
  width: 80px;
}
.profile-info__container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: var(--cs-gray-00);
  padding: 5px;
  box-shadow: 0 8px 8px -4px var(--cs-gray-02);
}
.profile-info {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  align-items: center;
}
.profile-meta {
  flex: 1;
}

.avatar-edit-icon-background {
  position: absolute;
  top: 0px;
  left: 0;
  height: 125px;
  width: 125px;
  background-color: var(--cs-gray-08);
  opacity: 0.6;
}
.avatar-edit-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
  font-size: 32px;
  color: var(--cs-gray-00);
}
.avatar-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
  color: var(--cs-gray-00);
}
.banner-edit-icon-background {
  position: absolute;
  top: 0px;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: var(--cs-gray-08);
  opacity: 0.6;
  border-radius: 10px;
}
.no-padding {
  padding: 0px !important;
}
.channel-name {
  word-break: break-all;
}
.see-more-button {
  color: var(--cs-gray-04);
  cursor: pointer;
}
.description-block {
  color: var(--cs-gray-05);
}
.channel-btns {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}
.channel-btns__top {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}
.channel-btns__bottom {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}
.share-btn {
  --cs-button-padding: 4.5px 5px !important;
}

* >>> .context-menu-button {
  font-size: 20px;
  color: var(--cs-secondary-base) !important;
}
</style>
