<template>
  <div class="ch-profile__card">
    <app-user-list
      v-if="people"
      :users="filteredPeople"
      :selected-users="selectedUsers"
      :meeting="meeting"
      user-type="Search Followers"
      @selected-users="$emit('selected-users', $event)"
      @on-query-change="onQueryChange"
    ></app-user-list>
    <app-infinite-offset :query="$apollo.queries.people" />
  </div>
</template>

<script>
import AppUserList from '@/components/meetings/invitemodal/MeetingUserList.vue';
import AppInfiniteOffset from '@/components/general/InfiniteOffset.vue';

import ListFollowers from '@/gql/connections/ListFollowers.gql';
import FollowerSearch from '@/gql/search/FollowerSearch.gql';

export default {
  components: {
    AppUserList,
    AppInfiniteOffset,
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
  apollo: {
    people: {
      query: ListFollowers,
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
        query: FollowerSearch,
        variables: {
          keyword: query,
        },
      });

      this.foundUsers = data.followers;
    },
  },
};
</script>
