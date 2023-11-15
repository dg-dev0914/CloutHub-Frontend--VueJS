<template>
  <div class="ch-profile__card">
    <app-header-segment :title="title" button="View More" @action="viewAll" />
    <cs-spinner v-if="!people" />
    <div v-if="people" class="row">
      <app-user-card
        v-for="user in people.slice(0, count)"
        :key="user.id"
        :user="user"
        item-class="col-md-6"
      />
    </div>
  </div>
</template>

<script>
import AppUserCard from '@/components/connections/UserCard.vue';
import AppHeaderSegment from '@/components/general/HeaderSegment.vue';

import ListUsersByBadgeType from '@/gql/connections/ListUsersByBadgeType.gql';

export default {
  components: {
    AppUserCard,
    AppHeaderSegment,
  },
  props: {
    title: {
      type: String,
      required: true,
      default: 'Untitled Segment',
    },
    badge: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      required: false,
      default: 6,
    },
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
  mounted() {
    this.$apollo.queries.people.refetch();
  },
  methods: {
    viewAll() {
      this.$router.push({
        name: 'BadgeUserList',
        params: { badge: this.badge },
      });
    },
  },
};
</script>
