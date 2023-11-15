// TODO: WHY THIS FILE WHEN WE ALREADY HAVE SAME FILE
<template>
  <div>
    <div class="mb-2 cs-textstyle-item-heading">{{ currentView.title }}</div>
    <cs-spinner v-if="!users" />
    <div v-if="users && users.length" class="row">
      <app-video-channel-item
        v-for="user in users"
        :key="user.id"
        :user="user"
      />
    </div>
  </div>
</template>
<script>
import AppVideoChannelItem from '@/components/video/VideoChannelItem.vue';
import ListLiveChannels from '@/gql/videos/ListLiveChannels.gql';
import ListFeaturedChannels from '@/gql/videos/ListFeaturedChannels.gql';
import ListSubscribedChannels from '@/gql/videos/ListSubscribedChannels.gql';
import ListAllChannels from '@/gql/videos/ListAllChannels.gql';

const viewSettings = {
  all: {
    title: 'All Channels',
    query: ListAllChannels,
  },
  recommended: {
    title: 'Recommended Channels',
    query: ListFeaturedChannels,
  },
  live: {
    title: 'Live Channels',
    query: ListLiveChannels,
  },
  subscribed: {
    title: 'Subscribed Channels',
    query: ListSubscribedChannels,
  },
};

export default {
  components: {
    AppVideoChannelItem,
  },
  props: {
    view: {
      type: String,
      required: true,
    },
  },
  computed: {
    currentView() {
      return viewSettings[this.$route.params.view];
    },
  },
  apollo: {
    users: {
      query() {
        return this.currentView.query;
      },
    },
  },
};
</script>
