<template>
  <div>
    <app-spinner v-if="!videos"></app-spinner>
    <div v-if="videos">
      <div v-for="index in safeVideos.length / 3" class="row">
        <div
          v-for="subIndex in 3"
          :key="safeVideos[(index - 1) * 3 + (subIndex - 1)].id"
          class="video-card-wrapper"
          :class="itemClass"
        >
          <app-video-item
          :video="safeVideos[(index - 1) * 3 + (subIndex - 1)]"
          @editVideo="editVideo"
          @reloadVideosList="reloadVideosList()"
          >
          </app-video-item>
        </div>
        <div v-if="index % 5 == 3" class="ad-slot--wrapper" :style="{'height':'90px'}">
          <app-ad-slot zoneName="ZZNEW3" invocationCode="41" width="970" height="90" v-if="index % 5 == 3" />
        </div>
      </div>
      <!-- <div
    <div v-if="videos && featuredPosts" class="row">
      <div
        v-for="video in safeVideos"
        :key="video.id"
        class="video-card-wrapper"
        :class="itemClass"
      >
        <app-video-item
         :video="video"
         :isFeaturedPost="isFeaturedPost(video.id)"
         @editVideo="editVideo"
         @reloadVideosList="reloadVideosList()"
        >
        </app-video-item>
      </div> -->
      <cs-empty-state
        v-if="!videos.length"
        :title="placeholder"
        class="empty-state-border"
      >
      </cs-empty-state>
    </div>
    <app-edit-video-modal
      v-if="editingVideo && showEditor"
      :current-video="editingVideo"
      @close="closeEditVideoModal"
    ></app-edit-video-modal>
  </div>
</template>
<script>
import AppSpinner from '@/components/general/Spinner.vue';
import AppVideoItem from '@/components/video/VideoItem.vue';
import AppEditVideoModal from '@/components/video/EditVideoModal.vue';
import AppAdSlot from '@/components/sidebar/AdSlot.vue';
import ListFeaturedPosts from '@/gql/posts/ListFeaturedPosts.gql';

export default {
  components: {
    AppVideoItem,
    AppSpinner,
    AppEditVideoModal,
    AppAdSlot
  },
  data() {
    return {
      showEditor: false,
      editingVideo: null
    }
  },
  apollo: {
    featuredPosts: {
      query: ListFeaturedPosts,
    },
  },
  props: {
    videos: {
      type: Array,
      required: true,
    },
    itemClass: {
      type: String,
      default: 'col-md-4',
    },
    placeholder: {
      type: String,
      default: 'No matching videos',
    },
  },
  computed: {
    safeVideos() {
      const { videos } = this;
        if(window.location.href.includes("#/videos/channel")) {
          return videos
          .filter(video => video.safe)
          .sort((a, b) => {
            const pinnedA = a.ispinnedonchannel ? 1 : 0;
            const pinnedB = b.ispinnedonchannel ? 1 : 0;
            return pinnedB - pinnedA;
          })
          .map(video => ({ ...video }));
        } else {
          return this.videos.filter(video => video.safe);
        }
      },
  },
  methods: {
    closeEditVideoModal() {
      this.showEditor = false;
      this.editingVideo = null;
    },
    editVideo(post) {
      this.showEditor = true;
      this.editingVideo = post;
      // $bus.$emit('show-edit-post-modal', this.video, 'Edit video');
    },
    reloadVideosList() {
      this.$parent.$emit('reloadVideosList');
    },
    isFeaturedPost(postId) {
      return this.featuredPosts.some(x => x.postid === postId);
    }
  },
  async mounted() {
    await this.$apollo.queries.featuredPosts.refetch();
  },
};
</script>
<style scoped>
.video-card-wrapper {
  padding: 10px;
  padding-top: 0px;
  padding-bottom: 20px;
}
.empty-state-border {
  border: dashed 1px var(--cs-gray-02);
  border-radius: 10px;
}
.ad-container p {
  display: none;
}
.ad-slot--wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 90px !important;
}
</style>
