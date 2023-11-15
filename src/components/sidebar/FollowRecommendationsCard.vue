<template>
  <cs-card class="follow-card sidebar-card">
    <div slot="body">
      <div class="header">Follow Someone New</div>
      <div>
        <app-spinner v-if="!users.length" size="small"></app-spinner>
        <div
          v-for="user in displayUsers"
          :key="user.id"
          class="followcard-profile"
          :class="{ dismissed: dismissed.includes(user) }"
        >
          <app-avatar
            v-router-link="{ name: 'Profile', params: user }"
            class="ch-avatar cursor-pointer"
            :picture="user.profilePhotoURL"
            :name="user.firstname"
            variant="primary"
            size="medium"
          ></app-avatar>
          <div style="overflow: hidden">
            <div
              v-router-link="{ name: 'Profile', params: user }"
              class="cs-textstyle-paragraph-bold cursor-pointer"
            >
              <app-username :user="user" />
            </div>
            <div class="cs-textstyle-paragraph-small follow-card-bio">
              {{ user.bio }}
            </div>
            <div class="followcard-response-buttons">
              <app-follow-button
                :target="user"
                size="small"
                @click="remove(user)"
                >Follow {{ user.username }}</app-follow-button
              >
              <cs-button fill="outline" size="small" @click="remove(user)"
                >Next</cs-button
              >
            </div>
          </div>
        </div>
        <div
          v-router-link="{ name: 'UserList', params: { view: 'recommended' } }"
          class="discover-more-link cs-textstyle-paragraph-small cursor-pointer"
        >
          <cs-button block fill="clear">Discover More</cs-button>
        </div>
      </div>
    </div>
  </cs-card>
</template>

<script>
import AppAvatar from '@/components/general/Avatar.vue';
import AppFollowButton from '@/components/general/FollowButton.vue';
import AppUsername from '@/components/general/Username.vue';
import AppSpinner from '@/components/general/Spinner.vue';
import ListRecommendedUsers from '@/gql/connections/RecommendedUsers.gql';

export default {
  components: {
    AppAvatar,
    AppFollowButton,
    AppUsername,
    AppSpinner,
  },
  data() {
    return {
      users: [],
      displayUsers: [],
      dismissed: [],
      selectedIndex: 0,
    };
  },
  mounted() {
    this.loadMore();
  },
  methods: {
    async loadMore() {
      const resp = await this.$apollo.query({
        query: ListRecommendedUsers,
      });
      this.users = [...this.users, ...resp.data.people].filter(
        (u) => !u.myRelationship.isFollower
      );
      if (this.displayUsers.length === 0) {
        this.displayUsers = this.users.splice(0, 3);
      }
    },
    remove(user) {
      this.dismissed.push(user);
      setTimeout(() => {
        const i = this.displayUsers.indexOf(user);
        this.displayUsers[i] = this.users.pop();
        this.users = this.users.filter((u) => u.id !== user.id);
        if (this.users.length < 5) {
          this.loadMore();
          this.dismissed = [];
        }
      }, 300);
    },
  },
};
</script>
<style scoped>
.followcard-profile {
  display: flex;
  border-bottom: solid 1px var(--cs-gray-01);
  padding: 15px;
  gap: 10px;
  -webkit-transition: opacity 0.3s ease-in-out;
  opacity: 1;
}

.followcard-profile.dismissed {
  opacity: 0;
}

.followcard-profile:last-of-type {
  /* margin-bottom: 0px;
  padding-bottom: none;
  border-bottom: none; */
}
.followcard-response-buttons {
  display: flex;
  flex-wrap: wrap;
  margin-top: 15px;
  gap: 5px;
}
.follow-card-bio {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 42px;
}
.discover-more-link {
  text-align: center;
}
@media (min-width: 1200px) {
  .follow-card-bio {
    height: 43px;
  }
}
</style>
