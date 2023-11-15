<template>
  <div class="onboarding login-form" tabindex="0" @keyup.enter="process_enter_key">
    <app-spinner v-if="loading" />
    <div v-if="!loading">
      <cs-input
        v-model="email"
        label="Email"
        required
        type="email"
        placeholder="Enter your email address"
      />
      <div class="password-form__input-pass">
        <cs-input
          v-model="password"
          label="Password"
          required
          :type="passwordType"
          placeholder="Enter your password"
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
      <div v-if="!isMeeting" class="login-options">
        <cs-checkbox v-model="rememberUser" label="Remember Me" />
        <cs-button
          fill="clear"
          class="reset-password-button"
          to="/onboarding/resetpassword"
          >Forgot Password?
        </cs-button>
      </div>
      <div class="buttons login-buttons">
        <div class="login-button-container">
          <vue-recaptcha
            ref="recaptcha"
            size="invisible"
            :sitekey="sitekey"
            @verify="login"
            @expired="onCaptchaExpired"
          >
            <cs-button
              :size="size"
              variant="primary"
              :disabled="!email || !password"
              block
            >
              Login
            </cs-button>
          </vue-recaptcha>
        </div>
        <div v-if="!isMeeting" class="login-button-container">
          <cs-button
            :size="size"
            fill="outline"
            variant="primary"
            :to="signUp"
            block
          >
            Create New Account
          </cs-button>
        </div>
      </div>
      <div v-if="!isMeeting" class="login-links">
        <a :href="termsOfUseUrl" target="_blank">Terms of Use</a>
        |
        <a :href="privacyPolicyUrl" target="_blank">Privacy Policy</a>
        | <a href="/feedback.html" target="_blank">Report a Bug</a>
      </div>
      <cs-alert
        v-if="errMsg"
        class="cs-alert"
        variant="danger"
        :content="errMsg"
      ></cs-alert>
      <!-- OTP modal -->
      <app-verify-email-modal
        v-if="showVerifyModal"
        :show-verify-modal="showVerifyModal"
        :email="email"
        @close-verify-modal="closeVerifyModal"
      />
    </div>
  </div>
</template>

<script>
import Login from '@/gql/general/Login.gql';
import CheckEmailVerification from '@/gql/auth/CheckEmailVerification.gql';
import AppSpinner from '@/components/general/Spinner.vue';
import AppVerifyEmailModal from '@/components/onboarding/VerifyEmailModal.vue';
import { VueRecaptcha } from 'vue-recaptcha';
import { policyPagesUrls, gReCaptchaSiteKey } from '@/constants';

export default {
  components: {
    AppSpinner,
    AppVerifyEmailModal,
    VueRecaptcha,
  },
  props: {
    size: {
      type: String,
      default: 'medium',
    },
    isMeeting: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      sitekey: gReCaptchaSiteKey,
      email: localStorage.email,
      password: localStorage.password,
      errMsg: null,
      loading: false,
      rememberUser: !!localStorage.email,
      showOnLoad: false,
      showPassword: false,
      showVerifyModal: false,
      token: null,
      showNewPosts: false,
      ...policyPagesUrls,
    };
  },
  computed: {
    passwordType() {
      if (this.showPassword === true) {
        return 'text';
      }
      return 'password';
    },
    signUp() {
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
      return '/onboarding/signup/nameform';
    },
  },
  mounted() {
    if (this.$route.query.redirect) {
      localStorage.loginRedirect = this.$route.query.redirect;
    }
    this.queueNotice();
  },
  methods: {
    onCaptchaExpired() {
      this.$refs.recaptcha.reset();
    },
    queueNotice() {
      setTimeout(() => {
        this.showNewPosts = true;
      }, 15 * 1000);
    },
    process_enter_key(){
      this.$refs.recaptcha.execute();
      login();
    },
    async login(recaptchaToken) {
      this.errMsg = null;
      localStorage.clear();
      if (this.email && this.password) {
        if (this.rememberUser) {
          localStorage.email = this.email.trim();
          localStorage.password = this.password.trim();
        }
        try {
          console.log(recaptchaToken);
          this.loading = true;
          const resp = await this.$apollo.query({
            query: Login,
            variables: {
              email: this.email.trim(),
              password: this.password.trim(),
              recaptchaToken,
            },
          });
          this.token = resp.data.token;
          this.checkIfEmailVerified();
        } catch (err) {
          this.showOnLoad = true;
          this.errMsg = err.message;
          this.loading = false;
        }
      }
    },
    async checkIfEmailVerified(token) {
      const response = await this.$apollo.query({
        query: CheckEmailVerification,
        variables: {
          email: this.email.trim(),
        },
      });
      if (response.data.verified) {
        this.redirectToApp(token);
      } else {
        this.loading = false;
        this.showVerifyModal = true;
      }
    },
    async redirectToApp() {
      this.loading = true;
      localStorage.access_token = this.token;
      if (this.isMeeting) {
        this.$emit('logged-in');
      } else {
        const loggedInUrl =
          this.$route.query.redirect === undefined
            ? '/'
            : `#${this.$route.query.redirect}`;
        window.location.href = loggedInUrl;
        if (loggedInUrl !== '/') {
          window.location.reload();
        }
      }
    },
    closeVerifyModal(verified) {
      this.showVerifyModal = false;
      if (verified) {
        this.redirectToApp();
      }
    },
  },
};
</script>

<style scoped>
@media (max-width: 1200px) {
  .login-form .buttons {
    display: flex;
    margin-top: 30px;
    width: 100%;
  }

  .login-form .cs-button {
    width: 239px;
    margin-right: 10px;
    width: 100%;
  }
}

.cs-alert {
  width: 100%;
  margin-top: 20px;
}

.reset-password-button {
  width: 180px !important;
  padding: 0px !important;
}

.login-options {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.login-buttons {
  display: flex;
  gap: 20px;
}

.login-button-container {
  flex: 1;
}

.login-links {
  text-align: center;
  margin-top: 30px;
  color: var(--cs-gray-04);
}

.login-links a {
  margin-right: 10px;
  margin-left: 10px;
  font-weight: normal;
  font-size: 14px;
  color: var(--cs-gray-08);
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
</style>
