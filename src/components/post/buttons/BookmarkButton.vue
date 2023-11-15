<template>
  <i v-if="isLoggedIn"
    class="bookmark-button"
    :class="[size, { active: post.isBookmarked }, filled]"
    :title="post.isBookmarked ? 'Remove from Bookmarks' : 'Add to Bookmarks'"
    @click="toggleBookmark()"
  ></i>
</template>

<script>
import $auth from '@/services/auth';
import $posts from '@/api/posts';

export default {
  props: {
    post: {
      type: Object,
      required: true,
    },
    size: {
      type: String,
      required: false,
      default: '',
    },
  },
  data() {
    return {
      isLoggedIn: false,
    };
  },
  computed: {
    filled() {
      return this.post.isBookmarked
        ? 'cs-icons-bookmark-filled'
        : 'cs-icons-bookmark';
    },
  },
  created() {
    this.updateLoginStatus();
  },
  methods: {
    async updateLoginStatus() {
      this.isLoggedIn = await $auth.isLoggedInAsUser();
    },
    toggleBookmark() {
      if (this.post.isBookmarked) {
        $posts.unbookmarkPost(this.post);
      } else {
        $posts.bookmarkPost(this.post);
      }
    },
  },
};
</script>

<style scoped>
.bookmark-button {
  margin: 10px;
  cursor: pointer;
}
.bookmark-button.active {
  color: var(--cs-primary-base);
}
.bookmark-button.small {
  font-size: 20px;
  margin: 0px;
}
</style>
