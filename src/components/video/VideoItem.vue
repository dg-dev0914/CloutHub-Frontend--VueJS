<template>
  <div v-if="safeToDisplay" class="video-card"
    @click="videoCardClickEvent()" >
    <div v-if="isVideoLive" class="ch-live-video">LIVE</div>
    <div class="video-item-body">
      <div class="ch-title-part">
        <div
          v-router-link="{ name: 'VideoDetail', params: video }"
          class="video-title cs-textstyle-paragraph-bold no-wrap cursor-pointer"
        >
          {{ title }}
        </div>
        <app-context-menu v-if="isLoggedIn" >
          <!-- TEMPORARILY DISABLED WHILE WE FIX VIDEO EDIT -->
          <app-context-menu-item v-if="postedByMe" @click="editPost">
            Edit Video
          </app-context-menu-item>
          <app-context-menu-item v-if="postedByMe" @click="deleteVideo"
            >Delete Video</app-context-menu-item
          >
          <app-context-menu-item v-if="postedByMe" @click="downloadVideo"
            >Download Video</app-context-menu-item
          >
          <app-context-menu-item
            v-if="postedByMe"
            @click="reportVideo('own-video')"
            >Report Video</app-context-menu-item
          >
          <app-context-menu-item v-if="postedByMe && !video.ispinnedonchannel" @click="pinVideo"
            >Pin Video</app-context-menu-item
          >
          <app-context-menu-item v-if="!postedByMe" @click="reportVideo('post')"
            >Report Video</app-context-menu-item
          >
          <app-context-menu-item v-if="!postedByMe" @click="reportUser">
            Report <app-username :user="video.user" />
          </app-context-menu-item>
          <app-context-menu-item v-if="!postedByMe" @click="blockAuthor()"
            >Block <app-username :user="video.user"
          /></app-context-menu-item>
          <app-context-menu-item v-if="isSuperAdmin" @click="deleteVideo"
            >[SA] Delete Video</app-context-menu-item
          >
        </app-context-menu>
      </div>

      <div v-if="video.user" class="video-meta">
        <app-avatar
          v-router-link="{ name: 'VideoProfile', params: video.user }"
          class="cursor-pointer"
          :name="video.user.displayname"
          :picture="video.user.profilePhotoURL"
          size="small"
        ></app-avatar>
        <div class="video-meta-info">
          <div
            v-router-link="{ name: 'VideoProfile', params: video.user }"
            class="cs-textstyle-paragraph-small-bold cursor-pointer"
          >
            <app-username :user="video.user" type="displayname" />
          </div>
          <div class="cs-textstyle-paragraph-small text-light">
            {{ video.viewCount || 0 }}
            {{ video.viewCount === 1 ? 'view' : 'views' }} ·
            {{ video.createdAt | moment('from') }}
          </div>
        </div>
        <div class="video-meta-extras">
          <div class="video-meta-extras__icons">
            <app-share-button
              v-if="isLoggedIn"
              size="small"
              :post="video"
              title="Share Video"
              :link="shareLink"
              :embed="embedCode"
            />
            <app-bookmark-button size="small" :post="video" v-if="isLoggedIn" />
            <app-queue-button size="small" :post="video" v-if="isLoggedIn" />
            <!-- <app-download-video-button v-if="postedByMe" :video="video" /> -->
          </div>
        </div>
      </div>
    </div>
    <div>
      <app-video-thumbnail class="video-item-thumbnail" :video="video" />
      <img 
        v-if="postedByMe && video.ispinnedonchannel"
        class="icon-action config-item-icon icon-overlay" 
        :src="pinnedVideoIcon" 
      />
    </div>
  </div>
</template>

<script>
import $bus from '@/services/bus';
import $auth from '@/services/auth';
import $popups from '@/services/popups';
import $videosApi from '@/api/videos';
// Component
import AppAvatar from '@/components/general/Avatar.vue';
import AppVideoThumbnail from '@/components/video/VideoThumbnail.vue';
import AppContextMenu from '@/components/general/ContextMenu.vue';
import AppContextMenuItem from '@/components/general/ContextMenuItem.vue';
import AppUsername from '@/components/general/Username.vue';
import AppBookmarkButton from '@/components/post/buttons/BookmarkButton.vue';
import AppQueueButton from '@/components/post/buttons/QueueButton.vue';
import AppShareButton from '@/components/post/buttons/ShareButton.vue';
import pinnedVideoIcon from '@/assets/icons/pinnedvideoicon.svg';
import IncrementFeaturedPostCount from '@/gql/posts/IncrementFeaturedPostCount.gql'

