<template>
  <div class="video-card" v-if="safeToDisplay">
    <div v-if="video.video.isLive" class="ch-live-video">LIVE</div>
    <app-video-thumbnail class="video-item-thumbnail" :video="video" />
    <div class="video-item-body">
      <div class="ch-title-part">
        <div
          v-router-link="{ name: 'VideoDetail', params: video }"
          class="
            video-title
            cs-textstyle-paragraph-bold
            no-wrap
            cursor-pointer
            ch-height-fix
          "
        >
          {{ title }}
        </div>
        <app-context-menu>
          <!-- TEMPORARILY DISABLED WHILE WE FIX VIDEO EDIT -->
          <!-- <app-context-menu-item v-if="postedByMe" @click="editPost">Edit</app-context-menu-item> -->
          <app-context-menu-item v-if="postedByMe" @click="deleteVideo"
            >Delete Video</app-context-menu-item
          >
          <app-context-menu-item
            v-if="postedByMe"
            @click="reportVideo('own-video')"
            >Report Video</app-context-menu-item
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
            >Delete Video</app-context-menu-item
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
              size="small"
              :post="video"
              title="Share Video"
              :link="shareLink"
              :embed="embedCode"
            />
            <app-bookmark-button
              v-if="
                view === BOOKMARKED_VIDEO ||
                view === HISTORY_VIDEO ||
                view === FIND_VIDEO
              "
              size="small"
              :post="video"
            />
            <app-queue-button
              v-if="
                view === TO_WATCH_VIDEO ||
                view === HISTORY_VIDEO ||
                view === FIND_VIDEO
              "
              size="small"
              :post="video"
            />
          </div>
        </div>
      </div>
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
import AppContextMenu from '@/components/general/ContextMenu.vue';
import AppContextMenuItem from '@/components/general/ContextMenuItem.vue';
import AppUsername from '@/components/general/Username.vue';
import AppBookmarkButton from '@/components/post/buttons/BookmarkButton.vue';
import AppQueueButton from '@/components/post/buttons/QueueButton.vue';
import AppShareButton from '@/components/post/buttons/ShareButton.vue';
import AppVideoThumbnail from '@/components/video/VideoThumbnail.vue';

export default {
  components: {
    AppAvatar,
    AppContextMenu,
    AppContextMenuItem,
    AppBookmarkButton,
    AppQueueButton,
    AppShareButton,
    AppUsername,
    AppVideoThumbnail,
  },
  props: {
    video: {
      type: Object,
      required: true,
    },
    view: {
      type: String,
      required: false,
      default: '',
    },
  },
  data() {
    return {
      hover: false,
      isSuperAdmin: $auth.isAdmin(),
      BOOKMARKED_VIDEO: 'bookmarked',
      TO_WATCH_VIDEO: 'queue',
      HISTORY_VIDEO: 'history',
      FIND_VIDEO: 'find',
    };
  },
  computed: {
    title() {
      if (this.video) {
        return (
          this.video.video.title ||
          this.video.bodyText ||
          this.video.video.name ||
          'Untitled Video'
        );
      }
      return null;
    },
    postedByMe() {
      return this.video.user.id === $auth.getUserId();
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
      $bus.$emit('show-edit-post-modal', this.video, 'Edit video');
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
  },
};
</script>

<style scoped>
.ch-title-part {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-right: 10px;
}
.ch-height-fix {
  height: 88px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.video-item-body {
  width: 100%;
}
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
  display: grid;
  grid-template-columns: 35% 65% !important;
}

.video-item-thumbnail {
  width: 100%;
  height: 150px;
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
}

.video-meta-extras__icons {
  display: flex;
  flex-direction: row;
  color: var(--cs-gray-05);
  align-items: center;
  gap: 8px;
}

.video-meta-extras__icons i {
  font-size: 8px;
}
.ch-live-video {
  position: absolute;
  top: 0;
  background: red;
  color: white;
  padding: 0 10px;
}
</style>
