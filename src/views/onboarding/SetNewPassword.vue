<template>
  <div class="set-password-form">
    <img class="logo" src="@/assets/images/clouthub-logo.png" />
    <div class="info">
      <div class="cs-textstyle-section-heading">Reset your Password</div>
      <div v-if="!sent" class="cs-textstyle-paragraph">
        Please enter your preferred new password.
      </div>
    </div>
    <div v-if="sent">Your password has been changed.</div>
    <app-spinner v-if="sending" />
    <div v-if="!sending && !sent" class="set-password-form__fields">
      <div class="set-password-form__fields-input">
        <app-password-input
          v-model="password"
          label="Enter Your New Password"
        />
        <app-password-input
          v-model="confirmPassword"
          label="Confirm Your New Password"
        />
        <app-password-validator
          v-model="validPassword"
          :password="password"
          :confirm-password="confirmPassword"
        />
      </div>
    </div>
    <div class="set-password-form__buttons-container">
      <cs-button
        v-if="!sent"
        variant="primary"
        class="set-password-form__continue-button"
        :disabled="!validForm || sending"
        @click="onContinue"
      >
        Continue
      </cs-button>
      <cs-button
        fill="clear"
        class="set-password-form__back-button"
        to="/onboarding/"
      >
        Back to Login
      </cs-button>
    </div>
  </div>
</template>

<script>
import ResetPassword from '@/gql/auth/ResetPassword.gql';
import AppSpinner from '@/components/general/Spinner.vue';
import AppPasswordInput from '@/components/general/PasswordInput.vue';
import AppPasswordValidator from '@/components/general/PasswordValidator.vue';

export default {
  components: {
    AppPasswordInput,
    AppPasswordValidator,
    AppSpinner,
  },
  data() {
    return {
      password: '',
      confirmPassword: '',
      validPassword: false,
      sending: false,
      sent: false,
    };
  },
  computed: {
    validForm() {
      return this.validPassword;
    },
  },
  methods: {
    async onContinue() {
      this.sending = true;
      const variables = {
        jwtToken: this.$route.params.token,
        password: this.password.trim(),
      };
      await this.$apollo.mutate({
        mutation: ResetPassword,
        variables,
      });
      this.sending = false;
      this.sent = true;
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
  margin-top: 20px;
  margin-bottom: 20px;
  color: var(--cs-gray-05);
}
.info p {
  max-width: 100%;
  margin-top: 10px;
  font: normal normal normal 16px/24px Roboto;
  color: var(--cs-gray-04);
}
.set-password-form__buttons-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.set-password-form__back-button {
  --cs-button-text-color: #47535a !important;
  --cs-button-text-color-hover: #47535a !important;
}
.set-password-form__fields {
  margin-bottom: 10px;
}
.set-password-form__continue-button {
  width: 239px;
}
* >>> .cs-input__input {
  width: 500px !important;
}
</style>
