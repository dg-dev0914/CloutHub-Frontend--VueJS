<template>
  <div class="group-item">
    <app-img
      v-router-link="{ name: 'GroupDetail', params: group }"
      :src="groupPicture"
      class="group-item-img"
    />
    <div
      v-router-link="{ name: 'GroupDetail', params: group }"
      class="group-item-body"
    >
      <div class="group-item-name" :title="group.name">
        {{ group.name }}
      </div>
      <div v-if="!slim" class="group-item-summary">
        <span>{{ privacyLabel }}</span>
        <span> &bullet; </span>
        <span>{{ group.memberCount }} {{ membersLabel }}</span>
      </div>
    </div>
    <div v-if="!slim" class="group-item-action">
      <app-group-item-config-menu v-if="showMenu" :group="group" />
      <template v-else>
        <template
          v-if="
            group.myMembership && group.myMembership.role !== 'pending-member'
          "
        >
          <img
            class="group-icon"
            src="@/assets/icons/check-circle.svg"
            alt="Group Member"
          />
          <cs-button
            v-router-link="{ name: 'GroupDetail', params: group }"
            class="group-button"
            size="small"
            fill="outline"
          >
            Go To
          </cs-button>
        </template>
        <app-group-join-button v-else short :group="group" />
      </template>
    </div>
  </div>
</template>

<script>
import AppImg from '@/components/general/Img.vue';
import AppGroupItemConfigMenu from '@/components/groups/GroupItemConfigMenu.vue';
import AppGroupJoinButton from '@/components/groups/GroupJoinButton.vue';

const defaultPictureUrl = require('@/assets/images/placeholders/group-picture.png');

const privacyLabels = new Map([
  ['secret', 'Secret Group'],
  ['private', 'Private Group'],
  ['public', 'Public Group'],
]);

export default {
  components: {
    AppGroupItemConfigMenu,
    AppGroupJoinButton,
    AppImg,
  },
  props: {
    group: {
      type: Object,
      required: true,
    },
    slim: {
      type: Boolean,
      required: false,
      default: false,
    },
    showMenu: {
      type: Boolean,
      default: false,
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
    privacyLabel() {
      return privacyLabels.get(this.group.privacy);
    },
  },
};
</script>

<style scoped>
.group-item {
  display: flex;
  margin-bottom: 25px;
  cursor: pointer;
}

.group-item-img {
  display: block;
  overflow: hidden;
  object-fit: cover;
  flex: 0 0 55px;
  height: 55px;
  margin-right: 10px;
  border-radius: 6px;
}

.group-item-name {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 16px;
  font-weight: 600;
  color: #000;
}

.group-item-body {
  overflow: hidden;
  flex: 1 1 100%;
}

.group-item-summary {
  padding-right: 10px;
  font-size: 14px;
  font-weight: normal;
  color: #747576;
}

.group-icon {
  margin-bottom: 10px;
}

.group-item-action {
  flex: 0 0 auto;
  display: flex;
  justify-content: flex-end;
  padding: 0 10px 0 0;
  flex-direction: column;
  align-items: flex-end;
}
</style>
