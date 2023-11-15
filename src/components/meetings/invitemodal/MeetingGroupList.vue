<template>
  <div class="user-list">
    <div class="user-list__head">
      <div class="ch-meeting-invite-modal__select-all" @click="onSelectAll">
        <app-meeting-invite-checkbox :checked="allVisibleSelected" />
        <span class="cs-textstyle-paragraph-bold">{{ selectAllLabel }}</span>
      </div>
      <cs-search-bar
        placeholder="Search Groups"
        v-model="query"
        class="user-list__search"
      />
    </div>
    <app-meeting-invite-list-item
      v-for="group in filteredGroups"
      :key="group.id"
      :name="group.name"
      :picture="group.picture"
      :description="`${group.memberCount} members`"
      :checked="!!selectedGroups[group.id]"
      @click="selectUser(group)"
    />
  </div>
</template>

<script>
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
    selectedGroups: {
      type: Object,
      required: true,
    },
    meeting: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      query: '',
    };
  },
  computed: {
    filteredGroups() {
      const searchTerms = this.query.toLowerCase();
      if (this.users === null) return null;
      const filtered = this.users.filter((person) => {
        if (person.name.toLowerCase().indexOf(searchTerms) > -1) return true;
        return false;
      });
      return filtered;
    },
    selectAllLabel() {
      return this.allVisibleSelected ? 'Unselect All' : 'Select All';
    },
    allVisibleSelected() {
      let allSelected = true;
      this.filteredGroups.forEach((group) => {
        if (!this.selectedGroups[group.id]) allSelected = false;
      });
      return allSelected;
    },
  },
  methods: {
    selectUser(group) {
      const selected = { ...this.selectedGroups };
      selected[group.id] = !this.selectedGroups[group.id] ? group : false;
      this.$emit('selected-groups', selected);
    },
    onSelectAll() {
      const selectedSet = { ...this.selectedGroups };
      this.filteredGroups.forEach((group) => {
        selectedSet[group.id] = !this.allVisibleSelected ? group : false;
      });
      this.$emit('selected-groups', selectedSet);
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
