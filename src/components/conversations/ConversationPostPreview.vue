<template>
  <div class="ch-shared-post">
    <cs-post-card
      :date="sharedPost.createdAt"
      :author-name="sharedPost.postedByUser.username"
      :author-picture="cdn(sharedPost.postedByUser.profilePhotoURL)"
      :message="sharedPost.bodyText"
      class="cursor-pointer"
      @click="$router.push({ name: 'PostDetail', params: sharedPost })"
    >
      <div slot="message">
        <post-media
          v-if="showPostMedia"
          :link-preview="sharedPost.linkPreview"
          :images="sharedPost.images"
          :document="sharedPost.document"
          :video="sharedPost.video"
        />
      </div>
    </cs-post-card>
  </div>
</template>

<script>
import $cdn from '@/services/cdn';
import PostMedia from '@/components/post/items/PostMedia.vue';

export default {
  components: {
    PostMedia,
  },
  props: {
    sharedPost: {
      type: Object,
      required: true,
    },
  },
  computed: {
    showPostMedia() {
      const { sharedPost } = this;
      return (
        sharedPost.linkPreview ||
        sharedPost.images ||
        sharedPost.document ||
        sharedPost.video
      );
    },
  },
  methods: {
    cdn(url) {
      return $cdn.optimize(url);
    },
  },
};
</script>

<style scoped>
.ch-shared-post {
  max-width: 500px;
}
.ch-shared-post >>> .cs-post-card {
  padding: 16px;
}
.ch-shared-post >>> .cs-card__footer {
  display: none;
}
.ch-shared-post >>> .cs-post-card__reaction-info {
  display: none;
}
.ch-shared-post >>> .cs-link-preview__content-textbox--desc {
  max-height: 66px;
  overflow: hidden;
}
</style>
