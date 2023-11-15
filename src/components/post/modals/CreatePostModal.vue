<template>
  <app-form-modal
    :show="showCreateModal"
    class="ch-create-post__modal"
    title="Create a Post"
    :with-closing-alert="true"
    :saving="saving"
    @close="onCloseModal"
  >
    <app-post-composer
      :post-data="postData"
      :shared-link="sharedLink"
      :group-id="groupId"
      :video="video"
      :for-groups="forGroups"
      :selected-subgroup-ids="selectedSubgroupIds"
      @saving="onSave"
      @close="onCloseModal"
      @toggleSelectSubgroupsModal="toggleSelectSubgroupsModal"
    ></app-post-composer>
  </app-form-modal>
</template>

<script>
import $bus from '@/services/bus';
import AppFormModal from '@/components/general/FormModal.vue';
import AppPostComposer from '@/components/post/composer/PostComposer.vue';

export default {
  components: {
    AppFormModal,
    AppPostComposer,
  },
  props: {
    video: File,
    groupId: {
      type: String,
      required: false,
      default: '',
    },
    room: {
      type: String,
      required: false,
      default: 'main',
    },
    sharedLink: {
      type: String,
      required: false,
      default: '',
    },
    sharedText: {
      type: String,
      required: false,
      default: '',
    },
    showCreateModal: {
      type: Boolean,
      default: false,
    },
    forGroups: {
      type: Boolean,
      default: false,
    },
    selectedSubgroupIds: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  data() {
    return {
      saving: false,
    };
  },
  computed: {
    postData() {
      if (this.sharedText) {
        const post = {
          bodyText: this.sharedText,
        };
        return post;
      }
      return {};
    },
  },
  methods: {
    toggleSelectSubgroupsModal(isOpen) {
      this.$emit('toggleSelectSubgroupsModal', isOpen);
    },
    onCloseModal() {
      this.$emit('closeCreateModal');
      $bus.$emit('remove-share');
    },

    onSave($event) {
      this.saving = $event;
      this.$emit('save');
    },
  },
};
</script>
