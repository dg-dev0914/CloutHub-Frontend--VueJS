<template>
  <div v-if="group.myMembership">
    <app-button-plain @click="showActionsheet = true">
      <img
        class="icon-action rotate-90"
        src="@/assets/icons/option.svg"
        alt="Options"
      />
    </app-button-plain>

    <portal to="modals">
      <app-modal
        size="small"
        :title="group.name"
        :show="showActionsheet"
        @close="showActionsheet = false"
      >
        <h4 class="notification-config-title">Notifications</h4>

        <div>
          <app-config-item
            label="All Posts"
            explanation="Every post in the group."
            :icon="bell"
            :active="
              group.myMembership.notificationsType ===
              GroupNotificationsType.ALL
            "
            @click="setNotificationsType(GroupNotificationsType.ALL)"
          />

          <app-config-item
            label="Friends' and Followers' posts"
            explanation="Only your friends’ and followers' posts."
            :icon="messageSquare"
            :active="
              group.myMembership.notificationsType ===
              GroupNotificationsType.FRIENDS_AND_FOLLOWERS
            "
            @click="
              setNotificationsType(GroupNotificationsType.FRIENDS_AND_FOLLOWERS)
            "
          />

          <app-config-item
            label="Off"
            explanation="Only mentions and important updates to group settings or privacy."
            :icon="bellOff"
            :active="
              group.myMembership.notificationsType ===
              GroupNotificationsType.NONE
            "
            @click="setNotificationsType(GroupNotificationsType.NONE)"
          />
        </div>

        <div slot="footer">
          <app-button-plain class="button-action" @click="leaveGroup">
            <img
              class="icon-action button-action-icon"
              src="@/assets/icons/log-out.svg"
              alt="Leave Group"
            />
            Leave Group
          </app-button-plain>
        </div>
      </app-modal>
    </portal>
  </div>
</template>

<script>
import $groups from '@/services/group';

import AppModal from '@/components/general/Modal.vue';
import AppButtonPlain from '@/components/general/ButtonPlain.vue';

import SetGroupNotificationsType from '@/gql/groups/SetGroupNotificationsType.gql';
import AppConfigItem from '@/components/general/ConfigItem.vue';

import bell from '@/assets/icons/bell.svg';
import bellOff from '@/assets/icons/bell-off.svg';
import messageSquare from '@/assets/icons/message-square.svg';

const GroupNotificationsType = {
  ALL: 'ALL',
  FRIENDS_AND_FOLLOWERS: 'FRIENDS_AND_FOLLOWERS',
  NONE: 'NONE',
};

export default {
  components: {
    AppConfigItem,
    AppModal,
    AppButtonPlain,
  },
  props: {
    group: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showActionsheet: false,
      GroupNotificationsType,
      bell,
      messageSquare,
      bellOff,
    };
  },
  methods: {
    async leaveGroup() {
      await $groups.leaveGroup(this.group);
      this.showActionsheet = false;
    },
    async setNotificationsType(notificationsType) {
      await this.$apollo.mutate({
        mutation: SetGroupNotificationsType,
        variables: {
          groupId: this.group.id,
          notificationsType,
        },
        optimisticResponse: {
          set_group_notifications_type: {
            ...this.group.myMembership,
            notificationsType,
          },
        },
      });
    },
  },
};
</script>

<style scoped>
.icon-action {
  height: 24px;
  width: 24px;
}

.rotate-90 {
  transform: rotate(90deg);
  transform-origin: center;
}

.button-action {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  color: #000;
}

.button-action-icon {
  margin-right: 15px;
}

.notification-config-title {
  margin-bottom: 10px;
  text-transform: uppercase;
  font-size: 16px;
  font-weight: bold;
  color: #000;
}
</style>
