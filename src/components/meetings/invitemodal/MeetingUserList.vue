<template>
  <div class="user-list">
    <div class="user-list__head">
      <div class="ch-meeting-invite-modal__select-all" @click="onSelectAll">
        <app-meeting-invite-checkbox :checked="allVisibleSelected" />
        <span class="cs-textstyle-paragraph-bold">{{ selectAllLabel }}</span>
      </div>
      <cs-search-bar
        v-model="query"
        :placeholder="userType"
        class="user-list__search"
      />
    </div>
    <div v-if="users && users.length">
      <app-meeting-invite-list-item
        v-for="person in users"
        :key="person.id"
        :user="personInfo(person)"
        :checked="selectedUsers[person.id]"
        @click="selectUser(person.id)"
      />
    </div>
    <div v-else class="empty-user-list">
      <cs-empty-state title="No Results"></cs-empty-state>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';

import AppMeetingInviteListItem from '@/components/meetings/invitemodal/MeetingInviteListItem.vue';
import AppMeetingInviteCheckbox from '@/components/meetings/invitemodal/MeetingInviteCheckbox.vue';

export default {
  components: {
    AppMeetingInviteListItem,
    AppMeetingInviteCheckbox,
  },
  props: {
    users: {
      type: Array,
      required: true,
    },
    userType: {
      type: String,
      required: true,
    },
    meeting: {
      type: Object,
      required: true,
    },
    selectedUsers: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      query: '',
      selected: {},
    };
  },
  computed: {
    selectAllLabel() {
      return this.allVisibleSelected ? 'Unselect All' : 'Select All';
    },
    allVisibleSelected() {
      let allSelected = true;
      this.users.forEach((person) => {
        if (!this.selectedUsers[person.id]) allSelected = false;
      });
      return allSelected;
    },
  },
  watch: {
    query(query) {
      this.onQueryChange(query);
    },
  },
  mounted() {
    this.query = '';
  },
  methods: {
    onQueryChange: _.debounce(function (query) {
      this.$emit('on-query-change', query);
    }, 300),
    selectUser(id) {
      const selected = { ...this.selectedUsers };
      selected[id] = !this.selectedUsers[id];
      this.$emit('selected-users', selected);
    },
    onSelectAll() {
      const selectedSet = { ...this.selectedUsers };
      this.users.forEach((person) => {
        selectedSet[person.id] = !this.allVisibleSelected;
      });
      this.$emit('selected-users', selectedSet);
    },
    personInfo(person) {
      if (person.user) {
        return person.user;
      }
      return person;
    },
  },
};
</script>

<style scoped>
.user-list__head {
  padding: 10px;
  padding-right: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
  background: var(--cs-gray-02);
}
.ch-meeting-invite-modal__select-all {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  min-width: 135px;
}
.user-list__search {
  flex: 1;
}
* >>> .cs-search-bar__input {
  background: var(--cs-gray-00) !important;
}
* >>> .cs-search-bar {
  background: var(--cs-gray-00) !important;
}
</style>
