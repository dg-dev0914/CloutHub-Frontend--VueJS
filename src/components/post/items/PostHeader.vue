<template>
  <div class="post-card-header">
    <app-avatar
      class="post-card-header-avatar cursor-pointer"
      :picture="post.user.profilePhotoURL"
      :name="post.user.displayname"
      size="small"
      :width="31"
      :height="31"
      @click="$router.push({ name: 'Profile', params: post.user })"
    >
    </app-avatar>
    <div class="post-card-header-name">
      <div>
        <span
          class="cs-textstyle-paragraph-bold cursor-pointer"
          @click="$router.push({ name: 'Profile', params: post.user })"
        >
          <app-username :user="post.user" type="displayname" />
        </span>
        <span v-if="post.group" class="cs-textstyle-paragraph"> &rarr;</span>
        <span
          v-if="post.group"
          class="cs-textstyle-paragraph-bold cursor-pointer"
          @click="
            $router.push({ name: 'GroupDetail', params: { id: post.group.id } })
          "
        >
          {{ post.group.name }}
        </span>
      </div>
      <div class="cs-textstyle-paragraph-extra-small">
        {{ post.user.username }}
      </div>
    </div>
    <div v-if="!preview">
      <app-bookmark-button :post="post" />
    </div>
    <div
      class="
        post-card-header-timestamp
        cs-textstyle-paragraph-extra-small
        cursor-pointer
      "
      @click="$router.push({ name: 'PostDetail', params: post })"
    >
      {{ post.createdAt | moment('from') }}
    </div>
    <div>
      <app-post-menu v-if="!preview" :post="post" :can-delete="canDelete" />
    </div>
  </div>
</template>

<script>
import AppAvatar from '@/components/general/Avatar.vue';
import AppPostMenu from '@/components/post/items/PostMenu.vue';
import AppUsername from '@/components/general/Username.vue';
import AppBookmarkButton from '@/components/post/buttons/BookmarkButton.vue';

export default {
  components: {
    AppAvatar,
    AppPostMenu,
    AppUsername,
    AppBookmarkButton,
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
    canDelete: {
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
.post-card-header-avatar {
  margin-right: 10px;
  cursor: pointer;
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
