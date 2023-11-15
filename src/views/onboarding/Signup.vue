<template>
  <div class="signup-form">
    <img class="logo" src="@/assets/images/clouthub-logo.png" />
    <div class="info">
      <div class="cs-textstyle-section-heading">Create your Account</div>
      <div class="cs-textstyle-paragraph">
        Enter your information below to create your account.
      </div>
    </div>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

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
.signup-form__back-button__container,
.email-form__back-button__container,
.username-form__back-button__container,
.password-form__back-button__container {
  display: flex !important;
  justify-content: space-between !important;
}
.signup-form__back-button,
.email-form__back-button,
.username-form__back-button,
.password-form__back-button {
  --cs-button-text-color: #47535a !important;
  --cs-button-text-color-hover: #47535a !important;
}
</style>
