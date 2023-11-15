<template>
  <i
    class="ch-post-share-button ch-icons-share"
    :class="[size]"
    title="Share"
    @click="share()"
  ></i>
</template>
<script>
import $bus from '@/services/bus';

export default {
  props: {
    post: {
      type: Object,
      required: true,
    },
    title: {
      type: String,
      default: 'Share Post',
    },
    embed: {
      type: String,
      required: false,
      default: null,
    },
    size: {
      type: String,
      required: false,
      default: '',
    },
  },
  methods: {
    share() {
      const link = this.post.video
        ? `/v/${this.post.id}`
        : `/p/${this.post.slug || this.post.id}`;
      const shareOptions = {
        link,
        title: this.title,
        post: this.post,
      };
      if (this.embed) shareOptions.embedCode = this.embed;
      $bus.$emit('show-share-other', shareOptions);
    },
  },
};
</script>
<style scoped>
.ch-post-share-button {
  margin: 10px;
  cursor: pointer;
}
.ch-post-share-button.small {
  font-size: 20px;
  margin: 0px;
}
</style>
