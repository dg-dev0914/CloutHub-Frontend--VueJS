<template>
  <div>
    <app-spinner v-if="!post"></app-spinner>
    <div v-if="post">
      <app-video-profile-header
        :user="post.user"
        @edit="editChannel()"
        @edit-channel-cover="openChannelCoverModal"
        @refresh="refresh"
      />
      <b-row class="mt-4 ch-video-detail">
        <b-col md="8">      
          <app-video-detail-header
            v-if="post && post.user"
            :post="post"
            :user="post.user"
            @editVideo="editVideo()"
            @deleteVideo="deleteVideo()"
            @downloadVideo="downloadVideo()"
          />
          <div ref="videoContainer" class="card-no-padding scrollable">
          
            <app-video
              class="video"
              :src="src"
              :poster="post.video.thumbUrl"
              :vttfile="post.video.vttFile"
              :vttfile_es="post.video.vttFile_es"
              :vttfile_fr="post.video.vttFile_fr"
              :vttfile_de="post.video.vttFile_de"
              :vttfile_zh="post.video.vttFile_zh"
              :vttfile_ar="post.video.vttFile_ar"
              :vttfile_ru="post.video.vttFile_ru"
              :vttfile_vi="post.video.vttFile_vi"
              :vttfile_ko="post.video.vttFile_ko"
              :stream-id="post.video && post.video.streamId"
              :stream-status="post.video && post.video.streamStatus"
              :autoplay="autoplay"
              :crossorigin="anonymous"
            />
            <!--
            Taking out live chat for the time being and just replacing it with comments.
            <app-live-post-tabs
              v-if="post.video.isLive"
              :is-author="isAuthor"
              :post-id="post.id"
            />
            -->
            <!-- Removed the V-If so it shows comments whether the video is live or not.-->
            <app-video-response
              :post="post"
              @refresh="refreshVideo"
            ></app-video-response>
          </div>
          <div class="mt-3 mb-2 cs-textstyle-item-heading">Related Videos</div>

          <app-video-list
            v-if="relatedVideos"
            :videos="relatedVideos"
            item-class="col-md-6"
          ></app-video-list>
        </b-col>
        <b-col md="4">
          <app-ad-slot v-if="!isLoggedIn" zoneName="ZNLC6" width="300" height="250" />
          <app-ad-slot zoneName="ZC7" width="300" height="250" />
          <app-ad-slot zoneName="ZC8" width="300" height="250" />
        </b-col>
      </b-row>
    </div>
    <!-- Edit Video -->
    <app-edit-video-modal
      v-if="post && showEditor"
      :current-video="post"
      @close="closeEditVideoModal"
    ></app-edit-video-modal>
    <!-- Edit Channel -->
    <app-edit-channel-modal
      v-if="post && post.user"
      :user="post.user"
      :show="showEditChannelModal"
      @close="showEditChannelModal = false"
    />
    <!-- Channel Cover Modal -->
    <app-channel-cover-modal
      v-if="showCoverModal"
      :show-cover-modal="showCoverModal"
      :user-id="post.user.id"
      :channel-name="post.user.channelName"
      :cover-image="post.user.channelCover ? post.user.channelCover : null"
      from-channel-header
      @close-cover-modal.once="closeChannelCoverModal"
    />
    <template v-if="!!isAuthor">
      <!-- Edit Channel Modal -->
      <app-edit-channel-modal
        :user="post.user"
        :show="showEditChannelModal"
        @close="showEditChannelModal = false"
      />
      <!-- Create Channel Modal -->
      <app-create-channel-modal
        :user="post.user"
        :show="showCreateChannelModal"
        @close="showCreateChannelModal = false"
      />
      <!-- Channel Cover Modal -->
      <app-channel-cover-modal
        v-if="showCoverModal"
        :show-cover-modal="showCoverModal"
        :user-id="post.user.id"
        :channel-name="post.user.channelName"
        :cover-image="post.user.channelCover ? post.user.channelCover : null"
        from-channel-header
        @close-cover-modal.once="closeChannelCoverModal"
      />
    </template>
  </div>
</template>
<script>
import $cdn from '@/services/cdn';
import $popups from '@/services/popups';
import $videosApi from '@/api/videos';
import $auth from '@/services/auth';
import $bus from '@/services/bus';
import ListRelatedVideos from '@/gql/videos/ListRelatedVideos.gql';
import PublicListRelatedVideos from '@/gql/videos/PublicListRelatedVideos.gql';

import GetVideo from '@/gql/videos/GetVideo.gql';
import PublicGetVideo from '@/gql/videos/PublicGetVideo.gql';

// import AppVideoDetail from '@/components/video/VideoDetail.vue';
import AppVideoDetailHeader from '@/components/video/VideoDetailHeader.vue';
// import AppVideoItem from '@/components/video/VideoItem.vue';
import AppEditVideoModal from '@/components/video/EditVideoModal.vue';
import AppVideo from '@/components/general/Video.vue';
import AppEditChannelModal from '@/components/video/EditChannelModal.vue';
import AppSpinner from '@/components/general/Spinner.vue';
import AppLivePostTabs from '@/components/live/LivePostTabs.vue';
import AppAdSlot from '@/components/sidebar/AdSlot.vue';
import AppVideoList from '@/components/video/VideoList.vue';
import AppVideoResponse from '@/components/video/VideoResponse.vue';
import AppChannelCoverModal from '@/components/video/ChannelCoverModal.vue';
import AppVideoProfileHeader from '@/components/video/VideoProfileHeader.vue';
import AppCreateChannelModal from '@/components/video/CreateChannelModal.vue';

