<template>
  <div class="group-role-select">
    <!-- Similar to GroupUserSelect -->
    <!-- This is a complex filtering system for selecting members of a group by different roles -->
    <!-- This selector has two states "open" (visibleOptions) and "closed" (!visibleOptions) -->
    <label class="group-role-select__label">Recipients</label>
    <div class="group-role-select__wrapper">
      <!-- Main header -->
      <div class="group-role-select__header">
        <div class="group-role-select__selected">
          <!-- When closed and no recipients, show the no recipients text in the input area-->
          <span
            v-if="!recipients.length && !visibleOptions"
            class="group-role-select__selected-text"
            @click="openList"
          >
            No recipients selected
          </span>
          <!-- When closed and recipients are selected, show them as a tag list -->
          <template v-if="recipients.length && !visibleOptions">
            <span
              v-for="target in compactRecipients"
              :key="target.name"
              class="group-role-select__selected-role"
            >
              {{ target.name }}
              <span
                class="group-role-select__selected-role-x"
                @click="removeRecipient(target)"
              >
                <i class="cs-icons-close"></i>
              </span>
            </span>
          </template>

          <!-- When open show the search input and filter roles based on input -->
          <app-input-search
            v-if="visibleOptions"
            v-model="textSearch"
            placeholder="Search recipients"
          />
        </div>

        <!-- When closed, show the + button to open/expand -->
        <span
          v-if="!visibleOptions"
          class="group-role-select__toggle-button"
          @click="openList"
        >
          <i class="cs-icons-plus"></i>
        </span>
        <div v-else>
          <!-- When open, show a cancel button to close without saving -->
          <cs-button
            size="small"
            fill="outline"
            class="group-role-select__action-select"
            @click="closeList"
          >
            Cancel
          </cs-button>
          <!-- And show a select button to save the selected roles -->
          <cs-button
            size="small"
            class="group-role-select__action-select"
            @click="saveSelection"
            >Select</cs-button
          >
        </div>
      </div>

      <!-- When open, show the list of roles that can be selected -->
      <!-- Note: this is best tested on a group with subgroups as these can be selected too -->
      <div v-show="visibleOptions" class="group-role-select__list">
        <template v-for="target in filteredOptions">
          <transition :key="target.name" name="slide-fade">
            <span
              v-show="
                !isRolled(target.role, target.parentGroupId, target.rootGroupId)
              "
              class="group-role-select__list-item"
              :class="{
                'group-role-select__list-item--is-parent': target.isParent,
                'group-role-select__list-item--selected': isSelected(target),
              }"
            >
              <span
                v-if="target.parentGroupId"
                class="group-role-select__list-item-spacer"
                :class="{
                  'group-role-select__list-item-spacer--double':
                    target.rootGroupId,
                }"
              >
                &nbsp;
              </span>
              <app-check-box
                :label="target.name"
                :value="isSelected(target)"
                @click="toggle(target)"
              />
              <app-expand-button
                v-if="target.subgroupCount"
                :is-open="isRolled(target.role, target.id)"
                @click="rollSubgroups(target.role, target.id)"
              />
            </span>
          </transition>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import $apollo from '@/services/apollo';

// GQL
import ListSubgroupsByGroupId from '@/gql/groups/ListSubgroupsByGroupId.gql';

// General components
import AppCheckBox from '@/components/general/CheckBox.vue';
import AppInputSearch from '@/components/general/InputSearch.vue';
import AppExpandButton from '@/components/general/ExpandButton.vue';

import { sortByName } from '@/services/utils';

const allAdminObj = {
  name: 'All admins',
  role: 'alladmin',
  isParent: 'admin',
};
const allModeratorObj = {
  name: 'All moderators',
  role: 'allmoderator',
  isParent: 'moderator',
};
const allMemberObj = {
  name: 'All members',
  role: 'allmember',
  isParent: 'member',
};
const allObj = {
  admin: allAdminObj,
  moderator: allModeratorObj,
  member: allMemberObj,
};

