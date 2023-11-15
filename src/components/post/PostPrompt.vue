<template>
  <div v-if="user">
    <div class="new-post" @click="openCreatePostModal">
      <app-avatar
        v-if="!video"
        :picture="user.profilePhotoURL"
        :name="user.displayname"
        size="small"
        :width="31"
        :height="31"
      />
      <div class="new-post__content">
        Share an article, photo, video or an idea...
      </div>
      <i class="cs-icons-send-filled"></i>
    </div>
    <!-- Create Post Modal -->
    <app-create-post-modal
      :user="user"
      :video="videoAttachment"
      :for-groups="forGroups"
      :group-id="groupId"
      :shared-link="link"
      :shared-text="sharedText"
      :show-create-modal="showCreateModal"
      :selected-subgroup-ids="selectedSubgroups"
      @closeCreateModal="closeCreateModal"
      @save="$emit('save')"
      @toggleSelectSubgroupsModal="toggleSelectSubgroupsModal"
    >
    </app-create-post-modal>
    <app-select-subgroups-modal
      v-if="forGroups"
      :show="visibleSelectSubgroupModal"
      :group-id="groupId"
      :selected-subgroups="selectedSubgroups"
      @close="visibleSelectSubgroupModal = false"
      @toggleSubgroup="toggleSubgroup"
    />
  </div>
</template>

<script>
import $auth from '@/services/auth';
import AppCreatePostModal from '@/components/post/modals/CreatePostModal.vue';
import AppSelectSubgroupsModal from '@/components/groups/SelectSubgroupsModal.vue';
import AppAvatar from '@/components/general/Avatar.vue';
import GetProfile from '@/gql/general/GetProfile.gql';

export default {
  components: {
    AppCreatePostModal,
    AppSelectSubgroupsModal,
    AppAvatar,
  },
  props: {
    groupId: {
      type: String,
      required: false,
      default: '',
    },
    video: File,
    link: {
      type: String,
      required: false,
      default: '',
    },
    sharedText: {
      type: String,
      required: false,
      default: '',
    },
    hasShare: {
      type: Boolean,
      default: false,
    },
    forGroups: {
      type: Boolean,
      default: false,
    },
  },
  apollo: {
    user: {
      query: GetProfile,
      variables() {
        return {
          id: $auth.getUserId(),
        };
      },
    },
  },
  data() {
    return {
      videoAttachment: null,
      user: null,
      showCreateModal: false,
      visibleSelectSubgroupModal: false,
      selectedSubgroups: [],
    };
  },
  watch: {
    hasShare() {
      if (this.hasShare) {
        this.openCreatePostModal();
      }
    },
  },
  async mounted() {
    this.videoAttachment = this.video;
    if (this.video) this.showCreateModal = true;
  },
  methods: {
    toggleSelectSubgroupsModal(isOpen) {
      this.visibleSelectSubgroupModal = isOpen;
    },
    // Create Modal
    openCreatePostModal() {
      this.showCreateModal = true;
    },
    closeCreateModal() {
      this.showCreateModal = false;
      this.$emit('close');
    },
    toggleSubgroup(id) {
      if (!this.selectedSubgroups.includes(id)) {
        this.selectedSubgroups.push(id);
      } else {
        const index = this.selectedSubgroups.indexOf(id);
        this.selectedSubgroups.splice(index, 1);
      }
    },
  },
};
</script>

<style scoped>
.new-post {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  background: white;
  padding: 15px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
  border-radius: var(--cs-card-border-radius);
  cursor: pointer;
}
.new-post__content {
  margin: 0 15px;
  color: var(--cs-gray-03);
  flex: 1;
}
.new-post i {
  color: var(--cs-primary-base);
  font-size: 20px;
}
</style>
