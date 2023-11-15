<template>
  <div>
    <div class="mb-2 cs-textstyle-item-heading capitalize">{{ title }}</div>
    <app-spinner v-if="isLoading" />
    <div v-else class="row">
      <app-user-card v-for="user in people" :key="user.id" :user="user" />
    </div>
  </div>
</template>

<script>
import ListUsersByBadgeType from '@/gql/connections/ListUsersByBadgeType.gql';
import AppUserCard from '@/components/connections/UserCard.vue';
import AppSpinner from '@/components/general/Spinner.vue';

export default {
  components: {
    AppUserCard,
    AppSpinner,
  },
  props: {
    badge: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
    };
  },
  apollo: {
    people: {
      query: ListUsersByBadgeType,
      variables() {
        return {
          badgeType: this.badge,
        };
      },
    },
  },
  computed: {
    title() {
      const titleMap = {
        influencer: 'Influencers',
        news: 'News Sources',
        channel: 'Channel Owners',
      };
      return titleMap[this.badge];
    },
    isLoading() {
      return this.$apollo.queries.people.loading || this.loading;
    },
  },
  async mounted() {
    this.loading = true;
    await this.$apollo.queries.people.refetch();
    this.loading = false;
  },
};
</script>
