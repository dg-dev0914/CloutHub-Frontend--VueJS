<template>
  <b-container fluid="xl">
    <b-row>
      <b-col md="2">
        <app-my-channel-btn v-if="isLoggedIn" class="my-channel" />
        <app-page-menu title="Channels">
          <app-page-menu-item
            v-for="view in channelViews"
            :key="view.label"
            :label="view.label"
            :to="{ name: view.component, params: { view: view.view } }"
          />
        </app-page-menu>
        <app-ad-slot v-if="!isRouteIdSpecific" invocationCode="1" zoneName="ZC1" width="190" height="600" />
        <app-ad-slot v-if="isRouteIdSpecific" zoneName="ZC4" width="190" height="600" />
        <app-ad-slot zoneName="ZC3" invocationCode="3" width="190" height="200" />
      </b-col>
      <b-col md="10">
        <router-view :key="$route.fullPath" />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import $auth from '@/services/auth';
import videoCategories from '@/assets/config/videocategories.json';
import AppPageMenu from '@/components/general/PageMenu.vue';
import AppPageMenuItem from '@/components/general/PageMenuItem.vue';
import AppMyChannelBtn from '@/components/general/MyChannelBtn.vue';
import GetChannel from '@/gql/videos/GetChannel.gql';
import GetChannelPublic from '@/gql/videos/GetChannelPublic.gql';
import AppAdSlot from '@/components/sidebar/AdSlot.vue';

export default {
  components: {
    AppPageMenu,
    AppPageMenuItem,
    AppMyChannelBtn,
    AppAdSlot
  },
  data() {
    return {
      categories: videoCategories,
      channelViews: [],
      isLoggedIn: false,
    };
  },
  async created() {
    this.isLoggedIn = await $auth.isLoggedInAsUser();
    this.updateChannelViews();
  },
  methods: {
    updateChannelViews() {
      this.channelViews = [
        {
          label: 'Latest',
          view: 'latest',
          component: 'VideoListNew',
        },
        this.isLoggedIn
          ? {
              label: 'Subscribed',
              view: 'subscribed',
              component: 'VideoChannelList',
            }
          : null,
        {
          title: 'Upcoming',
          label: 'Upcoming',
          view: 'upcoming',
          component: 'UpcomingEvents',
        },
        {
          label: 'Live',
          view: 'liveVideos',
          component: 'VideoListNew',
        },
        this.isLoggedIn
        ? {
            label: 'Channels',
            view: 'explore',
            component: 'ExploreVideos',
          }
        : null,
        this.isLoggedIn
        ? {
            label: 'Search',
            view: 'find',
            component: 'VideoChannelFind',
          }
        : null,
        this.isLoggedIn
          ? {
              label: 'History',
              view: 'history',
              component: 'VideoListMini',
            }
          : null,
        this.isLoggedIn
          ? {
              label: 'Bookmarked',
              view: 'bookmarked',
              component: 'VideoListMini',
            }
          : null,
        this.isLoggedIn
          ? {
              label: 'Watch Later',
              view: 'queue',
              component: 'VideoListMini',
            }
          : null,
        this.isLoggedIn
          ? {
              label: 'Recommended',
              view: 'recommended',
              component: 'VideoChannelList',
            }
          : null,
      ].filter(Boolean); // Remove any null elements
    },
  },
  computed: {
    me() {
      return {
        id: $auth.getUserId(),
      };
    },
    isRouteIdSpecific() {
      return this.$route.params.id ? true : false;
    }
  },
  apollo: {
    user: {
      query() {
        return this.isLoggedIn ? GetChannel : GetChannelPublic;
      },
      variables() {
        return {
          id: this.isLoggedIn ? $auth.getUserId() : null,
        };
      },
    },
  },
};
</script>

<style scoped>
.my-channel {
  margin-bottom: 10px;
}
</style>
