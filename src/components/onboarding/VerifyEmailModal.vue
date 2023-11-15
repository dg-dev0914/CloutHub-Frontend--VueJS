// TODO: Refactor OTP portion and make it as a separate component

<template lang="html">
  <app-modal
    class="ch-verify-modal"
    :show="showVerifyModal"
    title="Verify Email"
    @close="close"
  >
    <div class="ch-verify-modal__body">
      <h3>Welcome Back</h3>
      <div class="cs-textstyle-informative-paragraph">
        You must verify your email address to continue using CloutHub.
      </div>
      <div class="final-form__info cs-textstyle-paragraph text-light">
        <div>We've send a verification code to {{ email }}.</div>
        <div>Please enter the 6 digits below.</div>
      </div>
      <div class="otp">
        <VueOtpInput
          ref="otpInput"
          input-classes="otp-input"
          separator=""
          :num-inputs="6"
          :is-input-num="true"
          @on-complete="handleOnComplete"
        />
      </div>
      <div class="submit-btn">
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
    </div>
  </app-modal>
</template>

<script>
import $popups from '@/services/popups';
import AppModal from '@/components/general/Modal.vue';
import VueOtpInput from '@bachdgvn/vue-otp-input';
import VerifyOTP from '@/gql/onboarding/VerifyOTP.gql';
import ResendOTP from '@/gql/onboarding/ResendOTP.gql';

export default {
  components: {
    AppModal,
    VueOtpInput,
  },
  props: {
    showVerifyModal: {
      type: Boolean,
      required: true,
      default: false,
    },
    email: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      timerCount: 0,
      verified: false,
    };
  },
  computed: {
    timerText() {
      const text = this.timerCount ? `(${this.timerCount}s)` : '';
      return text;
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
    },
  },
  mounted() {},
  methods: {
    close() {
      this.$emit('close-verify-modal', this.verified);
    },
    handleOnComplete(value) {
      this.otp = parseInt(value, 10);
      this.verifyOTP();
    },
    async verifyOTP() {
      try {
        const resp = await this.$apollo.mutate({
          mutation: VerifyOTP,
          variables: {
            email: this.email,
            otp: this.otp,
          },
        });
        this.verified = resp.data.verified;
        this.close();
      } catch (error) {
        $popups.alert('Incorrect OTP. Please enter again or resend otp again.');
        this.handleClearInput();
      }
    },
    handleClearInput() {
      this.$refs.otpInput.clearInput();
    },
    async sendAgain() {
      console.log('Sending an otp to email again');
      const resp = await this.$apollo.mutate({
        mutation: ResendOTP,
        variables: {
          email: this.email,
        },
      });
      if (resp.data.resend) {
        this.timerCount = 60;
      }
    },
  },
};
</script>

<style scoped>
.ch-verify-modal >>> .ch-modal__popup {
  max-height: none;
}
.ch-verify-modal__body {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 7px;
  text-align: center;
}
.text-light {
  color: var(--cs-gray-03);
}
.otp {
  display: flex;
  flex-direction: row;
  margin-bottom: 40px;
  align-items: center;
  margin-top: 20px;
  justify-content: center;
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
.otp-input::-webkit-inner-spin-button,
.otp-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.cs-button-email {
  --cs-button-padding: 0px !important;
}
</style>
