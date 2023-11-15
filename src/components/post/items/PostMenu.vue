<template>
  <app-context-menu v-if="isLoggedIn">
    <app-context-menu-item v-if="canPinPost" @click="togglePin()">
      {{ post.isPinned ? 'Unpin post' : 'Pin post' }}
    </app-context-menu-item>

    <app-context-menu-item
      v-if="postedByMe" @click="trigger('show-edit-post-modal')"
    >
    Edit Post
    </app-context-menu-item>

    <app-context-menu-item v-if="postedByMe || canDelete" @click="deletePost()">
      Delete Post
    </app-context-menu-item>

    <app-context-menu-item v-if="!postedByMe" @click="report('post')">
      Report Post
    </app-context-menu-item>

    <app-context-menu-item v-if="!postedByMe" @click="report('user')">
      Report <app-username :user="post.user" />
    </app-context-menu-item>

    <app-context-menu-item v-if="!postedByMe" @click="blockAuthor()">
      Block <app-username :user="post.user"/>
    </app-context-menu-item>

    <app-context-menu-item v-if="isAdmin" @click="deletePost()">
      [SA] Delete Post
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
import $window from '@/services/window';
import $posts from '@/api/posts';

export default {
  components: {
    AppContextMenu,
    AppContextMenuItem,
    AppUsername,
  },
  props: {
    post: {
      type: Object,
      required: true,
    },
    canDelete: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isLoggedIn: false,
    };
  },
  computed: {
    postedByMe() {
      return this.post.user.id === $auth.getUserId();
    },
    isAdmin() {
      return $auth.isAdmin();
    },
    canPinPost() {
      return (
        this.post.group &&
        this.post.group.myMembership &&
        (this.post.group.myMembership.role === 'admin' ||
          this.post.group.myMembership.role === 'moderator')
      );
    },
  },
  created() {
    this.updateLoginStatus();
  },
  methods: {
    async updateLoginStatus() {
      this.isLoggedIn = await $auth.isLoggedInAsUser();
    },
    trigger(name) {
      $bus.$emit(name, this.post);
    },
    async deletePost() {
      const confirmDelete = await $popups.confirmDelete({
        title: 'Delete Post',
        message: 'Are you sure you wish to delete this post?',
      });
      if (!confirmDelete) return;
      await this.$apollo.mutate({
        mutation: DeletePost,
        variables: {
          postId: this.post.id,
        },
        optimisticResponse: {},
        update: (cache) => {
          const normalizedId = cache.identify(this.post);
          cache.evict({ id: normalizedId });
          cache.gc();
        },
      });
    },
    blockAuthor() {
      $bus.$emit('block-user-modal', {
        user: this.post.user,
      });
    },
    report(type) {
      const reportData = {
        id: type === 'post' ? this.post.id : this.post.user.id,
        type,
      };
      $bus.$emit('show-report-modal', reportData);
    },
    async togglePin() {
      const message = this.post.isPinned
        ? 'Are you sure you want to unpin the post?'
        : 'Are you sure you want to pin the post on the top?';
      const shouldTogglePost = await $popups.confirm({
        title: 'Please Confirm',
        message,
        okLabel: 'Yes',
      });

      if (shouldTogglePost) {
        $window.scrollToTop();
        await $posts.togglePostPin(this.post);
      }
    },
  },
};
</script>
