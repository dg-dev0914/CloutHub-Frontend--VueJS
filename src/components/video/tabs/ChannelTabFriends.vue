<template>
  <div class="ch-profile__card">
    <app-user-list
      v-if="people"
      :id="id"
      :users="filteredPeople"
      user-type="Search Friends"
    ></app-user-list>
    <app-infinite-loader
      :paused="$apollo.queries.people.loading"
      :finished="!mayHaveMore"
      @more="loadMore()"
    />
  </div>
</template>

<script>
import ListFriends from '@/gql/connections/ListFriends.gql';
import AppUserList from '@/components/video/tabs/ChannelUserList.vue';
import AppInfiniteLoader from '@/components/general/InfiniteLoader.vue';

export default {
  components: {
    AppUserList,
    AppInfiniteLoader,
  },
  apollo: {
    people: {
      query: ListFriends,
    },
  },
  props: {
    id: String,
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
