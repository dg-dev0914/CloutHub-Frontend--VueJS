<template>
  <div class="ch-profile">
    <app-spinner v-if="!user"></app-spinner>
    <b-container v-if="user && !user.myRelationship.isBlocked" fluid="xl">
      <b-row>
        <b-col md="12">
          <app-profile-header :user="user" />
          <div class="ch-profile__nav-tabs">
            <cs-page-tabs
              v-if="isLogged"
              :key="'personal-connections-' + user.id"
              align="left"
              no-border
              class="ch-home__nav-page-tabs"
              :tabs="tabs"
              :value="selectedTab"
              @input="selectTab"
            >
              <div class="second-row" :class="{ botMarge: !isLogged }">
                <cs-button
                  fill="clear"
                  size="small"
                  variant="secondary"
                  @click="shareProfile"
                  ><i class="ch-icons-share"></i> Share</cs-button
                >
              </div>
            </cs-page-tabs>
            <cs-page-tabs
              v-else
              :key="'connections-other-' + user.id"
              align="left"
              no-border
              class="ch-home__nav-page-tabs"
              :tabs="otherTabs"
              :value="otherSelectedTab"
              @input="otherSelectTab"
            >
              <div class="second-row" :class="{ botMarge: !isLogged }">
                <cs-button
                  fill="clear"
                  size="small"
                  variant="secondary"
                  @click="shareProfile"
                  ><i class="ch-icons-share"></i> Share</cs-button
                >
                <div class="dots">
                  <app-context-menu>
                    <app-context-menu-item @click="openReportModal(user)">
                      Report <app-username :user="user" />
                    </app-context-menu-item>
                    <app-context-menu-item @click="blockUser()">
                      Block <app-username :user="user" />
                    </app-context-menu-item>
                    <app-context-menu-item
                      v-if="isAdmin"
                      @click="viewInAdminDashboard()"
                    >
                      [SA] Manage User <app-username :user="user" />
                    </app-context-menu-item>
                  </app-context-menu>
                </div>
              </div>
            </cs-page-tabs>
          </div>
        </b-col>
      </b-row>
      <b-row>
        <b-col md="8" lg="8">
          <app-tab-posts v-if="selectedView === 'posts'" :user="user" />
          <app-tab-followers v-if="selectedView === 'followers'" :user="user" />
          <app-tab-following v-if="selectedView === 'following'" :user="user" />
          <app-tab-friends v-if="selectedView === 'friends'" :user="user" />
          <app-tab-comments v-if="selectedView === 'comments'" :user="user" />
          <app-tab-mutual v-if="selectedView === 'mutual'" :user="user" />
        </b-col>
        <b-col md="4" lg="4">
          <app-intro-card class="ch-profile__card" :user="user" />
        </b-col>
      </b-row>
    </b-container>
    <b-container
      v-if="user && user.myRelationship.isBlocked"
      fluid="xl"
      class="px-0"
    >
      <app-blocked-user-profile
        v-if="user.myRelationship.blockedOut"
        :user="user"
      />
      <div v-if="user.myRelationship.blockedIn">
        You don't have permission to view this profile.
      </div>
    </b-container>
  </div>
</template>

<script>
import $auth from '@/services/auth';
import GetProfile from '@/gql/general/GetProfile.gql';
import AppProfileHeader from '@/components/connections/ProfileHeader.vue';
import AppBlockedUserProfile from '@/components/connections/BlockedUserProfile.vue';
import AppIntroCard from '@/components/connections/IntroCard.vue';
import AppContextMenu from '@/components/general/ContextMenu.vue';
import AppContextMenuItem from '@/components/general/ContextMenuItem.vue';
import $bus from '@/services/bus';
import AppSpinner from '@/components/general/Spinner.vue';
import AppTabPosts from '@/components/connections/TabPosts.vue';
import AppTabMutual from '@/components/connections/TabMutual.vue';
import AppTabFriends from '@/components/connections/TabFriends.vue';
import AppTabFollowers from '@/components/connections/TabFollowers.vue';
import AppTabFollowing from '@/components/connections/TabFollowing.vue';
import AppTabComments from '@/components/connections/TabComments.vue';
import AppUsername from '@/components/general/Username.vue';
// import AppAdSlot from '@/components/sidebar/AdSlot.vue';

