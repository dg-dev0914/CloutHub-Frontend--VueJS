<template>
  <div class="user-list">
    <cs-search-bar
      v-model="query"
      placeholder="Search Groups"
      class="user-list__search"
    />
    <div v-if="filteredGroups && filteredGroups.length">
      <div
        v-for="person in filteredGroups"
        :key="person.id"
        class="user-list-person"
      >
        <div class="user-list__checkbox">
          <input
            v-model="selected"
            type="checkbox"
            :value="person.id"
            number
            class="user-list__check checkbox"
          />
        </div>
        <app-avatar
          class="user-list-person-avatar"
          size="small"
          :name="person.name"
          :picture="person.picture"
        />
        <div class="user-list-person-names">
          <div class="cs-textstyle-paragraph-bold">
            {{ person.name }}
          </div>
          <div
            class="cs-textstyle-paragraph-small user-list-person-names__count"
          >
            {{ person.memberCount }} members
          </div>
        </div>
      </div>
    </div>
    <div v-else class="empty-user-list">
      <cs-empty-state title="No Results"></cs-empty-state>
    </div>
    <div class="meeting-bottom">
      <div class="meeting-bottom__first">
        <span class="user-list__first-checkbox"
          ><input v-model="selectAll" type="checkbox"
        /></span>
        <span class="meeting-bottom__first-text">Select All</span>
      </div>
      <div class="meeting-bottom-button">
        <cs-button size="small" @click="sendInvitesToGroups"
          >Send Invites</cs-button
        >
      </div>
    </div>
  </div>
</template>

<script>
import AppAvatar from '@/components/general/Avatar.vue';
import SendChannelInvites from '@/gql/videos/SendChannelInvites.gql';

export default {
  components: {
    AppAvatar,
  },
  props: {
    users: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      query: '',
      selected: [],
      selectedPeople: [],
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
    selectAll: {
      get() {
        return this.users ? this.selected.length === this.users.length : false;
      },
      set(value) {
        const selected = [];
        if (value) {
          this.users.forEach((user) => {
            selected.push(user.id);
          });
        }
        this.selected = selected;
      },
    },
  },
  methods: {
    personInfo(person) {
      if (person.user) {
        return person.user;
      }
      return person;
    },
    async sendInvitesToGroups() {
      const groups = this.selected.join(',');
      const modifiedGroups = groups
        .split(',')
        .map((id) => `'${id.trim()}'`)
        .join(',');
      const temp = modifiedGroups.split(',');
      console.log('Modified groups', modifiedGroups);
      await this.$apollo.mutate({
        mutation: SendChannelInvites,
        variables: {
          groups: temp,
        },
      });
      this.$toast.open({
        message: 'Sent',
        type: 'success',
        duration: 2000,
        dismissible: true,
        position: 'top',
      });
      this.selectedPeople = [];
      this.selected = [];
    },
  },
};
</script>

<style scoped>
.user-list__head {
  padding: 10px 0px;
  display: flex;
  flex-direction: row;
  background: var(--cs-gray-02);
}
.user-list__select-all {
  display: flex;
  margin-top: 10px;
}
.user-list-search-bar {
  margin-bottom: 10px;
}
.user-list-person {
  display: flex;
  align-items: center;
  padding: 10px 0px 10px 10px;
}
.user-list-person-avatar,
.user-list-person-names {
  cursor: pointer;
}
.user-list-person-names {
  flex: 1;
  margin-left: 10px;
  margin-right: 10px;
}
.user-list-person-names__count {
  margin-top: -5px;
}

input[type='checkbox'] {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  border: 1px solid var(--cs-primary-base);
  position: relative;
  -moz-appearance: none;
  -webkit-appearance: none;
  appearance: none;
  background: white;
}
input[type='checkbox']:checked {
  background: white;
}
input[type='checkbox']:checked:after {
  content: '';
  position: absolute;
  width: 13px;
  height: 6px;
  background: rgba(0, 0, 0, 0);
  top: 3px;
  left: 2px;
  border: 2px solid var(--cs-primary-base);
  border-top: none;
  border-right: none;
  -webkit-transform: rotate(-45deg);
  -moz-transform: rotate(-45deg);
  -o-transform: rotate(-45deg);
  -ms-transform: rotate(-45deg);
  transform: rotate(-45deg);
}
.user-list__checkbox {
  margin-right: 5px;
  margin-top: 5px;
}
.user-list__search {
  width: 100%;
}
.user-list__first-checkbox {
  margin: 0px 10px 0px 10px;
}
* >>> .cs-search-bar__input {
  background: var(--cs-gray-00) !important;
}
* >>> .cs-search-bar {
  background: var(--cs-gray-00) !important;
  border: none;
  border-bottom: 1px solid var(--cs-gray-02);
}
.meeting-bottom {
  /* position: fixed;
  bottom: 0px;
  left: 0px; */
  background: white;
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: space-between;
}
.meeting-bottom-button {
  padding-right: 10px;
  padding-top: 10px;
}
.meeting-bottom-button button {
  width: 150px;
  height: 30px;
}
.meeting-bottom__first {
  margin-top: 15px !important;
  display: flex;
}

.meeting-bottom__first-text {
  margin-top: 2px !important;
  font-weight: 450;
  color: var(--cs-gray-05);
}
.meeting-why {
  margin-top: 0px;
}
.user-list {
  background-color: var(--cs-gray-01);
}
</style>
