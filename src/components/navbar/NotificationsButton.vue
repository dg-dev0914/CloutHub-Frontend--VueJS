<template>
  <div class="navbar-icon-button">
    <div id="navbarNotificationsIcon" class="ch-notification-button">
      <i
        class="ch-icons-notification"
        tabindex="-1"
        :class="{ selectedIcon: highlight }"
      ></i>
      <div v-if="hasUnseenNotification" class="ch-new-content-indicator"></div>
    </div>
    <b-popover
      ref="notificationPopover"
      target="navbarNotificationsIcon"
      placement="leftbottom"
      triggers="click blur"
      custom-class="menu-popover"
      @show="showPopover"
    >
      <div class="cs-textstyle-detail-heading menu-popover-title">
        Notifications
      </div>
      <div v-if="notifications" class="notifications-list">
        <app-notification-item
        v-for="(notification, $index) in groupedNotifications"
        :key="$index"
        :notification="notification"
        @click="closeNotificationPopOver"
      >
        <template v-slot:more>
          <span v-if="notification.count > 1">
            And More ({{ notification.count - 1 }})
          </span>
        </template>
      </app-notification-item>
      </div>
      <div v-if="notifications && notifications.length === 0">
        <cs-empty-state>
          <div slot="title" class="empty-slot-title">Zero Notifications</div>
          <div slot="description" class="empty-slot-desc">
            No one has interacted with you yet.
          </div>
        </cs-empty-state>
      </div>
      <router-link
        v-if="notifications && notifications.length"
        :to="{ name: 'Notifications' }"
      >
        <div
          class="menu-popover-more cs-textstyle-detail-heading"
          @click="closeNotificationPopOver"
        >
          View More
        </div>
      </router-link>
    </b-popover>
  </div>
</template>

<script>
import $auth from '@/services/auth';

import ListNotifications from '@/gql/notifications/ListNotifications.gql';
import AppNotificationItem from '@/components/notifications/NotificationItem.vue';
import ActivitiesUpdatedSubscription from '@/gql/general/ActivitiesUpdatedSubscription.gql';


export default {
  components: {
    AppNotificationItem,
  },
  apollo: {
    notifications: {
      query: ListNotifications,
    },
  },
  data() {
    return {
      lastSeenNotificationTime: localStorage.lastSeenNotificationTime,
    };
  },
  computed: {
    groupedNotifications() {
      if (!this.notifications) {
        return [];
      }

      const grouped = this.notifications.reduce((acc, notif) => {
        const key = notif.lastActor.username;
        if (!acc[key]) {
          acc[key] = {
            ...notif,
            count: 1,
          };
        } else {
          acc[key].count += 1;
          if (new Date(acc[key].updatedAt) < new Date(notif.updatedAt)) {
            acc[key] = {
              ...notif,
              count: acc[key].count,
            };
          }
        }

        return acc;
      }, {});

      const groupedArray = Object.values(grouped);
      return groupedArray.slice(0, 5);
    },
    hasUnseenNotification() {
      let newNotification = false;
      if (this.groupedNotifications) {
        this.groupedNotifications.forEach((data) => {
          const notifTime = new Date(data.updatedAt).getTime();
          if (notifTime > this.lastSeenNotificationTime) {
            newNotification = true;
          }
        });
      }
      return newNotification;
    },
    highlight() {
      return this.$route.name === 'Notifications';
    },
  },
  created() {
    this.$apollo.queries.notifications.subscribeToMore({
      document: ActivitiesUpdatedSubscription,
      variables: {
        userId: $auth.getUserId(),
      },

      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const updatedActivity = subscriptionData.data.activitiesUpdated;
        this.$apollo.queries.notifications.refetch();
      },
    });
  },
  methods: {
    showPopover() {
      localStorage.lastSeenNotificationTime = Date.now();
      this.lastSeenNotificationTime = localStorage.lastSeenNotificationTime;
    },
    closeNotificationPopOver() {
      this.$refs.notificationPopover.$emit('close');
    },
  },
};
</script>

<style scoped>
.notifications-list {
  max-height: 450px;
  overflow-y: auto;
}
.ch-notification-button {
  display: flex;
}
.ch-new-content-indicator {
  width: 10px;
  position: absolute;
  height: 10px;
  background: var(--cs-primary-base);
  border-radius: 25px;
  margin-left: 15px;
}
</style>
