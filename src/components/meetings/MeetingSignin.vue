<template>
  <app-modal
    class="signup-meeting-modal"
    :show="showSignin"
    @close="onClose"
    title="Signin"
  >
    <app-login-form is-meeting @logged-in="loggedIn" />
  </app-modal>
</template>

<script>
import AppLoginForm from '@/components/onboarding/LoginForm.vue';
import AppModal from '@/components/general/Modal.vue';

export default {
  components: {
    AppLoginForm,
    AppModal,
  },
  props: {
    showSignin: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    onClose() {
      this.$emit('close-signin');
    },
    loggedIn() {
      this.$emit('logged-in');
      this.onClose();
    },
  },
};
</script>

<style scoped></style>
