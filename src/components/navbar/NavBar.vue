<template>
  <b-navbar class="navbar ch-menu">
    <b-container fluid="xl">
      <b-navbar-brand :to="{ name: 'Home' }" class="navbar-brand">
        <img
          class="header-logo"
          src="@/assets/images/clouthub-logo.png"
          alt=""
        />
      </b-navbar-brand>
      <!-- <app-search-bar /> -->
      <!-- TODO: temporally has been hide for till better future, transfered to MainContainer Component -->
      <!--      <div class="search-bar">-->
      <!--        <i class="cs-icons-search" @click="selectSearch()"></i>-->
      <!--        <input-->
      <!--          ref="input"-->
      <!--          v-model="query"-->
      <!--          type="search"-->
      <!--          placeholder="Search CloutHub"-->
      <!--          @keyup.enter="search()"-->
      <!--        />-->
      <!--      </div>-->
      <!-- Icons for md size -->
      <b-navbar-nav class="link-bar d-lg-none">
        <b-nav-item
          v-for="link in links"
          :key="'nav-icon-' + link.to"
          :to="{ name: link.to, params: link.params }"
          active-class="active-link"
        >
          <b-nav-text :title="link.name" @click="changeTab(link)">
            <i class="tab-icon" :class="link.icon" />
          </b-nav-text>
        </b-nav-item>
      </b-navbar-nav>

      <!-- Text tabs for lg+ size -->
      <b-navbar-nav class="link-bar d-none d-lg-flex">
        <b-nav-item
          v-for="link in links"
          :key="link.to"
          :to="{ name: link.to, params: link.params }"
          :class=link.name
          active-class="active-link"
        >
          <b-nav-text @click="changeTab(link)">{{ link.name }}</b-nav-text>
        </b-nav-item>
      </b-navbar-nav>
      <div class="menu-icons">
        <div class="user-menu" v-if="isLoggedIn">
          <app-notifications-button class="menu-icon" />
          <app-requests-button class="menu-icon" />
          <app-chat-button class="menu-icon" />
          <app-profile-button class="menu-icon"  />
        </div>
      </div>
    </b-container>
  </b-navbar>
</template>

<script>
import AppChatButton from './ChatButton.vue';
import AppRequestsButton from './RequestsButton.vue';
import AppNotificationsButton from './NotificationsButton.vue';
import AppProfileButton from './ProfileButton.vue';
import $auth from '@/services/auth';

export default {
  components: {
    AppChatButton,
    AppNotificationsButton,
    AppRequestsButton,
    AppProfileButton,
  },
  data() {
  return {
      query: null,
      isLoggedIn: false,
      links: [],
    };
  },
  created() {
    this.updateLoginStatus();
  },
  methods: {
    async updateLoginStatus() {
      this.isLoggedIn = await $auth.isLoggedInAsUser();
      this.updateLinks();
    },
    updateLinks() {
      this.links = [
        {
          name: 'Community',
          to: 'Home',
          icon: 'ch-icons-feeds',
        },
        {
          name: 'Channels',
          to: 'VideoContainer',
          icon: 'ch-icons-videos',
        },
        this.isLoggedIn
          ? {
              name: 'People',
              to: 'UserContainer',
              icon: 'ch-icons-connections',
            }
          : null,
        this.isLoggedIn
          ? {
              name: 'Groups',
              to: 'GroupContainer',
              icon: 'ch-icons-groups',
            }
          : null,
        this.isLoggedIn
          ? {
              name: 'Meetings',
              to: 'ExternalRedirect',
              icon: 'cs-icons-marker',
              redirectLink: 'https://meetings.clouthub.com/'
            }
          : null,
          {
              name: 'Events',
              to: 'UpcomingEvents',
              icon: 'cs-icons-marker',
            },
        !this.isLoggedIn
          ? {
              name: 'Login',
              to: 'Login',
              icon: 'ch-icons-connections',
            }
          : null,
            
      ].filter(Boolean); // Remove any null elements
    },
    selectSearch() {
      this.$refs.input.focus();
    },
    changeTab(link) {
      if(link.name === 'Meetings'){
        window.open(link.redirectLink, '_blank');
      } else {
        if (this.$route.name === link.to) {
          this.$router.topScroll();
        }
      }
    },
    search() {
      this.$router.push({
        name: 'UniversalSearch',
        query: {
          q: this.query,
        },
      });
    },
  },
  mounted() {
    if (!localStorage.lastSeenMessageTime)
      localStorage.lastSeenMessageTime = Date.now();
    if (!localStorage.lastSeenNotificationTime)
      localStorage.lastSeenNotificationTime = Date.now();
    if (!localStorage.lastSeenRequestTime)
      localStorage.lastSeenRequestTime = Date.now();
  },
};
</script>

<style scoped>
.ch-menu {
  padding: 0;
  box-shadow: 0 3px 6px #0000000d;
}
.navbar {
  background: #ffffff 0 0 no-repeat padding-box;
}
.link-bar {
  text-align: left;
  font: normal normal bold 16px/24px Roboto;
  letter-spacing: 0;
  color: #47535a;
  opacity: 1;
  justify-content: center;
}
.active-link {
  color: var(--cs-primary-base) !important;
  border-bottom: solid 3px var(--cs-primary-base);
}
.ch-menu .navbar-nav .nav-link {
  padding: 0 18px;
  line-height: 58px;
}
.ch-menu .navbar-nav .nav-link .navbar-text {
  line-height: 41px;
  font-weight: 700;
  color: inherit;
}
.menu-icons {
  display: flex;
  font-size: 20px;
  align-items: center;
}
.menu-icons > * {
  cursor: pointer;
}
.menu-icon {
  margin-left: 25px;
}
.tab-icon {
  font-size: 20px;
  display: block;
  margin-bottom: -3px;
}
.search-bar {
  flex: 1;
  margin: 0 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: solid 1px var(--cs-gray-02);
  border-radius: 4px;
  padding-left: 10px;
  overflow: hidden;
}
.search-bar i {
  cursor: pointer;
}
.search-bar input {
  width: 100%;
  border: none;
  height: 38px;
  padding: 10px;
  outline-width: 0;
}
.header-logo {
  width: 120px;
}
.user-menu {
  display: flex
}
.nav-item.Meetings .nav-link.active-link, 
.nav-item.Meetings .nav-link.active-link .navbar-text {
  color: rgba(0, 0, 0, 0.55);
  border-bottom: none;
}
</style>
