<template>
  <div class="onboarding password-form">
    <app-final-form
      v-if="showFinalForm"
      :draft-user="draftUser"
      :token="token"
    />
    <div v-if="!showFinalForm" @keyup.enter="continueToPhonePage">
      <div class="password-form__input-pass">
        <cs-input
          v-model="password"
          label="Password"
          required
          :type="passwordType"
          @input="validatePass"
        />
        <cs-button
          variant="default"
          fill="clear"
          size="small"
          class="password-form__hide-icon"
          @click="showPassword = !showPassword"
          ><i
            :class="
              showPassword ? 'ch-icons-hide-password' : 'ch-icons-show-password'
            "
          ></i
        ></cs-button>
      </div>
      <div class="password-form__input-pass">
        <cs-input
          v-model="confirmPassword"
          label="Confirm Password"
          required
          :type="confirmPasswordType"
          @input="checkMismatch"
        />
        <cs-button
          variant="default"
          fill="clear"
          size="small"
          class="password-form__hide-icon"
          @click="showConfirmPassword = !showConfirmPassword"
          ><i
            :class="
              showConfirmPassword
                ? 'ch-icons-hide-password'
                : 'ch-icons-show-password'
            "
          ></i
        ></cs-button>
      </div>
      <div class="password-form__requirements-info">
        <p class="password-form__requirements">Requirements</p>
        <p
          :class="
            has_minimum_lenth
              ? 'password-form__requirement_success'
              : 'password-form__requirement'
          "
        >
          <i class="cs-icons-check-success"></i> Must have a minimum of 8 and
          maximum of 20 characters
        </p>
        <p
          :class="
            has_number
              ? 'password-form__requirement_success'
              : 'password-form__requirement'
          "
        >
          <i class="cs-icons-check-success"></i> Must have at least one number
        </p>
        <p
          :class="
            has_lowercase
              ? 'password-form__requirement_success'
              : 'password-form__requirement'
          "
        >
          <i class="cs-icons-check-success"></i> Must contain one lowercase
          letter
        </p>
        <p
          :class="
            has_uppercase
              ? 'password-form__requirement_success'
              : 'password-form__requirement'
          "
        >
          <i class="cs-icons-check-success"></i> Must contain one uppercase
          letter
        </p>
        <p
          :class="
            has_special
              ? 'password-form__requirement_success'
              : 'password-form__requirement'
          "
        >
          <i class="cs-icons-check-success"></i> Must contain one special symbol
        </p>
        <p
          :class="
            !has_no_special
              ? 'password-form__requirement_success'
              : 'password-form__requirement'
          "
        >
          <i class="cs-icons-check-success"></i> Must not contain >, &lt; and ?
          special symbol
        </p>
        <p
          :class="
            has_match_password
              ? 'password-form__requirement_success'
              : 'password-form__requirement'
          "
        >
          <i class="cs-icons-check-success"></i> Password doesn't match with
          Confirm Password
        </p>
      </div>
      <div class="continue-button-container">
        <vue-recaptcha
          ref="recaptcha"
          size="invisible"
          :sitekey="sitekey"
          @verify="continueToPhonePage"
          @expired="onCaptchaExpired"
        >
          <cs-button size="large" variant="primary" :disabled="!valid">
            Continue
          </cs-button>
        </vue-recaptcha>
      </div>
      <div v-if="!isMeeting" class="password-form__back-button__container">
        <div class="password-form__backbutton">
          <div class="password-form__back">
            <cs-button
              fill="clear"
              to="usernameform"
              class="password-form__back-button"
            >
              Back
            </cs-button>
          </div>
          <div class="password-form__backtologin">
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
  </div>
</template>

<script>
import AppFinalForm from '@/components/onboarding/FinalForm.vue';
import { VueRecaptcha } from 'vue-recaptcha';
import { gReCaptchaSiteKey } from '@/constants';

