<template>
  <div class="ch-profile__card">
    <app-user-list
      v-if="people"
      :users="filteredPeople"
      :selected-users="selectedUsers"
      :meeting="meeting"
      user-type="Search Friends"
      @selected-users="$emit('selected-users', $event)"
      @on-query-change="onQueryChange"
    ></app-user-list>
    <app-infinite-offset :query="$apollo.queries.people" />
  </div>
</template>

<script>
import AppUserList from '@/components/meetings/invitemodal/MeetingUserList.vue';
import AppInfiniteOffset from '@/components/general/InfiniteOffset.vue';

import ListFriends from '@/gql/connections/ListFriends.gql';
import FriendSearch from '@/gql/search/FriendSearch.gql';

export default {
  components: {
    AppUserList,
    AppInfiniteOffset,
  },
  apollo: {
    people: {
      query: ListFriends,
    },
  },
  props: {
    meeting: {
      type: Object,
      required: true,
    },
    selectedUsers: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    foundUsers: null,
  }),
  computed: {
    filteredPeople() {
      return this.foundUsers ? this.foundUsers : this.people;
    },
  },
  methods: {
    async onQueryChange(query) {
      const { data } = await this.$apollo.query({
        query: FriendSearch,
        variables: {
          keyword: query,
        },
      });

      this.foundUsers = data.friends;
    },
  },
};
</script>