export default {
  components: {
    AppProfileHeader,
    AppBlockedUserProfile,
    AppIntroCard,
    AppContextMenu,
    AppContextMenuItem,
    AppSpinner,
    AppTabPosts,
    AppTabFriends,
    AppTabMutual,
    AppTabFollowing,
    AppTabFollowers,
    AppTabComments,
    AppUsername,
  },
  props: {
    id: {
      required: false,
      type: String,
      default: '',
    },
    username: {
      required: false,
      type: String,
      default: '',
    },
    view: {
      required: false,
      type: String,
      default: 'posts',
    },
  },
  apollo: {
    user: {
      query: GetProfile,
      variables() {
        if (this.id) {
          return {
            id: this.id,
          };
        }
        return {
          username: `@${this.username}`,
        };
      },
    },
  },
  data() {
    return {
      selectedView: this.view,
      showMenu: false,
      showDialog: false,
      tabs: [
        {
          label: 'Posts',
          key: 'posts',
          view: 'Profile',
        },
        {
          label: 'Friends',
          key: 'friends',
          view: 'ProfileFriends',
        },
        {
          label: 'Followers',
          key: 'followers',
          view: 'ProfileFollowers',
        },
        {
          label: 'Following',
          key: 'following',
          view: 'ProfileFollowing',
        },
        {
          label: 'Comments',
          key: 'comments',
          view: 'ProfileComments',
        },
      ],
      otherTabs: [
        {
          label: 'Posts',
          key: 'posts',
          view: 'Profile',
        },
        {
          label: 'Comments',
          key: 'comments',
          view: 'ProfileComments',
        },
        {
          label: 'Common',
          key: 'mutual',
          view: 'Profile',
        },
      ],
    };
  },
  computed: {
    selectedTab() {
      return this.tabs.indexOf(this.tabs.find((tab) => tab.key === this.view));
    },
    otherSelectedTab() {
      return this.otherTabs.indexOf(
        this.otherTabs.find((tab) => tab.key === this.view)
      );
    },
    isLogged() {
      return this.user && $auth.getUserId() === this.user.id;
    },
    isAdmin() {
      return $auth.isAdmin();
    },
  },
  mounted() {
    // this.$apollo.queries.user.refetch();
    $bus.$on('follow-user', this.followCountRefresh);
    $bus.$on('unfollow-user', this.unfollowCountRefresh);
    $bus.$on('friendcount-refresh', this.refreshFriendCount);
  },
  methods: {
    followCountRefresh() {
      this.$apollo.queries.user.refetch();
    },
    unfollowCountRefresh() {
      this.$apollo.queries.user.refetch();
    },
    refreshFriendCount() {
      this.$apollo.queries.user.refetch();
    },
    selectTab(index) {
      const tab = this.tabs[index];
      this.selectedView = tab.key;
    },
    otherSelectTab(index) {
      const tab = this.otherTabs[index];
      this.selectedView = tab.key;
    },
    openReportModal(user) {
      const reportData = {
        id: user.id,
        type: 'user',
      };
      $bus.$emit('show-report-modal', reportData);
    },
    blockUser() {
      $bus.$emit('block-user-modal', {
        user: this.user,
      });
    },
    shareProfile() {
      let link = `/${this.user.id}`;
      if (this.user.username) {
        link = `/${this.user.username.replace('@', '')}`;
      }
      $bus.$emit('show-share-other', {
        link,
        title: 'Share Profile',
      });
    },
    viewInAdminDashboard() {
      window.open(
        `https://admin-beta.clouthub.com/#/users/${this.user.id}`,
        '_blank'
      );
    },
  },
};
</script>

<style scoped>
.ch-profile {
  --ch-profile-card-border: 1px solid #e7e9f1;
  --ch-profile-card-radius: var(--cs-card-border-radius);
  --ch-profile-card-padding: var(--cs-card-padding-y) var(--cs-card-padding-y);
  --ch-profile-card-shadow: 0px 3px 6px #0000000d;
}
.ch-profile__card,
.ch-profile >>> .ch-profile__card {
  background-color: var(--cs-gray-00);
  border: var(---ch-profile-card-border);
  border-radius: var(---ch-profile-card-radius);
  box-shadow: var(---ch-profile-card-shadow);
  margin-bottom: 20px;
}
/* Tabs */
.ch-profile__nav-tabs {
  flex: 1;
  background: var(--cs-gray-00);
  box-shadow: 0 3px 6px #0000000d;
  border-top: 1px solid #e7e9f1;
  margin-bottom: 30px;
}
.ch-home__nav-page-tabs.cs-page-tabs {
  position: relative;
  --cs-page-tabs-label-padding: 15px 20px;
  --cs-font-size-200: var(--cs-font-size-100);
}

.second-row {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  flex-direction: row;
  position: absolute;
  right: 15px;
  top: 13px;
}
.second-row i {
  padding-right: 3px;
}
.second-row > .cs-button {
  color: var(--cs-gray-06);
}
.second-row > .cs-button:hover {
  color: #f06027 !important;
}
.dots {
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  color: var(--cs-gray-05);
}
</style>
