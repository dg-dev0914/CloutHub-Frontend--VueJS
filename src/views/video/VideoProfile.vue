<template>
  <div>
    <app-spinner v-if="!user" />
    <div
      v-if="
        user &&
        !user.channelName &&
        !user.videoPosts.count &&
        isLogged &&
        !user.myRelationship.isBlocked
      "
    >
      <div class="create-channel-placeholder">
        <img
          class="profile-banner"
          :src="require('@/assets/images/placeholders/profile-banner.png')"
        />
        <div class="create-channel-placeholder-content">
          <div class="cs-textstyle-item-heading">Create a CloutHub Channel</div>
          <div class="mt-4">
            It looks like your channel isn't set up yet. Create your channel in
            6 easy steps so you can share your videos to your friends, followers
            and groups!
          </div>
          <div class="mt-4">
            <cs-button @click="createChannel()">+ Create Channel</cs-button>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="
        user &&
        (user.channelName || user.videoPosts.count || !isLogged) &&
        !user.myRelationship.isBlocked
      "
    >
      <app-video-profile-header
        :user="user"
        @edit="editChannel()"
        @afterSubscribeClick="changeReloadUserFlag()"
        @edit-channel-cover="openChannelCoverModal"
        @refresh="refresh"
      />
      <app-video-list
        v-if="videos"
        class="mt-4"
        :videos="videos"
        @reloadVideosList="reloadVideosList()"
      ></app-video-list>
      <app-infinite-simple
        :query="$apollo.queries.videos"
        sort-key="createdAt"
      />
    </div>
    <template v-if="!!isLogged">
      <!-- Edit Channel Modal -->
      <app-edit-channel-modal
        :user="user"
        :show="showEditChannelModal"
        @close="showEditChannelModal = false"
      />
      <!-- Create Channel Modal -->
      <app-create-channel-modal
        :user="user"
        :show="showCreateChannelModal"
        @close="showCreateChannelModal = false"
      />
      <!-- Channel Cover Modal -->
      <app-channel-cover-modal
        v-if="showCoverModal"
        :show-cover-modal="showCoverModal"
        :user-id="user.id"
        :channel-name="user.channelName"
        :cover-image="user.channelCover ? user.channelCover : null"
        from-channel-header
        @close-cover-modal.once="closeChannelCoverModal"
      />
    </template>
    <b-container
      v-if="user && user.myRelationship.isBlocked"
      fluid="xl"
      class="px-0"
    >
      <app-blocked-user-profile :user="user" @unblock="unblock" />
    </b-container>
  </div>
</template>

<script>
import $auth from '@/services/auth';
// Component
import AppVideoProfileHeader from '@/components/video/VideoProfileHeader.vue';
import AppVideoList from '@/components/video/VideoList.vue';
import AppSpinner from '@/components/general/Spinner.vue';
import AppEditChannelModal from '@/components/video/EditChannelModal.vue';
import AppCreateChannelModal from '@/components/video/CreateChannelModal.vue';
import AppInfiniteSimple from '@/components/general/InfiniteSimple.vue';
import AppChannelCoverModal from '@/components/video/ChannelCoverModal.vue';
import AppBlockedUserProfile from '@/components/connections/BlockedUserProfile.vue';

// GQL
import GetChannel from '@/gql/videos/GetChannel.gql';
import ListUserVideos from '@/gql/videos/ListUserVideos.gql';

export default {
  components: {
    AppVideoProfileHeader,
    AppVideoList,
    AppSpinner,
    AppEditChannelModal,
    AppCreateChannelModal,
    AppInfiniteSimple,
    AppChannelCoverModal,
    AppBlockedUserProfile,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      showEditChannelModal: false,
      showCreateChannelModal: false,
      showCoverModal: false,
      reloadAfterClickingSubscribeButton: false,
    };
  },
  apollo: {
    user: {
      query: GetChannel,
      variables() {
        return {
          id: this.id,
        };
      },
      skip() {
        return !!this.user && !this.reloadAfterClickingSubscribeButton;
      },
    },
    videos: {
      query: ListUserVideos,
      variables() {
        return {
          userId: this.id,
        };
      },
    },
  },
  computed: {
    isLogged() {
      return this.user && this.user.id === $auth.getUserId();
    },
  },
  watch: {
    user() {
      this.reloadAfterClickingSubscribeButton = false;
    },
  },
  methods: {
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
    unblock() {
      this.$apollo.queries.user.refetch();
    },
    changeReloadUserFlag() {
      this.reloadAfterClickingSubscribeButton = true;
    },
    reloadVideosList() {
      this.$apollo.queries.videos.refetch();
    }
  },
};
</script>
<style scoped>
.live-video-frame {
  display: flex;
  gap: 10px;
  flex-direction: column;
  font-weight: bold;
  margin-top: 15px;
  margin-bottom: 15px;
  position: relative;
}
.live-video {
  min-height: 400px;
  border-radius: 10px;
}
.video-profile__extras {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
.video-profile__extras--options {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}
.create-channel-placeholder {
  border: dashed 1px var(--cs-gray-03);
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  flex-direction: column;
  text-align: center;
}
.create-channel-placeholder-content {
  padding: 30px;
}
.live-badge {
  position: absolute;
  color: red;
  z-index: 1000;
  margin-left: 15px;
  margin-top: 10px;
}
</style>
