<template>
  <div>
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

export default {
  components: {
    AppUserCard,
    AppHeaderSegment,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    query: {
      type: Object,
      required: true,
    },
    count: {
      type: Number,
      required: false,
      default: 6,
    },
    to: {
      type: Object,
      required: true,
    },
  },
  apollo: {
    people: {
      query() {
        return this.query;
      },
    },
  },
  mounted() {
    this.$apollo.queries.people.refetch();
  },
  methods: {
    viewAll() {
      this.$router.push(this.to);
    },
  },
};
</script>
