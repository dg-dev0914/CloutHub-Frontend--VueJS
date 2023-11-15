<template>
  <div>
    <app-post-prompt />
    <app-bookmarked-post-list />
  </div>
</template>

<script>
import AppPostPrompt from '@/components/post/PostPrompt.vue';
import AppBookmarkedPostList from '@/components/post/lists/BookmarkedPostList.vue';

export default {
  components: {
    AppPostPrompt,
    AppBookmarkedPostList,
  },
};
</script>
