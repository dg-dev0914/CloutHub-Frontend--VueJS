<template>
  <div class="group-card" :class="itemClass">
    <div
      v-router-link="{ name: 'GroupDetail', params: group }"
      class="group-card__content cursor-pointer"
    >
      <div class="group-card__cover">
        <app-img :src="groupPicture" class="group-card__img" />
      </div>
      <div class="group-card__body">
        <div class="group-card__name cs-textstyle-paragraph-small-bold">
          <i
            v-if="group.privacy === 'private'"
            class="cs-icons-lock group-card__lock-icon cs-textstyle-paragraph"
          ></i>
          {{ group.name }}
        </div>
        <div class="group-card__summary ch-textstyle-paragraph-extra-small">
          <span>{{ group.memberCount }} {{ membersLabel }}</span>
          <span class="group-card__summary-dot"> &bullet; </span>
          <span>{{ group.postCount }} {{ postsLabel }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AppImg from '@/components/general/Img.vue';

const defaultPictureUrl = require('@/assets/images/placeholders/group-picture.png');

export default {
  components: {
    AppImg,
  },
  props: {
    group: {
      type: Object,
      required: true,
    },
    itemClass: {
      type: String,
      default: 'col-md-3',
    },
  },
  computed: {
    groupPicture() {
      return this.group.picture ? this.group.picture : defaultPictureUrl;
    },
    membersLabel() {
      return this.group.memberCount === 1 ? 'member' : 'members';
    },
    postsLabel() {
      return this.group.postCount === 1 ? 'post' : 'posts';
    },
  },
};
</script>

<style scoped>
.group-card {
  overflow: hidden;
  padding: 10px;
}
.group-card__content {
  overflow: hidden;
  border: solid 1px var(--cs-gray-02);
  border-radius: 5px;
  background-color: var(--cs-gray-00);
  cursor: pointer;
}
.group-card__cover {
  width: 100%;
  height: 150px;
}
.group-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.group-card__body {
  padding: 12px;
}
.group-card__lock-icon {
  color: var(--cs-primary-base);
}
.group-card__name {
  overflow: hidden;
  color: var(--cs-gray-06);
  white-space: nowrap;
  text-overflow: ellipsis;
}
.group-card__summary {
  margin-top: 5px;
  color: var(--cs-gray-04);
}
.group-card__summary-dot {
  margin: 0 6px;
}
</style>