export default {
  components: {
    AppCheckBox,
    AppInputSearch,
    AppExpandButton,
  },
  props: {
    subgroups: {
      type: Array,
      required: true,
    },
    group: {
      type: Object,
      required: true,
    },
    label: {
      type: String,
      required: false,
      default: '',
    },
  },
  data() {
    const childrenList = {};
    const rollList = {
      admin: {
        [this.group.id]: false,
      },
      moderator: {
        [this.group.id]: false,
      },
      member: {
        [this.group.id]: false,
      },
    };
    this.subgroups
      .slice()
      .sort(sortByName)
      .forEach((group) => {
        childrenList[group.id] = [];
        rollList.admin[group.id] = false;
        rollList.moderator[group.id] = false;
        rollList.member[group.id] = false;
      });
    return {
      recipients: [],
      selected: [],
      visibleOptions: false,
      textSearch: '',
      childrenList,
      rollList,
    };
  },
  computed: {
    sortedGroups() {
      return this.subgroups.slice().sort(sortByName);
    },
    allGroups() {
      const allGroups = [this.group];
      this.sortedGroups.forEach((group) => {
        allGroups.push(group);
        if (group.subgroupCount) {
          allGroups.push(...this.childrenGroup(group));
        }
      });
      return allGroups;
    },
    childrenGroup() {
      return function childrenGroup(group) {
        return this.childrenList[group.id] || [];
      };
    },
    options() {
      const admins = [allAdminObj];
      const moderators = [allModeratorObj];
      const members = [allMemberObj];
      this.allGroups.forEach((group) => {
        admins.push({
          name: `${group.name} - Admins`,
          role: 'admin',
          id: group.id,
          parentGroupId: group.parentGroupId,
          rootGroupId: group.rootGroupId,
          subgroupCount: group.subgroupCount,
        });
        moderators.push({
          name: `${group.name} - Moderators`,
          role: 'moderator',
          id: group.id,
          parentGroupId: group.parentGroupId,
          rootGroupId: group.rootGroupId,
          subgroupCount: group.subgroupCount,
        });
        members.push({
          name: `${group.name} - Members`,
          role: 'member',
          id: group.id,
          parentGroupId: group.parentGroupId,
          rootGroupId: group.rootGroupId,
          subgroupCount: group.subgroupCount,
        });
      });
      return [...admins, ...moderators, ...members];
    },
    filteredOptions() {
      if (!this.textSearch.trim()) return this.options;
      const txt = this.textSearch.trim().toLowerCase();
      return this.options.filter((target) =>
        target.name.toLowerCase().includes(txt)
      );
    },
    isRecipient() {
      return function isRecipient(target) {
        return target.isParent
          ? this.allRecipientsSelected(target.isParent)
          : this.recipients.includes(target);
      };
    },
    isSelected() {
      return function isSelected(target) {
        return target.isParent
          ? this.allRoleSelected(target.isParent)
          : this.selected.includes(target);
      };
    },
    allRoleSelected() {
      return function allRoleSelected(role) {
        return (
          this.selected.filter((target) => role === target.role).length ===
          this.allGroups.length
        );
      };
    },
    allRecipientsSelected() {
      return function allRecipientsSelected(role) {
        return (
          this.recipients.filter((target) => role === target.role).length ===
          this.allGroups.length
        );
      };
    },
    compactRecipients() {
      const result = [];
      ['admin', 'moderator', 'member'].forEach((role) => {
        const targets = this.allRecipientsSelected(role)
          ? [allObj[role]]
          : this.recipients.filter((target) => target.role === role);
        result.push(...targets);
      });
      return result;
    },
    isRolled() {
      return function isRolled(role, parentGroupId, rootGroupId) {
        if (!parentGroupId) return false;
        return !!(
          this.rollList[role][parentGroupId] || this.rollList[role][rootGroupId]
        );
      };
    },
  },
  async mounted() {
    this.sortedGroups.forEach((group) => {
      if (!group.subgroupCount) return;
      $apollo
        .query({
          query: ListSubgroupsByGroupId,
          variables: {
            parentGroupId: group.id,
          },
        })
        .then((data) => {
          this.childrenList[group.id].push(...data.data.groups);
        });
    });
  },
  methods: {
    toggle(target) {
      if (target.isParent) {
        this.toggleAllRole(target.isParent);
      } else if (this.isSelected(target)) {
        const index = this.selected.indexOf(target);
        this.selected.splice(index, 1);
      } else {
        this.selected.push(target);
        this.selectAllChildren(target);
      }
    },
    selectAllChildren({ role, id }) {
      this.options.forEach((target) => {
        if (target.parentGroupId === id || target.rootGroupId === id) {
          if (target.role === role) {
            if (!this.isSelected(target)) this.selected.push(target);
          }
        }
      });
    },
    removeRecipient(target) {
      if (target.isParent) {
        this.toggleAllRecipients(target.isParent);
      } else if (this.isRecipient(target)) {
        const index = this.recipients.indexOf(target);
        this.recipients.splice(index, 1);
      }
      this.$emit('input', this.recipients);
    },
    toggleAllRole(role) {
      if (this.allRoleSelected(role)) this.unselectRole(role);
      else this.selectRole(role);
    },
    toggleAllRecipients(role) {
      if (this.allRecipientsSelected(role)) this.unselectRecipient(role);
      else this.selectRecipient(role);
    },
    selectRole(role) {
      this.options.forEach((t) => {
        if (t.role === role && !this.selected.includes(t)) {
          this.selected.push(t);
        }
      });
    },
    unselectRole(role) {
      this.selected = this.selected.filter((target) => target.role !== role);
    },
    selectRecipient(role) {
      this.options.forEach((t) => {
        if (t.role === role && !this.recipients.includes(t)) {
          this.recipients.push(t);
        }
      });
    },
    unselectRecipient(role) {
      this.recipients = this.recipients.filter(
        (target) => target.role !== role
      );
    },
    openList() {
      this.selected = [...this.recipients];
      this.visibleOptions = true;
    },
    closeList() {
      this.textSearch = '';
      this.visibleOptions = false;
    },
    saveSelection() {
      const result = this.selected.map(({ id, role }) => ({
        groupId: id,
        role,
      }));
      this.recipients = [...this.selected];
      this.closeList();
      this.$emit('input', result);
    },
    rollSubgroups(role, groupId) {
      this.rollList[role][groupId] = !this.rollList[role][groupId];
    },
  },
};
</script>

