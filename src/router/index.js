import Vue from 'vue';
import VueRouter from 'vue-router';
import $auth from '@/services/auth';
// import $analytics from '@/services/analytics';
import $amplitude from '@/services/amplitude';

// Onboarding
import OnboardingContainer from '@/views/onboarding/OnboardingContainer.vue';
import Login from '@/views/onboarding/Login.vue';
import Signup from '@/views/onboarding/Signup.vue';
import ResetPassword from '@/views/onboarding/ResetPassword.vue';
import SetNewPassword from '@/views/onboarding/SetNewPassword.vue';
import VerifiedEmail from '@/views/onboarding/VerifiedEmail.vue';
import AppNameForm from '@/components/onboarding/NameForm.vue';
import AppEmailForm from '@/components/onboarding/EmailForm.vue';
import AppPasswordForm from '@/components/onboarding/PasswordForm.vue';
import AppUsernameForm from '@/components/onboarding/UsernameForm.vue';

// HOME
import Home from '@/views/home/Index.vue';
import ForumSearch from '@/views/home/ForumSearch.vue';
import Tag from '@/views/home/Tag.vue';
import Bookmarked from '@/views/home/Bookmarked.vue';
import PostDetail from '@/views/posts/PostDetail.vue';
import PostEmbedDetail from '@/views/posts/PostEmbedDetail.vue';

// NOTIFICATIONS
import Search from '@/views/home/Search.vue';

// NOTIFICATIONS
import Notifications from '@/views/home/Notifications.vue';
import Announcement from '@/views/home/Announcement.vue';

// REQUESTS
import Requests from '@/views/home/Requests.vue';

// NEWS
import NewsContainer from '@/views/news/NewsContainer.vue';
import NewsHome from '@/views/news/NewsHome.vue';
import NewsDetail from '@/views/news/NewsDetail.vue';
import NewsList from '@/views/news/NewsList.vue';
import NewsCategory from '@/views/news/NewsCategory.vue';
import NewsSearch from '@/views/news/NewsSearch.vue';
import NewsProfile from '@/views/news/NewsProfile.vue';
import NewsPublisherRecommended from '@/views/news/NewsPublisherRecommended.vue';

// GROUPS
import GroupContainer from '@/views/groups/GroupContainer.vue';
import GroupDetailView from '@/views/groups/GroupDetailView.vue';
import GroupSearch from '@/views/groups/GroupSearch.vue';
import RecommendedGroupsList from '@/views/groups/RecommendedGroupsList.vue';
import MyGroupsList from '@/views/groups/MyGroupsList.vue';
import ExploreGroups from '@/views/groups/FindGroup.vue';
import GroupCategory from '@/views/groups/GroupCategory.vue';

// VIDEOS
import VideoContainer from '@/views/video/VideoContainer.vue';
import VideoDetail from '@/views/video/VideoDetail.vue';
import VideoProfile from '@/views/video/VideoProfile.vue';
import VideoListNew from '@/views/video/VideoListNew.vue';
import VideoListMini from '@/views/video/VideoListMini.vue';
import VideoChannelFind from '@/views/video/VideoChannelFind.vue';
import VideoChannelList from '@/views/video/VideoChannelList.vue';
import LiveStreaming from '@/views/video/LiveStreaming.vue';
import ExploreVideos from '@/components/video/new/ExploreVideos.vue';
import UpcomingEvents from '@/views/video/UpcomingEvents.vue';

// MEETINGS
import MeetingContainer from '@/views/meetings/MeetingContainer.vue';
import MeetingHome from '@/views/meetings/MeetingHome.vue';
import MeetingCategory from '@/views/meetings/MeetingCategory.vue';
import MeetingList from '@/views/meetings/MeetingList.vue';
import MeetingDetail from '@/views/meetings/NewMeetingDetail.vue';
import MeetingSearch from '@/views/meetings/MeetingSearch.vue';

// Marketplace
import MarketplaceContainer from '@/views/marketplace/MarketplaceContainer.vue';


// PROFILE
import Profile from '@/views/connections/ProfileView.vue';
import EditProfile from '@/views/connections/EditProfileView.vue';

// CONNECTIONS
import UserContainer from '@/views/connections/ConnectionsContainer.vue';
import UserList from '@/views/connections/UserList.vue';
import BadgeUserList from '@/views/connections/BadgeUserList.vue';
import UserSearch from '@/views/connections/UserSearch.vue';
import ConnectionsFind from '@/views/connections/ConnectionsFind.vue';

