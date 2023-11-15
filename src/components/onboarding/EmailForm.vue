<template>
  <div class="onboarding email-form" tabindex="0" @keyup.enter="next">
    <cs-input
      v-model="emailAddress"
      label="Email Address"
      required
      type="email"
      :disabled="verifying"
      placeholder="Enter your email address"
    />
    <cs-input
      v-model="confirmEmailAddress"
      label="Confirm Email Address "
      required
      type="email"
      :disabled="verifying"
      placeholder="Enter confirm email address"
    />
    <div class="email-form__requirements-info">
      <p class="email-form__requirements">Requirements</p>
      <p
        :class="
          emailFormatError
            ? 'email-form__requirement'
            : 'email-form__requirement_success'
        "
      >
        <i class="cs-icons-check-success"></i> Valid email entered.
      </p>
      <p
        :class="
          isEmailMismatch
            ? 'email-form__requirement'
            : 'email-form__requirement_success'
        "
      >
        <i class="cs-icons-check-success"></i> Email matches with confirm email.
      </p>
    </div>
    <app-spinner v-if="verifying"></app-spinner>
    <div v-if="!verifying" class="continue-button-container">
      <cs-button
        size="large"
        variant="primary"
        :disabled="!validEmail"
        @click="next"
      >
        Continue
      </cs-button>
    </div>
    <div v-if="!isMeeting" class="email-form__back-button__container">
      <div class="email-form__backbutton">
        <div class="email-form__back">
          <cs-button fill="clear" to="nameform" class="email-form__back-button">
            Back
          </cs-button>
        </div>
        <div class="email-form__backtologin">
          <cs-button
            fill="clear"
            to="/onboarding/"
            class="email-form__back-button"
          >
            Back to Login
          </cs-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import $popups from '@/services/popups';
import CheckUserEmail from '@/gql/onboarding/CheckUserEmail.gql';
import AppSpinner from '@/components/general/Spinner.vue';

export default {
  components: {
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
      emailAddress: null,
      confirmEmailAddress: null,
      verifying: false,
      // isEmailMismatch: false,
    };
  },
  computed: {
    emailFormatError() {
      const emailFormat =
        this.emailAddress === null || this.emailAddress === ''
          ? true
          : this.emailAddress &&
            !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
              this.emailAddress
            );
      return emailFormat;
    },
    validEmail() {
      return (
        !!this.confirmEmailAddress &&
        !!this.emailAddress &&
        this.emailAddress === this.confirmEmailAddress &&
        !this.emailFormatError
      );
    },
    isEmailMismatch() {
      return this.emailAddress === null || this.emailAddress === ''
        ? true
        : this.emailAddress !== this.confirmEmailAddress;
    },
  },
  mounted() {
    this.emailAddress = localStorage.draftUserEmailAddress
      ? localStorage.draftUserEmailAddress
      : null;
    this.confirmEmailAddress = localStorage.draftUserEmailAddress
      ? localStorage.draftUserEmailAddress
      : null;
  },
  methods: {
    async next() {
      if (this.validEmail) {
        this.verifying = true;
        try {
          await this.$apollo.query({
            query: CheckUserEmail,
            variables: {
              email: this.emailAddress,
            },
          });
          localStorage.draftUserEmailAddress = this.emailAddress;
          if (this.isMeeting) {
            this.$emit('show-username');
          } else {
            this.$router.push({ path: 'usernameform' });
          }
        } catch (err) {
          $popups.alert(err.message);
        }
        this.verifying = false;
      }
    },
  },
};
</script>

<style scoped>
.email-form__requirement i {
  margin-right: 3px;
}

.email-form__requirement {
  margin: 3px;
  color: var(--cs-gray-04);
}
.email-form__requirement_success {
  margin: 3px;
  color: var(--cs-success-base);
}
.email-form__requirements-info {
  margin-bottom: 20px;
}
.email-form__requirements {
  margin-bottom: 0;
  font-weight: bold;
  color: var(--cs-gray-05);
}
.email-form__backbutton {
  width: 100%;
  float: left;
}
.email-form__back {
  width: 50%;
  float: left;
}
.email-form__backtologin {
  width: 50%;
  float: right;
  text-align: right;
}
</style>
