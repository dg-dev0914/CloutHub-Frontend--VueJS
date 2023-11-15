<template>
  <div class="navbar-icon-button">
    <div id="navbarRequestIcon" class="ch-request-button">
      <div v-if="hasUnseenRequest" class="ch-new-content-indicator"></div>
      <i
        class="ch-icons-add-user"
        tabindex="-1"
        :class="{ selectedIcon: highlight }"
      ></i>
    </div>
    <b-popover
      ref="requestPopover"
      target="navbarRequestIcon"
      placement="leftbottom"
      triggers="click blur"
      @show="showPopover"
    >
      <div class="cs-textstyle-detail-heading menu-popover-title">Requests</div>
      <div v-if="people">
        <app-request-item
          v-for="user in people.slice(0, 4)"
          :key="user.id"
          class="req-item"
          :user="user"
          @click="closeRequestPopover"
        ></app-request-item>
      </div>
      <div v-if="people && people.length === 0">
        <cs-empty-state>
          <div slot="title" class="empty-slot-title">Zero Requests</div>
          <div slot="description" class="empty-slot-desc">
            Hooray, you're all caught up with your friend requests!
          </div>
        </cs-empty-state>
      </div>
      <router-link
        v-if="people && people.length > 0"
        :to="{ name: 'Requests' }"
      >
        <div
          class="menu-popover-more cs-textstyle-detail-heading"
          @click="closeRequestPopover"
        >
          View More
        </div>
      </router-link>
    </b-popover>
  </div>
</template>

<script>
import AppRequestItem from '@/components/requests/RequestItem.vue';
import ListFriendRequests from '@/gql/connections/ListFriendRequests.gql';
import FriendsUpdatedSubscription from '@/gql/connections/FriendsUpdatedSubscription.gql';

export default {
  components: {
    AppRequestItem,
  },
  apollo: {
    people: {
      query: ListFriendRequests,
    },
  },
  data() {
    return {
      lastSeenRequestTime: localStorage.lastSeenRequestTime,
    };
  },
  created() {
    this.$apollo.queries.people.subscribeToMore({
      document: FriendsUpdatedSubscription,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        this.$apollo.queries.people.refetch();
      },
    });
  },
  computed: {
    highlight() {
      return this.$route.name === 'Requests';
    },
    hasUnseenRequest() {
      let newRequest = false;
      if (this.people) {
        this.people.forEach((data) => {
          if (
            new Date(data.myRelationship.updatedAt).getTime() >
            this.lastSeenRequestTime
          ) {
            newRequest = true;
          }
        });
      }
      return newRequest;
    },
  },
  methods: {
    closeRequestPopover() {
      this.$refs.requestPopover.$emit('close');
    },
    showPopover() {
      localStorage.lastSeenRequestTime = Date.now();
      this.lastSeenRequestTime = localStorage.lastSeenRequestTime;
    },
  },
};
</script>
<style scoped>
.ch-request-button {
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