// MESSAGES
import ConversationList from '@/views/conversations/ConversationList.vue';
import ConversationDetail from '@/views/conversations/ConversationDetail.vue';
import ConversationEmptyState from '@/views/conversations/ConversationEmptyState.vue';

// SETTINGS
import Settings from '@/views/settings/Settings.vue';

// CONTAINERS
import NavContainer from '@/views/containers/NavContainer.vue';
import MainContainer from '@/views/home/MainContainer.vue';
import ForMe from '@/views/groups/ForMe.vue';
import MyGroupsContainer from '@/views/groups/MyGroupsContainer.vue';
import MyGroupsSearch from '@/views/groups/MyGroupsSearch.vue';

Vue.use(VueRouter);
const routes = [
  {
    path: '/onboarding/',
    component: OnboardingContainer,
    children: [
      {
        path: '',
        name: 'Login',
        component: Login,
      },
      {
        path: 'signup',
        name: 'Signup',
        component: Signup,
        children: [
          {
            path: 'nameform',
            name: 'NameForm',
            component: AppNameForm,
          },
          {
            path: 'emailform',
            name: 'EmailForm',
            component: AppEmailForm,
          },
          {
            path: 'passwordform',
            name: 'PasswordForm',
            component: AppPasswordForm,
          },
          {
            path: 'usernameform',
            name: 'UsernameForm',
            component: AppUsernameForm,
          },
        ],
      },
      {
        path: 'resetpassword',
        name: 'ResetPassword',
        component: ResetPassword,
      },
      {
        path: 'setnewpassword/:token',
        name: 'SetNewPassword',
        component: SetNewPassword,
      },
      {
        path: 'verifiedemail',
        name: 'VerifiedEmail',
        component: VerifiedEmail,
      },
    ],
  },
  {
    path: '/',
    component: NavContainer,
    children: [
      {
        name: 'UniversalSearch',
        component: Search,
        path: 'search',
        props: (route) => ({ query: route.query.q }),
      },
      {
        path: '',
        redirect: 'community',
        component: MainContainer,
        children: [
          {
            name: 'Home',
            component: Home,
            path: 'community',
          },
          {
            name: 'ForumSearch',
            component: ForumSearch,
            path: 'community/search',
            props: (route) => ({ query: route.query.q }),
          },
          {
            name: 'Bookmarked',
            component: Bookmarked,
            path: 'bookmarked',
          },
          {
            name: 'Tag',
            component: Tag,
            path: 'tag/:tag',
            props: true,
          },
          {
            name: 'Notifications',
            component: Notifications,
            path: 'notifications',
          },
          {
            name: 'Announcement',
            component: Announcement,
            path: 'announcement/:id',
          },
          {
            name: 'Requests',
            component: Requests,
            path: 'requests',
          },
          {
            name: 'PostDetail',
            component: PostDetail,
            path: 'posts/:id',
            props: true,
          },
          {
            path: 'postsembed/:id',
            component: PostEmbedDetail,
            name: 'PostEmbedDetail',
            props: true,
          },
        ],
      },
      {
        name: 'NewsContainer',
        component: NewsContainer,
        redirect: 'news/home',
        path: 'news',
        children: [
          {
            name: 'NewsHome',
            component: NewsHome,
            path: 'home',
          },
          {
            name: 'NewsList',
            component: NewsList,
            path: 'views/:view',
            props: true,
          },
          {
            name: 'NewsCategory',
            component: NewsCategory,
            path: 'categories/:category',
            props: true,
          },
          {
            name: 'NewsProfile',
            component: NewsProfile,
            path: '/user/:id/news',
            props: true,
          },
          {
            name: 'NewsPublisherRecommended',
            component: NewsPublisherRecommended,
            path: 'publishers/recommended',
          },
          {
            name: 'NewsSearch',
            component: NewsSearch,
            path: 'search',
            props: (route) => ({ query: route.query.q }),
          },
        ],
      },
      {
        name: 'NewsDetail',
        component: NewsDetail,
        path: 'news/:id',
        props: true,
      },
      {
        path: 'groups',
        component: GroupContainer,
        name: 'GroupContainer',
        redirect: 'groups/joined',
        children: [
          {
            path: 'recommended',
            component: RecommendedGroupsList,
            name: 'RecommendedGroupsList',
          },
          {
            path: 'joined',
            component: MyGroupsContainer,
            name: 'MyGroupsContainer',
            redirect: 'joined/',
            children: [
              {
                path: '',
                component: MyGroupsList,
                name: 'MyGroupsList',
              },
              {
                path: 'search',
                name: 'MyGroupsSearch',
                component: MyGroupsSearch,
                props: (route) => ({
                  query: route.query.q,
                }),
              },
            ],
          },
          {
            path: 'find',
            component: ExploreGroups,
            name: 'FindGroup',
            children: [
              {
                path: ':category',
                component: GroupCategory,
                name: 'GroupCategory',
                props: (route) => ({ category: route.params.category }),
              },
            ],
          },
          {
            name: 'GroupSearch',
            component: GroupSearch,
            path: 'search',
            props: (route) => ({
              query: route.query.q,
            }),
          },
          {
            name: 'GroupsForMe',
            component: ForMe,
            path: 'for-me',
          },
          {
            path: ':id',
            component: GroupDetailView,
            name: 'GroupDetail',
            props: true,
          },
        ],
      },
      {
        path: 'users',
        component: UserContainer,
        name: 'UserContainer',
        redirect: 'users/users/recommended',
        children: [
          {
            path: 'recommended',
            component: UserList,
            name: 'ConnectionsHome',
          },
          {
            path: 'users/find',
            component: ConnectionsFind,
            name: 'ConnectionsFind',
          },
          {
            path: 'users/:view',
            component: UserList,
            name: 'UserList',
            props: true,
          },
          {
            path: 'badge/:badge',
            component: BadgeUserList,
            name: 'BadgeUserList',
            props: true,
          },
          {
            name: 'UserSearch',
            component: UserSearch,
            path: 'search',
            props: (route) => ({ query: route.query.q }),
          },
          {
            path: 'editprofile',
            component: EditProfile,
            name: 'EditProfile',
          },
          {
            path: 'u/:username/:view?',
            component: Profile,
            props: true,
            name: 'UProfile',
          },
          {
            path: 'id/:id/:view?',
            component: Profile,
            props: true,
            name: 'Profile',
          },
        ],
      },
      {
        path: 'conversations/:type',
        component: ConversationList,
        name: 'Conversations',
        children: [
          {
            path: ':conversationId',
            component: ConversationDetail,
            name: 'ConversationDetail',
          },
          {
            path: 'empty',
            component: ConversationEmptyState,
            name: 'ConversationEmptyState',
          },
        ],
      },
      {
        path: 'videos',
        component: VideoContainer,
        name: 'VideoContainer',
        redirect: 'videos/latest',
        children: [
          {
            path: 'live',
            component: LiveStreaming,
            name: 'LiveStreaming',
          },
          {
            path: 'videos/:id',
            name: 'VideoDetail',
            component: VideoDetail,
            props: true,
          },
          {
            path: 'channel/:id',
            component: VideoProfile,
            name: 'VideoProfile',
            props: true,
          },
          {
            path: 'channels/:view',
            component: VideoChannelList,
            name: 'VideoChannelList',
            props: true,
          },
          {
            path: ':view',
            component: VideoListNew,
            name: 'VideoListNew',
            props: true,
          },
          {
            path: 'video/:view',
            component: VideoListMini,
            name: 'VideoListMini',
            props: true,
          },
          {
            path: 'categories/explore',
            component: ExploreVideos,
            name: 'ExploreVideos',
            props: true,
          },
          {
            path: '/find/videos',
            component: VideoChannelFind,
            name: 'VideoChannelFind',
            props: true,
          },
          {
            path: '/upcoming',
            component: UpcomingEvents,
            name: 'UpcomingEvents',
            props: true,
          },
        ],
      },
      {
        path: 'marketplace',
        component: MarketplaceContainer,
        name: 'MarketplaceContainer',
      },
      {
        path: 'meetings',
        component: MeetingContainer,
        name: 'MeetingContainer',
        redirect: 'meetings/home',
        children: [
          {
            path: 'home',
            component: MeetingHome,
            name: 'MeetingHome',
          },
          {
            path: ':view',
            component: MeetingList,
            name: 'MeetingList',
            props: true,
          },
          {
            path: 'search',
            component: MeetingSearch,
            name: 'MeetingSearch',
            props: (route) => ({ query: route.query.q }),
          },
          {
            path: 'categories/:category',
            component: MeetingCategory,
            name: 'MeetingCategory',
            props: true,
          },
        ],
      },
      {
        name: 'ExternalRedirect',
        component: MainContainer,
        path: '',
        redirect: 'community',
      },
      {
        path: 'settings',
        component: Settings,
        name: 'Settings',
      },
    ],
  },
  {
    path: '/meetingdetail/:id',
    component: MeetingDetail,
    name: 'MeetingDetail',
    props: true,
  },
];

