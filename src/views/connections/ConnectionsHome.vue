<template>
  <div>
    <app-connections-quick-find />
    <app-user-segment
      :query="recommendedQuery"
      :count="6"
      title="Recommended"
      :to="{ name: 'UserList', params: { view: 'recommended' } }"
    />
    <app-badge-user-segment
      v-for="item in segmentItems"
      :key="item.title"
      :badge="item.badge"
      :count="6"
      :title="item.title"
    />
  </div>
</template>

<script>
import AppUserSegment from '@/components/connections/UserSegment.vue';
import AppBadgeUserSegment from '@/components/connections/BadgeUserSegment.vue';
import ListRecommendedUsers from '@/gql/connections/RecommendedUsers.gql';
import AppConnectionsQuickFind from '@/components/general/ConnectionsQuickFind.vue';

export default {
  components: {
    AppUserSegment,
    AppBadgeUserSegment,
    AppConnectionsQuickFind,
  },
  data() {
    return {
      recommendedQuery: ListRecommendedUsers,
      segmentItems: [
        {
          badge: 'influencer',
          title: 'Influencers',
        },
        {
          badge: 'news',
          title: 'News Sources',
        },
        {
          badge: 'channel',
          title: 'Channel Owners',
        },
      ],
    };
  },
};
</script>
