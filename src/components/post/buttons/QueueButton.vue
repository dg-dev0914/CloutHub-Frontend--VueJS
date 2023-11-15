<template>
  <i
    ref="button"
    class="queue-button"
    :class="[size, { active: post.isQueued }, filled]"
    :title="post.isQueued ? 'Remove from Queue' : 'Add to Queue'"
    @click="toggleQueue()"
  ></i>
</template>

<script>
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
  computed: {
    filled() {
      if (this.post.isQueued) return 'cs-icons-clock-filled';
      return 'cs-icons-clock';
    },
  },
  methods: {
    toggleQueue() {
      if (this.post.isQueued) {
        $posts.unqueuePost(this.post);
      } else {
        $posts.queuePost(this.post);
      }
    },
  },
};
</script>

<style scoped>
.queue-button {
  margin: 10px;
  cursor: pointer;
}
.queue-button.active {
  color: var(--cs-primary-base);
}
.queue-button.small {
  font-size: 20px;
  margin: 0px;
}
</style>
