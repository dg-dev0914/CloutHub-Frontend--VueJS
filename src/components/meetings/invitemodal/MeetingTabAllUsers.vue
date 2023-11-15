<template>
  <div class="ch-profile__card">
    <app-user-list
      v-if="users"
      :users="filteredPeople"
      :selected-users="selectedUsers"
      :meeting="meeting"
      user-type="All Users"
      @selected-users="$emit('selected-users', $event)"
      @on-query-change="onQueryChange"
    ></app-user-list>
  </div>
</template>

<script>
import UserSearch from '@/gql/search/UserSearch.gql';
import AppUserList from '@/components/meetings/invitemodal/MeetingUserList.vue';

export default {
  components: {
    AppUserList,
  },
  apollo: {
    users: {
      query: UserSearch,
      variables() {
        return {
          query: '',
          limit: 25,
        };
      },
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
  computed: {
    filteredPeople() {
      return this.users.filter((person) => !person.myRelationship.isBlocked);
    },
  },
  methods: {
    onQueryChange(query) {
      this.$apollo.queries.users.refetch({
        query,
        limit: 25,
      });
    },
  },
};
</script>
