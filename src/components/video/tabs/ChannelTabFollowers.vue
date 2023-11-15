<template>
  <div class="ch-profile__card">
    <app-user-list
      v-if="people"
      :users="filteredPeople"
      user-type="Search Followers"
    ></app-user-list>
    <app-infinite-loader
      :paused="$apollo.queries.people.loading"
      :finished="!mayHaveMore"
      @more="loadMore()"
    />
  </div>
</template>

<script>
import ListFollowers from '@/gql/connections/ListFollowers.gql';
import AppUserList from '@/components/video/tabs/ChannelUserList.vue';
import AppInfiniteLoader from '@/components/general/InfiniteLoader.vue';

export default {
  components: {
    AppUserList,
    AppInfiniteLoader,
  },
  apollo: {
    people: {
      query: ListFollowers,
    },
  },
  data() {
    return {
      mayHaveMore: true,
    };
  },
  computed: {
    filteredPeople() {
      return this.people.filter((person) => !person.myRelationship.isBlocked);
    },
  },
  methods: {
    loadMore() {
      if (this.mayHaveMore) {
        this.mayHaveMore = false;
        const offset = this.people.length;
        this.$apollo.queries.people.fetchMore({
          variables: {
            offset,
          },
          updateQuery: (previousResult, { fetchMoreResult }) => {
            this.mayHaveMore = !!fetchMoreResult.people.length;
            return {
              people: [...previousResult.people, ...fetchMoreResult.people],
            };
          },
        });
      }
    },
  },
};
</script>