// Define all redirections in one object
const redirections = {
  'localhost': {
    'http://localhost:8080/#/videos/channel/5730605a-e314-46bb-a335-f2d82622c118': 'https://clouthub.dev/c/vCQCGrCf',
  },
  'app.clouthub.dev': {
    'https://app.clouthub.dev/#/videos/channel/5730605a-e314-46bb-a335-f2d82622c118': 'https://clouthub.dev/c/vCQCGrCf',
  },
  'app.clouthub.com': {
    'https://app.clouthub.com/#/videos/channel/21d13dc4-3a6a-4de5-8160-69e2d1360b16': 'https://clouthub.com/c/68vx82Bi',
  }
};

// Define your exceptions 
const exceptionRoutes = ['/community', '/upcoming', '/videos/videos/', '/videos/latest', '/videos/liveVideos', '/groups/joined']; // replace with your actual routes

const router = new VueRouter({
  routes,
});

function getComponent(route) {
  const matchedPage =
    route.matched.length > 0 ? route.matched[route.matched.length - 1] : false;

  if (!matchedPage) return;

  const component = Object.values(matchedPage.components)[0];

  if (!component.scrollPositions) component.scrollPositions = {};

  return component;
}

async function getScrollElement() {
  return document.querySelector('.logged-in-view');
}

