<template>
  <div ref="notificationList" class="notification-view">
    <div class="notification-header cs-textstyle-paragraph-bold">
      Notifications
    </div>
    <app-spinner v-if="!notifications"></app-spinner>
    <div v-else class="textmore">
      <div
        v-for="(group, $index) in filteredNotifications"
        :key="$index"
        class="notification-group"
      >
        <div class="wrapper">
          <app-notification-item :notification="group" />
          <button
            v-if="group.notifications.length > 1"
            class="expand-collapse-btn"
            @click.prevent="toggleExpanded(group.lastActor.username)"
          >
            {{ isExpanded(group.lastActor.username) ? 'Collapse' : 'Expand' }}
          </button>
        </div>
        <div v-if="isExpanded(group.lastActor.username)">
          <app-notification-item
            v-for="(notification, innerIndex) in group.notifications.slice(1)"
            :key="`inner-${innerIndex}`"
            :notification="notification"
          />
        </div>
      </div>
      <app-infinite-simple
        :query="$apollo.queries.notifications"
        sort-key="updatedAt"
      />
    </div>
  </div>
</template>

<script>
import ListNotifications from '@/gql/notifications/ListNotifications.gql';
import AppNotificationItem from '@/components/notifications/NotificationItem.vue';
import AppInfiniteSimple from '@/components/general/InfiniteSimple.vue';
import AppSpinner from '@/components/general/Spinner.vue';

export default {
  components: {
    AppNotificationItem,
    AppInfiniteSimple,
    AppSpinner,
  },
  apollo: {
    notifications: {
      query: ListNotifications,
      variables() {
        return {};
      },
    },
  },
  data() {
    return {
      expandedGroups: {},
    };
  },
  computed: {
    filteredNotifications() {
      if (!this.notifications) {
        return [];
      }

      const sortedNotifications = this.notifications.slice().sort((a, b) => {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });

      const grouped = sortedNotifications.reduce((acc, notif) => {
        const key = notif.lastActor.username;
        if (!acc[key]) {
          acc[key] = {
            ...notif,
            notifications: [notif],
          };
        } else {
          acc[key].notifications.push(notif);
        }

        return acc;
      }, {});

      return Object.values(grouped);
    },
  },
  methods: {
    toggleExpanded(username) {
      this.$set(this.expandedGroups, username, !this.expandedGroups[username]);
    },
    isExpanded(username) {
      return this.expandedGroups[username];
    },
  },
};
</script>

<style scoped>
.notification-view {
  background: white;
  border-radius: 5px;
  height: calc(100vh - 100px);
  overflow: auto;
}
.notification-header {
  padding: 10px;
  border-bottom: 1px solid #e6eaea;
}
.text.textmore {
  word-break: break-word;
}
.wrapper {
  display: flex;
  align-items: center;
}
.expand-collapse-btn {
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 4px;
  color: #333;
  cursor: pointer;
  font-size: 12px;
  margin-left: 10px;
  padding: 2px 8px;
  transition: background-color 0.3s ease;
}
.expand-collapse-btn:hover {
  background-color: #e0e0e0;
}
</style>