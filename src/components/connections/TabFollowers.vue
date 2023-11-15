<template>
  <div class="ch-profile__card">
    <app-user-list v-if="people" :users="filteredPeople"></app-user-list>
    <app-infinite-offset :query="$apollo.queries.people" />
  </div>
</template>

<script>
import ListFollowers from '@/gql/connections/ListFollowers.gql';
import AppUserList from '@/components/general/UserList.vue';
import AppInfiniteOffset from '@/components/general/InfiniteOffset.vue';

export default {
  components: {
    AppUserList,
    AppInfiniteOffset,
  },
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  apollo: {
    people: {
      query: ListFollowers,
      fetchPolicy: 'network-only',
    },
  },
  computed: {
    filteredPeople() {
      return this.people.filter((person) => !person.myRelationship.isBlocked);
    },
  },
};
</script>
