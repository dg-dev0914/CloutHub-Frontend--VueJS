<template>
  <div>
    <cs-page-tabs
      v-model="selectedTab"
      :tabs="tabs"
      align="justify"
      class="search-tabs"
    ></cs-page-tabs>
    <div v-if="selectedTab == 0">
      <app-spinner v-if="$apollo.queries.users.loading" />
      <div class="search-result__grid">
        <app-channel-circle v-for="user in users" :key="user.id" :user="user" />
      </div>
      <cs-empty-state
        v-if="users && users.length === 0"
        description="There are currently no channels matching your search"
      />
    </div>
    <div v-if="selectedTab == 1" class="video-search-results">
      <app-spinner v-if="$apollo.queries.posts.loading" />
      <app-video-list
        v-if="posts"
        :videos="posts"
        placeholder="No videos avilable"
        item-class="col-md-12"
        view="find"
      ></app-video-list>
      <cs-empty-state
        v-if="posts && posts.length === 0"
        description="There are currently no videos matching your search"
      />
    </div>
  </div>
</template>

<script>
import AppSpinner from '@/components/general/Spinner.vue';
import AppVideoFindChannelList from '@/components/video/new/VideoFindChannelList.vue';
import AppVideoList from '@/components/video/new/VideoListMini.vue';
import AppChannelCircle from '@/components/video/ChannelCircle.vue';
import PostSearchByType from '@/gql/search/PostSearchByType.gql';
import ChannelSearch from '@/gql/search/ChannelSearch.gql';

export default {
  components: {
    AppSpinner,
    AppVideoFindChannelList,
    AppChannelCircle,
    AppVideoList,
  },
  props: {
    query: {
      type: String,
      required: false,
      default: '',
    },
  },
  data() {
    return {
      selectedTab: 0,
      tabs: [
        {
          label: 'Channels',
        },
        {
          label: 'Videos',
        },
      ],
    };
  },
  apollo: {
    users: {
      query: ChannelSearch,
      variables() {
        return {
          query: this.query,
        };
      },
      skip() {
        return !this.query;
      },
    },
    posts: {
      query: PostSearchByType,
      variables() {
        return {
          type: 'video',
          query: this.query,
        };
      },
      skip() {
        return !this.query;
      },
    },
  },
};
</script>

<style scoped>
.search-result__grid {
  display: grid;
  margin-top: 10px;
  grid-template-columns: 25% 25% 25% 25%;
}
.video-search-results {
  margin-top: 3px;
}
* >>> .cs-page-tab__labels-border {
  display: flex;
  border-bottom: solid 1px var(--cs-gray-03) !important;
  background-color: var(--cs-gray-00) !important;
}
.search-tabs {
  margin-bottom: 15px;
}
</style>
