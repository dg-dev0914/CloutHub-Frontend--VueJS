<template>
  <div class="group-user-select">
    <!-- Similar to GroupRoleSelect -->
    <!-- Used for selecting members as moderators or admins -->
    <!-- This selector has two states "open" (visibleOptions) and "closed" (!visibleOptions) -->
    <label class="group-user-select__label">{{ label }}</label>
    <div class="group-user-select__wrapper">
      <div class="group-user-select__header">
        <div class="group-user-select__selected">
          <!-- When closed and no users selected, show the no users text in the input area-->
          <span
            v-if="!selected.length && !visibleOptions"
            class="group-user-select__selected-text"
            @click="openList"
          >
            No users selected
          </span>
          <!-- When closed and users are selected, show them as a tag list -->
          <template v-if="selected.length && !visibleOptions">
            <span
              v-for="user in selected"
              :key="user.name"
              class="group-user-select__selected-user"
            >
              <app-avatar
                size="small"
                :picture="user.profilePhotoURL"
                :name="user.displayname"
                class="group-user-select__user-tag-avatar"
              />
              <app-username
                class="
                  group-user-select__user-tag-name
                  cs-textstyle-paragraph-small-bold
                "
                :user="user"
                type="username"
              />
              <i
                class="cs-icons-close group-user-select__user-tag-close"
                @click="unselectUser(user)"
              ></i>
            </span>
          </template>

          <!-- When open show the search input and filter members based on input -->
          <app-input-search
            v-if="visibleOptions"
            v-model="textSearch"
            placeholder="Search users"
          />
        </div>

        <!-- When closed, show the + button to open/expand -->
        <span
          v-if="!visibleOptions"
          class="group-user-select__toggle-button"
          @click="openList"
        >
          <i class="cs-icons-plus"></i>
        </span>

        <!-- Show an X button to hide the member list -->
        <span
          v-else
          class="group-user-select__toggle-button"
          @click="closeList"
        >
          <i class="cs-icons-close"></i>
        </span>
      </div>

      <transition name="slide">
        <!-- When open, show the list of group members that can be toggled to select/deselect -->
        <div v-show="visibleOptions" class="group-user-select__list">
          <div
            v-for="user in filteredUsers"
            :key="user.id"
            class="group-user-select__list-item"
            :class="{
              'group-user-select__list-item--selected': isSelected(user),
              'group-user-select__list-item--disabled': isDisabled(user),
            }"
            @click="toggleUser(user)"
          >
            <div class="group-user-select__item-header">
              <app-avatar
                :picture="user.profilePhotoURL"
                :name="user.displayname"
                size="small"
                class="group-user-select__option-avatar"
              />
              <div>
                <div class="cs-textstyle-paragraph-bold">
                  <app-username :user="user" type="displayname" />
                </div>
                <div class="ch-textstyle-paragraph-extra-small">
                  {{ user.username }}
                </div>
              </div>
            </div>
            <div
              v-if="isDisabled(user)"
              class="
                group-user-select__disabled-label
                cs-textstyle-paragraph-bold
              "
            >
              {{ disabledLabel }}
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import AppInputSearch from '@/components/general/InputSearch.vue';
import AppAvatar from '@/components/general/Avatar.vue';
import AppUsername from '@/components/general/Username.vue';

