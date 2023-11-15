<template>
  <div class="ch-multiselect-user-input">
    <label class="cs-textstyle-label-text">{{ label }}</label>
    <multiselect
      :value="value"
      placeholder="Search for members"
      class="ch-multiselect-user-input__multiselect"
      :options="userList"
      :multiple="true"
      :local-search="false"
      :loading="isLoading"
      :internal-search="false"
      :allow-empty="false"
      @search-change="handleSearch"
      @select="handleSelect"
      @remove="handleRemove"
    >
      <!-- @input="onSelectChange" -->
      <template slot="tag" slot-scope="{ option, remove }">
        <span class="ch-multiselect-user-input__user-tag">
          <app-avatar
            :picture="option.profilePhotoURL"
            :name="option.displayname"
            class="ch-multiselect-user-input__user-tag-avatar"
            size="small"
          />
          <app-username
            class="
              ch-multiselect-user-input__user-tag-name
              cs-textstyle-paragraph-small-bold
            "
            :user="option"
            type="username"
          />
          <i
            class="cs-icons-close ch-multiselect-user-input__user-tag-close"
            @click="handleRemove(option)"
          ></i>
        </span>
      </template>

      <!-- style="display: flex" -->
      <template slot="option" slot-scope="props">
        <div class="ch-multiselect-user-input__option-wrapper">
          <app-avatar
            :picture="props.option.profilePhotoURL"
            :name="props.option.displayname"
            size="small"
            class="ch-multiselect-user-input__option-avatar"
          />
          <div>
            <div class="cs-textstyle-paragraph-bold">
              <app-username :user="props.option" type="displayname" />
            </div>
            <div class="ch-textstyle-paragraph-extra-small">
              {{ props.option.username }}
            </div>
          </div>
        </div>
      </template>
    </multiselect>
  </div>
</template>

<script>
import $auth from '@/services/auth';

import UserSearch from '@/gql/search/UserSearch.gql';

import Multiselect from 'vue-multiselect';

import AppAvatar from '@/components/general/Avatar.vue';
import AppUsername from '@/components/general/Username.vue';

export default {
  components: {
    Multiselect,
    AppAvatar,
    AppUsername,
  },
  props: {
    label: {
      type: String,
    },
    value: {
      type: Array,
    },
    hideLoggedInUser: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      show: false,
      options: [],
      searchQuery: null,
      userList: [],
      userSearchTimer: null,
      isLoading: false,
    };
  },
  mounted() {
    this.handleSearch('');
  },
  methods: {
    handleSelect($event) {
      const updatedList = [...this.value, $event];
      this.$emit('input', updatedList);
    },
    handleRemove($event) {
      const updatedList = this.value.filter((val) => val !== $event);
      this.$emit('input', updatedList);
    },
    handleSearch(word) {
      this.isLoading = true;
      this.searchQuery = word;
      clearTimeout(this.userSearchTimer);
      this.userSearchTimer = setTimeout(async () => {
        const { data } = await this.$apollo.query({
          query: UserSearch,
          variables: {
            query: this.searchQuery,
          },
        });
        this.userList =
          data.users &&
          data.users.filter((user) => {
            if (this.hideLoggedInUser) return user.id !== $auth.getUserId();
            return user;
          });
        this.isLoading = false;
      }, 700);
    },
  },
};
</script>

<style scoped>
.ch-multiselect-user-input__multiselect {
  position: static;
}
/* Spinner and Dropdown icon */
.ch-multiselect-user-input__multiselect >>> .multiselect__spinner {
  position: relative;
  float: right;
  margin-top: -4px;
  margin-right: -32px;
  width: 20px;
}
.ch-multiselect-user-input__multiselect >>> .multiselect__select {
  position: static;
  float: right;
  margin-top: 6px;
}
.ch-multiselect-user-input >>> .multiselect__option--selected {
  background: var(--cs-primary-base) !important;
}
.ch-multiselect-user-input >>> .multiselect__option--highlight {
  background: var(--cs-primary-base) !important;
}
.ch-multiselect-user-input >>> .multiselect__option--highlight:after {
  background: var(--cs-primary-base) !important;
}
/* User Tags */
.ch-multiselect-user-input__user-tag {
  background-color: var(--cs-gray-02);
  display: inline-flex;
  padding: 5px 8px;
  border-radius: 15px;
  align-items: center;
  margin-right: 8px;
  margin-bottom: 8px;
}
.ch-multiselect-user-input__user-tag-avatar {
  --ch-avatar-size: 18px;
}
.ch-multiselect-user-input__user-tag-avatar >>> .ch-avatar__content {
  border: none;
}
.ch-multiselect-user-input__user-tag-name {
  padding-left: 6px;
  padding-right: 10px;
}
.ch-multiselect-user-input__user-tag-close {
  padding: 5px;
  margin: -5px;
  font-size: 10px;
  color: var(--cs-gray-04);
}
/* Search Results list */
.ch-multiselect-user-input__multiselect >>> .multiselect__content-wrapper {
  left: 20px;
  right: 20px;
  width: unset;
  bottom: unset;
}
/* User Options */
.ch-multiselect-user-input__option-wrapper {
  display: flex !important;
}
.ch-multiselect-user-input__option-avatar {
  margin-right: 10px;
}
</style>
