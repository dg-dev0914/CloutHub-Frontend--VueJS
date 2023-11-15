<template>
  <div class="post-card-header">
    <div class="post-card-header-name">
      <i class="cs-icons-share-filled"></i>
      Shared by
      <span
        v-router-link="{ name: 'Profile', params: post.user }"
        class="cursor-pointer"
      >
        <b>{{ post.user.username }}</b>
      </span>
    </div>
    <div
      class="
        post-card-header-timestamp
        cs-textstyle-paragraph-extra-small
        cursor-pointer
      "
    >
      {{ post.createdAt | moment('from') }}
    </div>
    <div>
      <app-post-menu v-if="!preview" :post="post" />
    </div>
  </div>
</template>
<script>
import AppPostMenu from '@/components/post/items/PostMenu.vue';

export default {
  components: {
    AppPostMenu,
  },
  props: {
    post: {
      type: Object,
      required: true,
    },
    preview: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
<style scoped>
.post-card-header {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.post-card-header-name {
  flex: 1;
  cursor: pointer;
}
.post-card-header-timestamp {
  margin-right: 10px;
  user-select: none;
}
</style>
