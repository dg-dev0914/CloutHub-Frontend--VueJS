<template>
  <div class="onboarding username-form" @keyup.enter="next">
    <cs-input
      v-model="username"
      label="Username"
      required
      type="text"
      placeholder="Enter a username for yourself"
      :disabled="verifying"
      @input="checkUsernameStatus"
    />
    <username-validator
      v-model="validUsername"
      :username="username"
      :alreadyuse="alreadyUse"
    ></username-validator>
    <app-spinner v-if="verifying"></app-spinner>
    <div v-if="!verifying" class="continue-button-container">
      <cs-button
        size="large"
        variant="primary"
        :disabled="!validUsername || alreadyUse"
        @click="next"
      >
        Continue
      </cs-button>
    </div>
    <div v-if="!isMeeting" class="username-form__back-button__container">
      <div class="username-form__backbutton">
        <div class="username-form__back">
          <cs-button
            fill="clear"
            to="emailform"
            class="username-form__back-button"
          >
            Back
          </cs-button>
        </div>
        <div class="username-form__backtologin">
          <cs-button
            fill="clear"
            class="signup-form__back-button"
            to="/onboarding/"
          >
            Back to Login
          </cs-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CheckUsername from '@/gql/onboarding/CheckUsername.gql';
import AppSpinner from '@/components/general/Spinner.vue';
import UsernameValidator from '../general/UsernameValidator.vue';

export default {
  components: {
    UsernameValidator,
    AppSpinner,
  },
  props: {
    isMeeting: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      username: '',
      verifying: false,
      alreadyUse: false,
      validUsername: false,
    };
  },
  mounted() {
    this.username = localStorage.draftusername
      ? localStorage.draftusername
      : '';
  },
  methods: {
    checkUsernameStatus() {
      if (this.alreadyUse) {
        this.alreadyUse = false;
      }
    },
    async next() {
      if (this.validUsername) {
        this.alreadyUse = false;
        this.verifying = true;
        const username =
          this.username.charAt(0) === '@'
            ? `${this.username}`
            : `@${this.username}`;
        try {
          await this.$apollo.query({
            query: CheckUsername,
            variables: {
              username,
            },
          });
          localStorage.draftusername = username;
          if (this.isMeeting) {
            this.$emit('show-password');
          } else {
            this.$router.push({ path: 'passwordform' });
          }
        } catch (err) {
          this.alreadyUse = true;
        }
        this.verifying = false;
      }
    },
  },
};
</script>

<style scoped>
.username-form__backbutton {
  width: 100%;
  float: left;
}
.username-form__back {
  float: left;
  width: 50%;
}
.username-form__backtologin {
  float: right;
  text-align: right;
  width: 50%;
}
</style>
