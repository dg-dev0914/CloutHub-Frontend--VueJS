<template>
  <div class="login-form">
    <img class="logo" src="@/assets/images/clouthub-logo.png" />
    <div class="info">
      Please Login to Continue
      <p>
        Login with the same credentials that you entered during your
        registration.
      </p>
    </div>
    <login-form />
  </div>
</template>

<script>
import LoginForm from '@/components/onboarding/LoginForm.vue';

export default {
  components: {
    LoginForm,
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
  font: normal normal bold 22px/21px Roboto;
  text-align: left;
  color: var(--cs-gray-05);
}
.info p {
  width: 80%;
  margin-top: 10px;
  font: normal normal normal 16px/24px Roboto;
  color: var(--cs-gray-04);
}
</style>
