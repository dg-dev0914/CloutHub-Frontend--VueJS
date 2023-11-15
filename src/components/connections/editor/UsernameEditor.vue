<template>
  <div class="ch-username-editor">
    <cs-input
      v-if="user.badgeType == null || user.badgeType == 'none'"
      v-model="username"
      label="Username"
      type="text"
      class="ch-username-editor__input"
      placeholder="@Enter a username for yourself"
      @input="removeUsernameError"
    />
    <div
      v-if="user.badgeType != null && user.badgeType != 'none'"
      class="mt-2 cs-textstyle-paragraph-small"
    >
      <i class="cs-icons-info"></i> You're a verified user. To change your
      username, please contact <b>support@clouthub.com</b>
    </div>
    <app-validator-option v-if="availableUsername" valid label="Available" />
    <app-validator-option v-if="errorMessage" :label="errorMessage" />

    <div v-if="loading" class="ch-username-editor__spinner"><cs-spinner /></div>

    <app-username-validator
      v-if="unverifiedPerson"
      v-model="usernameValid"
      :username="username"
    />
  </div>
</template>

<script>
import CheckUsername from '@/gql/onboarding/CheckUsername.gql';

import AppUsernameValidator from '@/components/general/UsernameValidator.vue';
import AppValidatorOption from '@/components/general/ValidatorOption.vue';

import _ from 'lodash';

export default {
  components: {
    AppUsernameValidator,
    AppValidatorOption,
  },
  props: {
    name: {
      type: String,
      required: true,
    },
    user: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      username: '',
      usernameValid: false,
      errorMessage: '',
      availableUsername: null,
      showError: false,
      loading: false,
    };
  },
  computed: {
    valid() {
      return !!this.username && !!this.usernameValid;
    },
    unverifiedPerson() {
      return this.user.badgeType === null || this.user.badgeType === 'none';
    },
  },
  mounted() {
    this.username = this.name;
  },
  methods: {
    async removeUsernameError() {
      this.errorMessage = '';
      this.availableUsername = false;
      const username =
        this.username.charAt(0) === '@'
          ? `${this.username}`
          : `@${this.username}`;
      this.$emit('send', { username, valid: false });
      this.debounceInput();
    },
    debounceInput: _.debounce(async function checkAvailability() {
      if (!this.usernameValid) return;

      const username =
        this.username.charAt(0) === '@'
          ? `${this.username}`
          : `@${this.username}`;
      this.loading = true;

      try {
        await this.$apollo.query({
          query: CheckUsername,
          variables: {
            username,
          },
        });
        this.availableUsername = true;
        this.errorMessage = '';
        this.$emit('send', { username, valid: this.valid });
      } catch (err) {
        this.availableUsername = false;
        this.errorMessage = err.message;
        this.$emit('send', { username, valid: false });
      }
      this.loading = false;
    }, 500),
  },
};
</script>

<style scoped>
.ch-set-username {
  background: var(--cs-gray-01);
  padding: 20px;
}
.ch-username-editor__input {
  width: 100%;
}

.ch-username-editor__spinner {
  display: block;
  height: 24px;
  margin-top: -15px;
  margin-left: 20px;
  margin-bottom: 34px;
}
.ch-username-editor__spinner >>> .cs-spinner__dots {
  margin: 0;
}
.ch-username-editor__verified {
  margin-top: 5px;
}
</style>
