<template>
  <div>
    <app-gif-modal />
    <app-share-list-modal />
    <app-share-post-modal />
    <app-reaction-list-modal />
    <app-edit-post-modal />
    <app-report-modal />
    <app-new-message-modal />
    <app-block-user-modal />
    <app-share-outside-app-modal />
    <app-profile-preview-modal />
  </div>
</template>
<script>
import AppProfilePreviewModal from '@/components/followCards/ProfilePreviewModal.vue';
import AppShareListModal from './ShareListModal.vue';
import AppReactionListModal from './ReactionListModal.vue';
import AppSharePostModal from './SharePostModal.vue';
import AppReportModal from './ReportModal.vue';
import AppEditPostModal from './EditPostModal.vue';
import AppGifModal from './GifModal.vue';
import AppNewMessageModal from './NewMessageModal.vue';
import AppBlockUserModal from './BlockUserModal.vue';
import AppShareOutsideAppModal from './ShareOutsideAppModal.vue';

export default {
  components: {
    AppShareListModal,
    AppSharePostModal,
    AppReactionListModal,
    AppEditPostModal,
    AppGifModal,
    AppReportModal,
    AppNewMessageModal,
    AppShareOutsideAppModal,
    AppBlockUserModal,
    AppProfilePreviewModal,
  },
};
</script>
