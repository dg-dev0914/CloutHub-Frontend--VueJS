<template>
  <div>
    <div class="mb-2 cs-textstyle-item-heading">Recommended Channels</div>
    <cs-spinner v-if="!users" />
    <div v-if="users && users.length" class="row">
      <app-video-channel-item
        v-for="user in users"
        :key="user.id"
        :user="user"
        item-class="col-md-12"
        @refresh-recommendation="refreshRecommendedChannels"
      />
    </div>
  </div>
</template>
<script>
import AppVideoChannelItem from '@/components/video/new/RecommendedChannelList.vue';
import ListFeaturedChannels from '@/gql/videos/ListFeaturedChannels.gql';

export default {
  components: {
    AppVideoChannelItem,
  },
  apollo: {
    users: {
      query: ListFeaturedChannels,
    },
  },
  methods: {
    async refreshRecommendedChannels() {
      this.$apollo.queries.users.refetch();
    },
  },
};
</script>
