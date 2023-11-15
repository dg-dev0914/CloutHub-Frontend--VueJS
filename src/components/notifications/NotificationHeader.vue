<template>
  <div v-if="notification" class="notifications-bar">
    <b-container fluid="xl">
      <b-alert
        :show="dismissCountDown"
        dismissible
        fade
        :variant="getAlertType"
        @dismiss-count-down="countDownChanged"
        @dismissed="closeAlert()"
      >
        <p class="notification-message">
          <span class="type-notification-block"
            >**
            <span class="type-notification">{{notification.typeNotification}}</span>
            <span>:</span>
          </span>
          &#160;
          {{ notification.body }}
          &#160;<b>**</b>
        </p>
        <cs-button
          v-if="notification.url"
          :variant="'secondary'"
          :fill="'outline'"
          :size="'small'"
          :href="notification.url"
          target="_blank"
          class="read-more"
          >Learn More</cs-button
        >
      </b-alert>
    </b-container>
  </div>
</template>

<script>
import $auth from '@/services/auth';
import CheckLastActiveNotification from '@/gql/notifications/CheckLastActiveNotification.gql';
import SetLastNotification from '@/gql/auth/SetLastNotification.gql';
import NewNotificationSubscription from '@/gql/notifications/NewNotificationSubscription.gql';
import $popups from '@/services/popups';

export default {
  components: {},
  props: {},
  data() {
    return {
      dismissSecs: 300,
      dismissCountDown: 300,
      showDismissibleAlert: false,
      userId: null,
      alertType: '',
      lastActiveNotification: null,
      lastUserNotification: null,
      show: false,
      subscription: null,
      isLoggedIn: false,
    };
  },
  async created() {
    this.isLoggedIn = await $auth.isLoggedInAsUser();
    if (this.isLoggedIn) {
      this.subscription = this.$apollo.queries.notification.subscribeToMore({
        document: NewNotificationSubscription,
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data) {
            return prev;
          }
  
          this.notification = {
            id: subscriptionData.data.newNotification.data.id,
            typeNotification: subscriptionData.data.newNotification.data.type,
            body: subscriptionData.data.newNotification.notification.body,
        };
  
          this.dismissCountDown = this.dismissSecs;
        },
      });
    }
  },
  beforeDestroy() {
    if (this.subscription) {
      try {
        this.subscription.unsubscribe();
      } catch (error) {
        console.error('Error unsubscribing:', error);
      }
    }
  },
  apollo: {
    notification: {
      skip() {
        return !this.isLoggedIn;
      },
      query: CheckLastActiveNotification,
    },
  },
  computed: {
    getAlertType() {
      let alertType;
      switch (this.notification.typeNotification) {
        case 'update':
          alertType = 'info';
          break;
        case 'alert':
          alertType = 'danger';
          break;
        case 'warning':
          alertType = 'warning';
          break;
        default:
          alertType = 'secondary';
          break;
      }

      return alertType;
    },
  },
  methods: {
    countDownChanged(dismissCountDown) {
      this.dismissCountDown = dismissCountDown;
    },
    closeAlert() {
      this.dismissCountDown = 0;
      this.show = false;
      this.setLastNotification();
    },
    async setLastNotification() {
      try {
        await this.$apollo.mutate({
          mutation: SetLastNotification,
          variables: {
            notificationId: this.notification.id,
          },
          refetchQueries: [
            {
              query: CheckLastActiveNotification,
            },
          ],
        });
      } catch (err) {
        $popups.alert(err.message);
      }
    },
  },
};
</script>

<style scoped>
.notification-message {
  word-break: break-word;
}

.container-xl {
  padding-left: 0;
}

.notifications-bar {
  margin-top: 1rem;
}

.read-more {
  margin-top: 0.4rem;
  vertical-align: middle !important;
}

.type-notification-block {
  font-weight: bold;
}

.type-notification {
  text-transform: capitalize;
  text-decoration: underline;
}

.alert-info {
  color: #0c5460;
  background-color: #d1ecf1;
  border-color: #bee5eb;
}

.alert-info .read-more {
  color: #0c5460;
  border-color: #0c5460;
}

.alert-primary {
  color: #004085;
  background-color: #cce5ff;
  border-color: #b8daff;
}

.alert-primary .read-more {
  color: #004085;
  border-color: #004085;
}

.alert-secondary {
  color: #383d41;
  background-color: #e2e3e5;
  border-color: #d6d8db;
}

.alert-secondary .read-more {
  color: #383d41;
  border-color: #383d41;
}

.alert-success {
  color: #155724;
  background-color: #d4edda;
  border-color: #c3e6cb;
}

.alert-success .read-more {
  color: #155724;
  border-color: #155724;
}

.alert-danger {
  color: #721c24;
  background-color: #f8d7da;
  border-color: #f5c6cb;
}

.alert-danger .read-more {
  color: #721c24;
  border-color: #721c24;
}

.alert-warning {
  color: #856404;
  background-color: #fff3cd;
  border-color: #ffeeba;
}

.alert-warning .read-more {
  color: #856404;
  border-color: #856404;
}

.alert-dark {
  color: #1b1e21;
  background-color: #d6d8d9;
  border-color: #c6c8ca;
}

.alert-dark .read-more {
  color: #1b1e21;
  border-color: #1b1e21;
}

.alert {
  text-align: center;
}

.alert p {
  margin-bottom: 0;
}
</style>
