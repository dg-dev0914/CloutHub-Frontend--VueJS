<template>
  <app-context-menu placement="leftbottom" v-if="isLoggedIn">
    <app-context-menu-item v-if="isAuthor" @click="$emit('edit')">
      Edit Comment
    </app-context-menu-item>

    <app-context-menu-item v-if="isAuthor" @click="deleteComment(comment)">
      Delete Comment
    </app-context-menu-item>

    <app-context-menu-item v-if="isAdmin" @click="deleteComment(comment)">
      [SA] Delete Comment
    </app-context-menu-item>

    <app-context-menu-item
      v-if="!isAuthor"
      @click="report('comment', comment.id)"
    >
      Report Comment
    </app-context-menu-item>

    <app-context-menu-item
      v-if="!isAuthor"
      @click="report('user', comment.user.id)"
    >
      Report <app-username :user="comment.user" />
    </app-context-menu-item>

    <app-context-menu-item v-if="!isAuthor" @click="blockAuthor()">
      Block <app-username :user="comment.user" />
    </app-context-menu-item>
  </app-context-menu>
</template>

<script>
// Js files
import $auth from '@/services/auth';
import $bus from '@/services/bus';
import $popups from '@/services/popups';
//  Graphql files
import DeletePost from '@/gql/posts/DeletePost.gql';
// Components files
import AppContextMenu from '@/components/general/ContextMenu.vue';
import AppContextMenuItem from '@/components/general/ContextMenuItem.vue';
import AppUsername from '@/components/general/Username.vue';

export default {
  components: {
    AppContextMenu,
    AppContextMenuItem,
    AppUsername,
  },
  props: {
    comment: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isLoggedIn: false,
    };
  },
  computed: {
    isAuthor() {
      return this.comment.user && this.comment.user.id === $auth.getUserId();
    },
    isAdmin() {
      return $auth.isAdmin();
    },
  },
  created() {
    this.updateLoginStatus();
  },
  methods: {
    async updateLoginStatus() {
      this.isLoggedIn = await $auth.isLoggedInAsUser();
    },
    getDeletedCommentsCount(comment) {
      if (!comment.comments) return 1;
      return comment.comments.reduce(
        (count, currentComment) =>
          currentComment.comments && currentComment.comments.length > 0
            ? count + this.getDeletedCommentsCount(currentComment.comments)
            : count,
        comment.comments.length + 1
      );
    },
    async deleteComment() {
      const confirmDelete = await $popups.confirmDelete({
        title: 'Delete Comment',
        message: 'Are you sure you wish to delete this comment?',
      });
      if (!confirmDelete) return;
      await this.$apollo.mutate({
        mutation: DeletePost,
        variables: {
          postId: this.comment.id,
        },
        optimisticResponse: {},
        update: (cache) => {
          const normalizedId = cache.identify(this.comment);
          cache.evict({ id: normalizedId });
          cache.gc();
          const deletedCommentsCount = this.getDeletedCommentsCount(
            this.comment
          );
          cache.modify({
            id: cache.identify({
              __typename: 'Post',
              id: this.comment.rootPostId,
            }),
            fields: {
              commentsCount(prevCount) {
                return prevCount - deletedCommentsCount;
              },
            },
          });
        },
      });
    },
    report(type, id) {
      const reportData = {
        id,
        type,
      };
      $bus.$emit('show-report-modal', reportData);
    },
    blockAuthor() {
      $bus.$emit('block-user-modal', {
        user: this.comment.user,
      });
    },
  },
};
</script>
