<template>
  <div class="tag">
    <div>
      <app-post-prompt :tag="tag" />
      <app-tag-post-list :tag="tag" />
    </div>
  </div>
</template>

<script>
import AppPostPrompt from '@/components/post/PostPrompt.vue';
import AppTagPostList from '@/components/post/lists/TagPostList.vue';

export default {
  components: {
    AppPostPrompt,
    AppTagPostList,
  },
  props: {
    tag: {
      type: String,
      required: true,
    },
  },
  data() {
    return {};
  },
};
</script>