export default {
  components: {
    AppInputSearch,
    AppAvatar,
    AppUsername,
  },
  props: {
    users: {
      type: Array,
      required: false,
      default: () => [],
    },
    label: {
      type: String,
      required: false,
      default: '',
    },
    disabledLabel: {
      type: String,
      required: false,
      default: '',
    },
    disabledItems: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  data() {
    return {
      selected: [],
      visibleOptions: false,
      textSearch: '',
    };
  },
  computed: {
    filteredUsers() {
      if (!this.textSearch.trim()) return this.users;
      const txt = this.textSearch.trim().toLowerCase();
      return this.users.filter(
        (user) =>
          user.displayname.toLowerCase().includes(txt) ||
          user.username.toLowerCase().includes(txt)
      );
    },
    isSelected() {
      return function isSelected(user) {
        return this.selected.includes(user);
      };
    },
    isDisabled() {
      return function isDisabled(user) {
        return this.disabledItems.includes(user);
      };
    },
  },
  methods: {
    toggleUser(user) {
      if (this.disabledItems.includes(user)) return;
      if (this.isSelected(user)) this.unselectUser(user);
      else this.selectUser(user);
    },
    selectUser(user) {
      if (this.selected.includes(user)) return;
      this.selected.push(user);
      this.$emit('input', this.selected);
    },
    unselectUser(user) {
      if (this.isSelected(user)) {
        const index = this.selected.indexOf(user);
        this.selected.splice(index, 1);
      }
      this.$emit('input', this.selected);
    },
    openList() {
      this.visibleOptions = true;
      this.$emit('opening');
    },
    closeList() {
      this.textSearch = '';
      this.visibleOptions = false;
    },
  },
};
</script>

<style scoped>
.slide-enter-active {
  -moz-transition-duration: 0.3s;
  -webkit-transition-duration: 0.3s;
  -o-transition-duration: 0.3s;
  transition-duration: 0.3s;
  -moz-transition-timing-function: ease-in;
  -webkit-transition-timing-function: ease-in;
  -o-transition-timing-function: ease-in;
  transition-timing-function: ease-in;
}
.slide-leave-active {
  -moz-transition-duration: 0.3s;
  -webkit-transition-duration: 0.3s;
  -o-transition-duration: 0.3s;
  transition-duration: 0.3s;
  -moz-transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
  -webkit-transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
  -o-transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
  transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
}
.slide-enter-to,
.slide-leave {
  height: 300px;
  overflow: hidden;
}
.slide-enter,
.slide-leave-to {
  overflow: hidden;
  height: 0;
}
.group-user-select {
  font-family: var(--cs-font-primary);
}
label.group-user-select__label {
  margin-bottom: var(--cs-form-label-margin-y-bottom);
  font-weight: var(--cs-font-weight-800);
  color: var(--cs-gray-06);
  font-weight: var(--cs-font-weight-medium);
}
.group-user-select__wrapper {
  border-radius: 0.5rem;
  border: 1px solid var(--cs-gray-02);
}
.group-user-select__header {
  display: flex;
  justify-content: space-between;
}
.group-user-select__selected {
  flex-grow: 1;
  padding: 0.25rem 0.5rem;
  line-height: 2.2rem;
}
.group-user-select__selected-text {
  width: 100%;
  display: block;
  cursor: pointer;
  color: var(--cs-gray-04);
  margin-left: 0.5rem;
}
.group-user-select__selected-user {
  display: inline-flex;
  align-items: center;
  align-content: center;
  background: var(--cs-gray-02);
  border-radius: 1rem;
  margin-right: 0.4rem;
  margin-bottom: 0.2rem;
  margin-top: 0.2rem;
  padding: 0 0.6rem;
}
.group-user-select__user-tag-avatar {
  --ch-avatar-size: 18px;
}
.group-user-select__user-tag-avatar >>> .ch-avatar__content {
  display: inline-block;
  position: relative;
  top: 0.2rem;
  border: none;
}
.group-user-select__user-tag-name {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}
.group-user-select__user-tag-close {
  padding: 5px;
  margin: -5px;
  font-size: 10px;
  color: var(--cs-gray-04);
  cursor: pointer;
}
.group-user-select__user-tag-close:hover {
  color: var(--cs-gray-07);
}
.group-user-select__toggle-button {
  padding: 0.6rem 0.5rem 0.4rem;
  margin-right: 0.5rem;
  cursor: pointer;
}
.group-user-select__action-select {
  margin-right: 0.5rem;
  margin-top: 0.4rem;
}
.group-user-select__list {
  display: flex;
  flex-direction: column;
  max-height: 300px;
  overflow-y: scroll;
}
.group-user-select__list-item {
  display: flex;
  padding: 0.3rem 0.5rem;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}
.group-user-select__list-item--is-parent {
  background: var(--cs-gray-01);
}
.group-user-select__list-item--disabled {
  background: var(--cs-gray-03);
  color: var(--cs-gray-01);
  cursor: not-allowed;
}
.group-user-select__list-item--selected {
  background: var(--cs-primary-base);
  color: white;
}
.group-user-select__option-avatar {
  margin: 0.3rem 0.5rem 0.3rem 0;
}
.group-user-select__item-header {
  display: flex;
  flex-grow: 1;
}
.group-user-select__disabled-label {
  justify-self: flex-end;
  margin-left: 2rem;
}
</style>