export default {
  components: {
    AppAvatar,
    AppVideoThumbnail,
    AppContextMenu,
    AppContextMenuItem,
    AppBookmarkButton,
    AppQueueButton,
    AppShareButton,
    AppUsername,
  },
  props: {
    video: {
      type: Object,
      required: true,
    },
    isFeaturedPost: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      hover: false,
      isSuperAdmin: $auth.isAdmin(),
      isLoggedIn: false,
      pinnedVideoIcon,
    };
  },
  async created() {    // Check if the user is logged in when the component is created
    this.isLoggedIn = await $auth.isLoggedInAsUser();
  },
  computed: {
    isVideoLive() {
      return this.video && this.video.video && this.video.video.isLive;
    },
    title() {
      if (this.video) {
        return (
          (this.video.video && this.video.video.title) ||
          this.video.bodyText ||
          (this.video.video && this.video.video.name) ||
          'Untitled Video'
        );
      }
      return null;
    },
    postedByMe() {
      return (
        this.video &&
        this.video.user &&
        this.video.user.id === $auth.getUserId()
      );
    },
    embedCode() {
      return `<iframe width="710" height="400" allowfullscreen="true" src="${process.env.VUE_APP_SHARE_DOMAIN}/embed/${this.video.id}"></iframe>`;
    },
    shareLink() {
      return `${process.env.VUE_APP_SHARE_DOMAIN}/posts/${this.video.id}`;
    },
    safeToDisplay() {
      return this.postedByMe || this.video.safe;
    },
  },
  async mounted() {
    this.incrementFeaturedPostCount('channels_impressionscount');
  },
  methods: {
    async deleteVideo() {
      const confirmDelete = await $popups.confirmDelete({
        title: 'Delete Video',
        message: 'Are you sure you wish to delete this video?',
      });
      if (!confirmDelete) return;
      await $videosApi.deleteVideo(this.video);
    },
    editPost() {
      this.$emit('editVideo', this.video);
    },
    reportUser() {
      const reportData = {
        id: this.video.user.id,
        type: 'user',
      };
      $bus.$emit('show-report-modal', reportData);
    },
    reportVideo(type) {
      const reportData = {
        id: this.video.id,
        type,
      };
      $bus.$emit('show-report-modal', reportData);
    },
    blockAuthor() {
      $bus.$emit('block-user-modal', {
        user: this.video.user,
      });
    },
    async downloadVideo() {
      const baseURL = 'https://forum-clouthub.s3.amazonaws.com/';
      let url = this.video.video.url;
      if (!url.startsWith('http')) {
        url = baseURL + url;
      }
      if (url.includes('mux.com') || url.includes('dacast.com')) {
        alert(
          'A downloadable version of this video is currently unavailable. Please try again later.'
        );
      } else {
        const a = document.createElement('a');
        a.href = `${process.env.VUE_APP_GRAPH_ENDPOINT}/download_file?url=${encodeURIComponent(
          url
        )}`;
        a.download = true;
        a.click();
      }
    },

    async pinVideo() {
      await $videosApi.pinUnpinUserVideo(this.video.id, true);
      this.$parent.$emit('reloadVideosList');
    },
    async incrementFeaturedPostCount(property) {
      if(this.isFeaturedPost) {
        this.$apollo.mutate({
          mutation: IncrementFeaturedPostCount,
          variables: {
            postId: this.video.id,
            property
          },
        });
      }
    },
    async videoCardClickEvent() {
      console.log('videoCardClickEvent');
      this.incrementFeaturedPostCount('channels_clickscount');
      this.incrementFeaturedPostCount('channels_viewscount');
    }
  },
};
</script>

<style scoped>
.share-dropdown {
  width: 100%;
}
.share-dropdown-btn {
  background: none;
  border: none;
  flex-direction: column-reverse;
}
.video-card {
  background-color: white;
  border-radius: 5px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
}

.video-item-thumbnail {
  width: 100%;
  height: 200px;
  object-fit: contain;
  background-color: black;
}

.video-title {
  padding: 10px;
}

.video-meta {
  padding: 10px;
  display: flex;
  gap: 10px;
}

.video-meta-info {
  flex: 1;
}

.video-meta-extras {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
}

.video-meta-extras__icons {
  display: flex;
  flex-direction: row;
  color: var(--cs-gray-05);
  align-items: center;
  gap: 8px;
}

.video-meta-extras__icons i {
  font-size: 12px;
}

.no-wrap {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ch-live-video {
  position: absolute;
  top: 37.5%;
  background: red;
  color: white;
  padding: 0 10px;
}
.ch-title-part {
  display: flex;
  justify-content: space-between;
  padding-right: 10px;
  margin-bottom: -15px;
}
.icon-overlay {
  width: 24px;
  transform: rotate(30deg);
  position: absolute;
  right: 16px;
  margin-top: 12px;
}
</style>
