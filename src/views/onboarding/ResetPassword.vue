<template>
  <div class="onboarding reset-password-form">
    <img class="logo" src="@/assets/images/clouthub-logo.png" />
    <app-spinner v-if="sending" />
    <div
      v-if="!sending && !sent"
      class="info"
      @keyup.enter="sendVerificationCode"
    >
      <div class="reset-password-form__resetemail" tabindex="0">
        <div class="cs-textstyle-paragraph">
          Please enter your email address to receive a password reset link.
        </div>
        <cs-input
          v-model="resetEmail"
          type="email"
          placeholder="Enter your email"
        >
        </cs-input>
      </div>
    </div>
    <div
      v-if="sent"
      class="cs-textstyle-paragraph-bold reset-password-form__inform"
    >
      An email with the reset password link has been sent to your address.
    </div>
    <div class="reset-password-form__buttons-container">
      <cs-button
        v-if="!sending && !sent"
        size="large"
        variant="primary"
        class="reset-password-form__continue-button"
        :disabled="disableContinue"
        @click="sendVerificationCode"
      >
        Continue
      </cs-button>
      <cs-button
        fill="clear"
        class="reset-password-form__back-button"
        to="/onboarding/"
      >
        Back to Login
      </cs-button>
    </div>
  </div>
</template>

<script>
import $popups from '@/services/popups';
import SendPasswordReset from '@/gql/auth/SendPasswordReset.gql';
import AppSpinner from '@/components/general/Spinner.vue';

export default {
  components: {
    AppSpinner,
  },
  data() {
    return {
      resetEmail: '',
      sending: false,
      sent: false,
    };
  },
  computed: {
    disableContinue() {
      return !this.resetEmail;
    },
  },
  methods: {
    async sendVerificationCode() {
      // Next is the URL to redirect the user to from the email reset link. The token is appended
      if (this.resetEmail) {
        const next = window.location.href.replace(
          '/resetpassword',
          '/setnewpassword/'
        );
        this.sending = true;
        const variables = {
          email: this.resetEmail.trim(),
          next,
        };
        try {
          await this.$apollo.mutate({
            mutation: SendPasswordReset,
            variables,
          });
          this.sending = false;
          this.sent = true;
        } catch (err) {
          $popups.alert(err.message);
          this.sending = false;
        }
      }
    },
  },
};
</script>

<style scoped>
.logo {
  width: 176px;
  height: 48px;
  opacity: 1;
}
.info {
  margin-top: 65px;
  margin-bottom: 40px;
  color: var(--cs-gray-05);
}
.info p {
  max-width: 100%;
  margin-top: 10px;
  font: normal normal normal 16px/24px Roboto;
  color: var(--cs-gray-04);
}
.reset-password-form__buttons-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.reset-password-form__back-button {
  --cs-button-text-color: #47535a !important;
  --cs-button-text-color-hover: #47535a !important;
}
.reset-password-form__fields-input {
  margin-top: 40px;
}
.reset-password-form__continue-button {
  width: 239px;
  margin: 10px;
}
.reset-password-form__resetemail {
  margin-top: 25px;
}
</style>
