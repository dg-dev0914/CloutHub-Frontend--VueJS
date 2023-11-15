<template>
  <div>
    <div class="reply-to cs-textstyle-paragraph-small">
      Replying to
      <span class="cs-textstyle-paragraph-small-bold">{{
        comment.parentPost.postedByUser.username
      }}</span>
    </div>

    <cs-comment
      v-router-link="{
        name: 'PostDetail',
        params: { id: comment.rootPostId },
        query: { comment: comment.id },
      }"
      :author="user"
      :author-name="user.displayname"
      :author-picture="profilePhotoURL"
      :message="comment.bodyText"
      :date="comment.createdAt"
      show-menu
      class="comment"
    >
      <app-post-menu :post="comment" class="menu" @click.stop="" />
      <post-media
        v-if="hasSomeMedia"
        :link-preview="comment.linkPreview"
        :images="comment.images"
        :document="comment.document"
        :video="comment.video"
        :is-comment="true"
        class="media-container"
      />
    </cs-comment>
  </div>
</template>

<script>
import PostMedia from '@/components/post/items/PostMedia.vue';
import AppPostMenu from '@/components/post/items/PostMenu.vue';
import $cdn from '@/services/cdn';

export default {
  components: {
    PostMedia,
    AppPostMenu,
  },
  props: {
    comment: {
      type: Object,
      required: true,
    },
    user: {
      type: Object,
      required: true,
    },
  },
  computed: {
    hasSomeMedia() {
      return !!(
        this.comment.linkPreview ||
        this.comment.images ||
        this.comment.document ||
        this.comment.video
      );
    },
    profilePhotoURL() {
      return $cdn.optimize(this.user.profilePhotoURL);
    },
  },
};
</script>

<style scoped>
.media-container > .ch-link-preview,
.media-container > .cs-file-preview {
  padding: 0 15px;
}
.media-container > div.post-video,
.media-container > div.post-image {
  padding: 0;
}
.reply-to {
  background: var(--cs-gray-00);
  padding: 2px 10px;
  margin-left: 2.5rem;
  border-bottom: 1px solid var(--cs-gray-01);
}
.menu {
  position: absolute;
  top: 9px;
  right: 10px;
  font-size: 18px;
  color: var(--cs-gray--01);
}
* >>> .cs-comment__icon {
  visibility: hidden;
}
.comment {
  position: relative;
}
</style>