async function saveScrollPosition(route) {
  if (!route) return;
  const component = getComponent(route);
  const scrollEl = await getScrollElement(component);
  if (!scrollEl) return;
  component.scrollPositions[route.path] = scrollEl.scrollTop;
}

router.beforeEach(async (to, from, next) => {
  // Main variables.
  const isLoggedin = await $auth.isLoggedInAsUser();
  const fullUrl = window.location.href;
  
  // TEMPORARY CODE (Handle channel redirect)
  if (!isLoggedin) {
    // Get the current hostname
    const currentHostname = window.location.hostname;
    // Check if there are redirections for the current hostname
    if (redirections[currentHostname]) {
      // Normalize the current URL by removing any trailing slash
      const normalizedUrl = fullUrl.endsWith('/') ? fullUrl.slice(0, -1) : fullUrl;
      // Normalize the URLs in the redirections object by removing any trailing slash
      const normalizedRedirections = Object.keys(redirections[currentHostname]).reduce((acc, key) => {
        const normalizedKey = key.endsWith('/') ? key.slice(0, -1) : key;
        acc[normalizedKey] = redirections[currentHostname][key];
        return acc;
      }, {});
      // Check if there is a redirection for the normalized URL
      if (normalizedRedirections[normalizedUrl]) {
        window.location.href = normalizedRedirections[normalizedUrl];
        return;
      }
    }
  }

  // Save scroll position before it gets destroyed
  await saveScrollPosition(from);

  // Handle exceptions.
  if (!isLoggedin) {
    // If the route starts with any of the exception routes, do nothing and just return.
    if (exceptionRoutes.some(route => to.path.startsWith(route))) {
      next();
      return;
    }
  }

  if (isLoggedin && to.query.redirect) {
    if (router.resolve(to.query.redirect).route.name) {
      next(to.query.redirect);
      return;
    }
  }

  if (isLoggedin && to.fullPath.includes('/onboarding')) {
    // Logged in but trying to access an onboarding screen
    next('/');
  } else if (
    !isLoggedin &&
    !to.fullPath.includes('/onboarding') &&
    !to.fullPath.includes('/meetingdetail')
  ) {
    // Logged out but trying to access an app screen
    next({
      name: 'Login',
      query: {
        redirect: to.fullPath,
      },
    });
  } else {

    next();
  }
});

router.topScroll = async () => {
  const scrollEl = await getScrollElement();
  scrollEl.scrollTop = 0;
};

async function setScrollPosition(route) {
  if (!route) return;
  await Vue.nextTick(); // ensure the DOM exists
  const component = getComponent(route);
  const scrollEl = await getScrollElement(component);
  if (!scrollEl) return;
  scrollEl.scrollTop = component.scrollPositions[route.path];
}

router.afterEach(async (to) => {
  await setScrollPosition(to);
//  $analytics.trackEvent('ScreenView', to.name);
//  gtag('config', 'G-Q0014B3L6M', { page_path: to.path });
  $amplitude.logEvent(`screen_view`, { name: to.name });
});
 
export default router;