export default {
  components: {
    AppFinalForm,
    VueRecaptcha,
  },
  props: {
    isMeeting: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      sitekey: gReCaptchaSiteKey,
      password: null,
      confirmPassword: null,
      showPassword: false,
      showConfirmPassword: false,
      has_minimum_lenth: false,
      has_number: false,
      has_lowercase: false,
      has_uppercase: false,
      has_special: false,
      has_match_password: false,
      has_no_special: true,
      showFinalForm: false,
      draftUser: {},
      token: null,
    };
  },
  computed: {
    passwordType() {
      if (this.showPassword === true) {
        return 'text';
      }
      return 'password';
    },
    confirmPasswordType() {
      if (this.showConfirmPassword === true) {
        return 'text';
      }
      return 'password';
    },
    pass_requirements() {
      if (
        this.has_special &&
        this.has_minimum_lenth &&
        this.has_lowercase &&
        this.has_uppercase &&
        this.has_number &&
        !this.has_no_special
      ) {
        return true;
      }
      return false;
    },
    valid() {
      return (
        !!this.password &&
        !!this.confirmPassword &&
        this.confirmPassword === this.password &&
        !!this.pass_requirements
      );
    },
  },
  methods: {
    validatePass(val) {
      this.has_minimum_lenth = val.length > 7 && val.length < 20;
      this.has_number = /\d/.test(val);
      this.has_lowercase = /[a-z]/.test(val);
      this.has_uppercase = /[A-Z]/.test(val);
      this.has_special = /[!@#$^&*)(+=._-]/.test(val);
      this.has_no_special = /[<?>)(]/.test(val);
      this.has_match_password =
        this.password === null || this.password === ''
          ? false
          : this.password === this.confirmPassword;
    },
    continueToPhonePage(recaptchaToken) {
      if (this.valid) this.setFinalData(recaptchaToken);
    },
    onCaptchaExpired() {
      this.$refs.recaptcha.reset();
    },
    checkMismatch() {
      this.has_match_password =
        this.password === null || this.password === ''
          ? false
          : this.password === this.confirmPassword;
    },
    async setFinalData(recaptchaToken = '') {
      this.draftUser.firstname = localStorage.draftUserFirstName;
      this.draftUser.lastname = localStorage.draftUserLastName;
      this.draftUser.email = localStorage.draftUserEmailAddress;
      this.draftUser.username = localStorage.draftusername;
      this.draftUser.displayname = localStorage.draftusername;
      this.draftUser.password = this.password;
      if (localStorage.draftUserFirstName) {
        localStorage.removeItem('draftUserFirstName');
      }
      if (localStorage.draftUserLastName) {
        localStorage.removeItem('draftUserLastName');
      }
      if (localStorage.draftUserEmailAddress) {
        localStorage.removeItem('draftUserEmailAddress');
      }
      if (localStorage.draftusername) {
        localStorage.removeItem('draftusername');
      }

      this.draftUser.recaptchaToken = recaptchaToken;

      console.log('Create User', this.draftUser);
      if (this.isMeeting) {
        this.$emit('show-final-form', this.draftUser);
      } else {
        this.showFinalForm = true;
      }
    },
  },
};
</script>

<style scoped>
.cs-input {
  width: 100%;
}

.password-form__requirements {
  margin-bottom: 0;
  color: var(--cs-gray-05);
  font-weight: bold;
}

.password-form__requirement i {
  margin-right: 3px;
}

.password-form__requirement {
  margin: 3px;
  color: var(--cs-gray-04);
}
.password-form__requirement_success {
  margin: 3px;
  color: var(--cs-success-base);
}
.password-form__requirements-info {
  margin-bottom: 20px;
}

.password-form__input-pass {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.password-form__hide-icon {
  position: absolute;
  right: 0;
  height: 50px;
  width: 70px !important;
  padding: 0px !important;
  margin: 0px !important;
  margin-top: 30px !important;
}
.password-form__hide-icon i {
  font-size: 22px !important;
}
.password-form__input-pass .cs-input__input {
  padding-right: 60px;
}
.password-form__backbutton {
  width: 100%;
  float: left;
}
.password-form__back {
  width: 50%;
  float: left;
}
.password-form__backtologin {
  width: 50%;
  float: right;
  text-align: right;
}
</style>
