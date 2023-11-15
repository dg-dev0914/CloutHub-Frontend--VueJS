<template>
  <app-modal
    :show="showEditPost"
    :with-closing-alert="true"
    :title="title"
    :hide-close="saving"
    @close="onCloseEdit"
  >
    <app-post-composer
      :post-data="post"
      :user="user"
      @close="onCloseEdit"
      @saving="onSave"
    />
  </app-modal>
</template>

<script>
import AppModal from '@/components/general/Modal.vue';
import AppPostComposer from '@/components/post/composer/PostComposer.vue';
import $bus from '@/services/bus';
import $auth from '@/services/auth';

export default {
  components: {
    AppModal,
    AppPostComposer,
  },
  data() {
    return {
      showEditPost: false,
      post: null,
      user: null,
      title: null,
      saving: false,
    };
  },
  async mounted() {
    this.user = await $auth.getUser();
    $bus.$on('show-edit-post-modal', (post, title) => {
      this.post = post;
      this.showEditPost = true;
      this.title = title || 'Edit Post';
    });
  },
  methods: {
    onCloseEdit() {
      this.showEditPost = false;
    },
    onSave($event) {
      this.saving = $event;
    },
  },
};
</script>

<style scoped></style>
