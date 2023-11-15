<template>
  <app-modal
    class="signup-meeting-modal"
    :show="showSignup"
    @close="onClose"
    title="Signup"
  >
    <cs-form class="meeting-form">
      <div class="name_form" v-if="showName">
        <app-name-form is-meeting @show-email="showEmailForm" />
      </div>
      <div class="email_form" v-if="showEmail">
        <app-email-form is-meeting @show-username="showUserName" />
      </div>
      <div class="username_form" v-if="showUsername">
        <app-username-form is-meeting @show-password="showPW" />
      </div>
      <div class="password_form" v-if="showPassword">
        <app-password-form is-meeting @show-final-form="showFinalForm" />
      </div>
      <div class="password_form" v-if="showfinal">
        <app-final-form
          is-meeting
          @done="accountCreated"
          :draftUser="draftUser"
        />
      </div>
    </cs-form>
  </app-modal>
</template>

<script>
import AppModal from '@/components/general/Modal.vue';
import AppNameForm from '@/components/onboarding/NameForm.vue';
import AppEmailForm from '@/components/onboarding/EmailForm.vue';
import AppUsernameForm from '@/components/onboarding/UsernameForm.vue';
import AppPasswordForm from '@/components/onboarding/PasswordForm.vue';
import AppFinalForm from '@/components/onboarding/FinalForm.vue';

export default {
  components: {
    AppModal,
    AppNameForm,
    AppEmailForm,
    AppUsernameForm,
    AppPasswordForm,
    AppFinalForm,
  },
  props: {
    showSignup: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showName: true,
      showEmail: false,
      showPassword: false,
      showUsername: false,
      showfinal: false,
      draftUser: null,
    };
  },
  computed: {},
  methods: {
    onClose() {
      this.$emit('close-signup');
    },
    showEmailForm() {
      this.showName = false;
      this.showEmail = true;
      this.showPassword = false;
      this.showUsername = false;
      this.showfinal = false;
    },
    showUserName() {
      this.showName = false;
      this.showEmail = false;
      this.showPassword = false;
      this.showUsername = true;
      this.showfinal = false;
    },
    showPW() {
      this.showName = false;
      this.showEmail = false;
      this.showPassword = true;
      this.showUsername = false;
      this.showfinal = false;
    },
    showFinalForm(user) {
      console.log('UserInfo', user);
      this.draftUser = user;
      this.showName = false;
      this.showEmail = false;
      this.showPassword = false;
      this.showUsername = false;
      this.showfinal = true;
    },
    accountCreated() {
      this.$emit('account-created');
      this.onClose();
    },
  },
};
</script>

<style scoped>
.meeting-form {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
}
</style>
