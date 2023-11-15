<template>
  <div class="name-form onboarding" @keyup.enter="continueToEmailForm">
    <cs-input
      v-model="firstName"
      label="First Name"
      required
      type="text"
      placeholder="Enter your first name"
    />
    <cs-input
      v-model="lastName"
      label="Last Name"
      required
      type="text"
      placeholder="Enter your last name"
    />
    <cs-checkbox v-model="acceptTerms"
      >I agree to the
      <a :href="termsOfUseUrl" target="_system" @click.stop
        ><span class="name-form__terms-of-use">Terms of Use</span></a
      >
      &amp;
      <a :href="privacyPolicyUrl" target="_system" @click.stop
        ><span class="name-form__terms-of-use">Privacy Policy</span></a
      >.
    </cs-checkbox>
    <cs-checkbox v-model="acceptAge"
      >I confirm I am 16 years or older to join CloutHub.
      <div class="name-form__confirm-age">
        To join CloutHub you must be over 16 years of age.
      </div>
    </cs-checkbox>
    <div class="continue-button-container">
      <cs-button
        size="large"
        variant="primary"
        :disabled="!valid"
        @click="continueToEmailForm"
      >
        Continue
      </cs-button>
    </div>
    <div
      v-if="!isMeeting"
      class="signup-form__back-button__container name-form_back"
    >
      <cs-button
        fill="clear"
        class="signup-form__back-button"
        to="/onboarding/"
      >
        Back to Login
      </cs-button>
    </div>
  </div>
</template>

<script>
import { policyPagesUrls } from '@/constants';

export default {
  props: {
    isMeeting: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      firstName: null,
      lastName: null,
      acceptTerms: false,
      acceptAge: false,
      ...policyPagesUrls,
    };
  },
  computed: {
    valid() {
      return (
        !!this.firstName &&
        !!this.lastName &&
        !!this.acceptTerms &&
        !!this.acceptAge
      );
    },
  },
  mounted() {
    this.firstName = localStorage.draftUserFirstName
      ? localStorage.draftUserFirstName
      : null;
    this.lastName = localStorage.draftUserLastName
      ? localStorage.draftUserLastName
      : null;
  },
  methods: {
    async continueToEmailForm() {
      if (this.valid) {
        localStorage.draftUserFirstName = this.firstName;
        localStorage.draftUserLastName = this.lastName;
        if (this.isMeeting) {
          this.$emit('show-email');
        } else {
          this.$router.push({ path: 'emailform' });
        }
      }
    },
  },
};
</script>

<style scoped>
.name-form__terms-of-use {
  color: #f06027;
}
.name-form__confirm-age {
  margin: 0;
  font-size: 13px;
}
.name-form_back {
  text-align: right;
}
</style>
