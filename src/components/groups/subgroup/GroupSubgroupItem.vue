<template>
  <div class="subgroup-card" :class="itemClass">
    <div
      v-router-link="{ name: 'GroupDetail', params: group }"
      class="subgroup-card__content cursor-pointer"
    >
      <div class="subgroup-card__cover">
        <app-img :src="groupPicture" class="subgroup-card__img" />
      </div>
      <div class="subgroup-card__body">
        <div class="subgroup-card__name cs-textstyle-paragraph-bold">
          <i
            v-if="group.privacy === 'private'"
            class="
              cs-icons-lock
              subgroup-card__lock-icon
              cs-textstyle-paragraph
            "
          ></i>
          {{ group.name }}
        </div>
        <div class="subgroup-card__summary ch-textstyle-paragraph-small">
          <span>{{ group.memberCount }} {{ membersLabel }}</span>
          <span class="subgroup-card__summary-dot"> &bullet; </span>
          <span>{{ group.postCount }} {{ postsLabel }}</span>
        </div>
        <app-group-join-button v-if="!userIsAdmin" :group="group" />
      </div>
    </div>
  </div>
</template>

<script>
// General components
import AppImg from '@/components/general/Img.vue';

// Group common components
import AppGroupJoinButton from '@/components/groups/GroupJoinButton.vue';

const defaultPictureUrl = require('@/assets/images/placeholders/group-picture.png');

export default {
  components: {
    AppImg,
    AppGroupJoinButton,
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
    userRole() {
      if (!this.group || !this.group.myMembership) return '';
      return this.group.myMembership.role;
    },
    userIsAdmin() {
      return this.userRole === 'admin';
    },
  },
};
</script>

<style scoped>
.subgroup-card {
  overflow: hidden;
  padding: 10px;
}
.subgroup-card__content {
  overflow: hidden;
  border: solid 1px var(--cs-gray-02);
  border-radius: 5px;
  background-color: var(--cs-gray-00);
  cursor: pointer;
  display: flex;
  flex-direction: row;
}
.subgroup-card__cover {
  width: 150px;
  height: 150px;
}
.subgroup-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.subgroup-card__body {
  padding: 12px;
  width: 60%;
}
.subgroup-card__lock-icon {
  color: var(--cs-primary-base);
}
.subgroup-card__name {
  overflow: hidden;
  color: var(--cs-gray-06);
  white-space: nowrap;
  text-overflow: ellipsis;
}
.subgroup-card__summary {
  margin-top: 5px;
  margin-bottom: 30px;
  color: var(--cs-gray-04);
}
.subgroup-card__summary-dot {
  margin: 0 6px;
}
</style>