<style scoped>
.group-role-select {
  font-family: var(--cs-font-primary);
}
label.group-role-select__label {
  margin-bottom: var(--cs-form-label-margin-y-bottom);
  font-weight: var(--cs-font-weight-800);
  color: var(--cs-gray-05);
  font-weight: var(--cs-font-weight-medium);
}
.group-role-select__wrapper {
  border-radius: 0.5rem;
  border: 1px solid var(--cs-gray-02);
}
.group-role-select__header {
  display: flex;
  justify-content: space-between;
}
.group-role-select__selected {
  flex-grow: 1;
  padding: 0.25rem 0.5rem;
  line-height: 2.2rem;
}
.group-role-select__selected-text {
  width: 100%;
  display: block;
  cursor: pointer;
  color: var(--cs-gray-04);
  margin-left: 0.5rem;
}
.group-role-select__selected-role {
  background: var(--cs-gray-02);
  border-radius: 1rem;
  margin-right: 0.2rem;
  padding: 0.2rem 0.6rem;
}
.group-role-select__selected-role-x {
  cursor: pointer;
  color: var(--cs-gray-03);
  border-radius: 1rem;
  margin: 0 0 0 0.2rem;
}
.group-role-select__selected-role-x i {
  font-size: 0.8rem;
}
.group-role-select__selected-role-x:hover {
  color: #000;
}
.group-role-select__toggle-button {
  padding: 0.5rem;
  margin-right: 0.5rem;
  cursor: pointer;
}
.group-role-select__action-select {
  margin-right: 0.5rem;
  margin-top: 0.4rem;
}
.group-role-select__list {
  display: flex;
  flex-direction: column;
  max-height: 300px;
  overflow-y: scroll;
}
.group-role-select__list-item {
  display: flex;
  padding: 0.3rem 0.5rem;
}
.group-role-select__list-item-spacer {
  width: 1.8rem;
}
.group-role-select__list-item-spacer--double {
  width: 3.6rem;
}
.group-role-select__list-item--is-parent {
  background: var(--cs-gray-01);
}
.group-role-select__list-item--selected {
  background: var(--cs-gray-02);
}
/* Enter and leave animations can use different */
/* durations and timing functions.              */
.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-leave-active {
  transition: all 0.3s;
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateY(-10px);
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 0;
  opacity: 0;
}
</style>