export default {
  components: {
    AppVideo,
    // AppVideoItem,
    AppEditVideoModal,
    AppSpinner,
    AppVideoDetailHeader,
    AppEditChannelModal,
    AppVideoProfileHeader,
    // AppVideoDetail,
    AppCreateChannelModal,
    AppLivePostTabs,
    AppAdSlot,
    AppVideoList,
    AppVideoResponse,
    AppChannelCoverModal,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  apollo: {
    post: {
      query() {
        return this.isLoggedIn ? GetVideo : PublicGetVideo;
      },
      variables() {
        return {
          id: this.id,
        };
      },

      result() {
        this.markVideoViewed();
      },
      fetchPolicy: 'network-only',
    },
    relatedVideos: {
      query() {
        return this.isLoggedIn ? ListRelatedVideos : PublicListRelatedVideos;
      },
      variables() {
        return {
          category: (this.post && this.post.category) || null,
        };
      },
      fetchPolicy: 'no-cache',
    },
  },
  data() {
    return {
      showEditChannelModal: false,
      showCreateChannelModal: false,
      showEditor: false,
      showCoverModal: false,
      markViewed: false, // DO NOT REMOVE
      postReady: false,
      isLoggedIn: false,
    };
  },
  async created() {
    this.isLoggedIn = await $auth.isLoggedInAsUser();
  },
  computed: {
    isAuthor() {
      return (
        this.post &&
        this.post.postedByUserId &&
        this.post.postedByUserId === $auth.getUserId()
      );
    },
    src() {
      if (this.post && this.post.video) {
        if (
          this.post.video.streamStatus === 'COMPLETE' ||
          this.post.video.streamStatus === 'PLAYABLE'
        ) {
          return `${process.env.VUE_APP_VIDEO_DOMAIN}/${this.post.video.streamId}/playlist.m3u8`;
        }
        return $cdn.optimize(this.post.video.url);
      }
      return null;
    },
    autoplay() {
      return true;
    },
  },
  watch: {
    async postReady(newResult) {
      if (newResult) {
        await this.$nextTick();
        const el = this.$refs.videoContainer;
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },
  },
  mounted() {
    window.addEventListener('message', (evt) => {
      if (evt.data && evt.data.type && evt.data.type === 'video-ended') {
        // this.playNextVideo();
      }
    });
  },
  methods: {
    async deleteVideo() {
      const confirmDelete = await $popups.confirmDelete({
        title: 'Delete Video',
        message: 'Are you sure you wish to delete this video?',
      });
      if (!confirmDelete) return;
      await $videosApi.deleteVideo(this.post);
      this.$router.push({ name: 'VideoHome' });
    },
    editVideo() {
      this.showEditor = true;
    },
    closeEditVideoModal() {
      this.showEditor = false;
    },
    createChannel() {
      this.showCreateChannelModal = true;
    },
    editChannel() {
      this.showEditChannelModal = true;
    },
    // Channel Cover Modal
    openChannelCoverModal() {
      this.showCoverModal = true;
    },
    closeChannelCoverModal() {
      this.showCoverModal = false;
    },
    refresh() {
      setTimeout(() => {
        this.$apollo.queries.user.refetch();
      }, 100);
    },
    async refreshVideo() {
      this.$apollo.queries.post.skip = false;
      await this.$apollo.queries.post.refetch();
    },
    // Share
    share() {
      const link = `/posts/${this.post.slug || this.post.id}`;
      $bus.$emit('show-share-other', {
        link,
        title: 'Share Video',
        post: this.post,
        embedCode: `<iframe width="710" height="400" allowfullscreen="true" src="${process.env.VUE_APP_SHARE_DOMAIN}/embed/${this.post.id}"></iframe>`,
      });
    },
    markVideoViewed() {
      // NOTE: this check is essential to avoid an infinite loop
      // When the cache updates the viewCount it will call this function again
      if (!this.markViewed) {
        this.markViewed = true;
        $videosApi.markVideoViewed(this.post);
      }
      this.postReady = true;
    },
    playNextVideo() {
      const nextVideo = this.relatedVideos[0];
      this.$router.push({
        name: 'VideoDetail',
        params: nextVideo,
        query: { autoplay: true },
      });
    },
    async downloadVideo() {
      const baseURL = 'https://forum-clouthub.s3.amazonaws.com/';
      let url = this.post.video.url;
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
  },
};
</script>
<style scoped>
.video {
  width: 100%;
}
.sidebar-title {
  border-bottom: solid 1px var(--cs-gray-02);
  margin-bottom: 10px;
  padding-bottom: 10px;
}

.related-video {
  margin-bottom: 15px;
}

.video-channel-picture {
  width: 100%;
  height: 80px;
  object-fit: cover;
  border-radius: 5px;
}
.ch-video-detail {
  position: relative;
}

.scrollable {
  overflow: hidden;
  overflow-y: scroll;
}
</style>