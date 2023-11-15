// TODO: Refactor OTP portion and make it as a separate component
<template>
  <div class="final-form">
    <div class="final-form__info cs-textstyle-paragraph warning">
      <div>Type in 111111 to verify your account.</div>
    </div>

    <div class="final-form__info cs-textstyle-paragraph text-light ch-hidden">
      <div>We've send a verification code to {{ registeredEmail }}.</div>
      <div>Please enter the 6 digits below.</div>
    </div>
    <cs-button
      size="small"
      fill="clear"
      class="cs-button-email"
      @click="openUpdateEmail"
      >Change email ?</cs-button
    >
    <div :class="['otp', { 'is-disabled': !otpSent }]">
      <VueOtpInput
        ref="otpInput"
        input-classes="otp-input"
        separator=""
        :num-inputs="6"
        :is-input-num="true"
        @on-complete="handleOnComplete"
      />
    </div>
    <div class="submit-btn ch-hidden">
      <div class="cs-textstyle-paragraph-small text-light">
        Didn't receive the email?
        <cs-button
          fill="clear"
          size="small"
          :disabled="!!timerCount"
          class="cs-button-email"
          @click="sendAgain"
          >Send Again {{ timerText }}</cs-button
        >
      </div>
    </div>
    <!-- Update Email Modal -->
    <app-update-email-modal
      :show-update-modal="showUpdateModal"
      :username="draftUser.username"
      @close-update-modal="closeUpdateModal"
    ></app-update-email-modal>
  </div>
</template>

<script>
import $popups from '@/services/popups';
import VueOtpInput from '@bachdgvn/vue-otp-input';
import AppUpdateEmailModal from '@/components/onboarding/UpdateEmailModal.vue';
import Register from '@/gql/general/Register.gql';
import VerifyOTP from '@/gql/onboarding/VerifyOTP.gql';
import ResendOTP from '@/gql/onboarding/ResendOTP.gql';

export default {
  components: {
    VueOtpInput,
    AppUpdateEmailModal,
  },
  props: {
    draftUser: {
      type: Object,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    isMeeting: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      otp: null,
      email: null,
      timerCount: 60,
      otpSent: true,
      registerResponse: null,
      showUpdateModal: false,
      updatedEmail: null,
    };
  },
  computed: {
    timerText() {
      const text = this.timerCount ? `(${this.timerCount}s)` : '';
      return text;
    },
    registeredEmail() {
      const email = this.updatedEmail
        ? this.updatedEmail
        : this.draftUser.email;

      return email;
    },
  },
  watch: {
    timerCount: {
      handler(value) {
        if (value > 0) {
          setTimeout(() => {
            this.timerCount -= 1;
          }, 1000);
        }
      },
      immediate: true, // This ensures the watcher is triggered upon creation
    },
  },
  async mounted() {
    this.registerResponse = await this.$apollo.mutate({
      mutation: Register,
      variables: this.draftUser,
    });
    this.otpSent = true;
  },
  methods: {
    handleOnComplete(value) {
      this.otp = parseInt(value, 10);
      this.verifyOTP();
    },
    async verifyOTP() {
      try {
        const resp = await this.$apollo.mutate({
          mutation: VerifyOTP,
          variables: {
            email: this.registeredEmail,
            otp: this.otp,
          },
        });
        if (resp.data.verified) {
          const token = this.registerResponse.data.token;
          localStorage.access_token = token;
          if (this.isMeeting) {
            this.$emit('done');
          } else if (localStorage.loginRedirect) {
            const loggedInUrl = `#${localStorage.loginRedirect}`;
            window.location.href = loggedInUrl;
            localStorage.removeItem('loginRedirect');
            window.location.reload();
          } else {
            window.location.href = '/';
          }
        }
      } catch (error) {
        $popups.alert('Incorrect OTP. Please enter again or resend otp again.');
        this.handleClearInput();
      }
    },
    handleClearInput() {
      this.$refs.otpInput.clearInput();
    },
    async sendAgain() {
      console.log('here');
      const resp = await this.$apollo.mutate({
        mutation: ResendOTP,
        variables: {
          email: this.registeredEmail,
        },
      });
      if (resp.data.resend) {
        this.timerCount = 60;
      }
    },
    // Update Email Modal
    openUpdateEmail() {
      this.showUpdateModal = true;
    },
    closeUpdateModal(email) {
      if (email) {
        this.updatedEmail = email;
      }
      this.showUpdateModal = false;
    },
  },
};
</script>
<style scoped>
.otp {
  display: flex;
  flex-direction: row;
  margin-bottom: 40px;
  align-items: center;
  margin-top: 20px;
}
* >>> .otp-input {
  width: 50px;
  height: 50px;
  padding: 5px;
  margin: 0 18px;
  border-radius: 4px;
  border: 1px solid var(--cs-gray-07);
  text-align: center;
}
* >>> .otp-input:focus {
  border: 2px solid var(--cs-primary-base) !important;
}
.error {
  border: 1px solid var(--cs-danger-base) !important;
}
.warning{
  color: red;
}
.ch-hidden {
  display: none;
}
.otp-input::-webkit-inner-spin-button,
.otp-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.text-light {
  color: var(--cs-gray-03);
}
.cs-button-email {
  --cs-button-padding: 0px !important;
}
.cs-button-verify {
  width: 200px;
  margin-bottom: 10px;
}
.is-disabled {
  pointer-events: none;
}
</style>
