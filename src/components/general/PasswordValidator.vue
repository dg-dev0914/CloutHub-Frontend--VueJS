<template>
  <div class="ch-password-validator">
    <div class="ch-password-validator__title cs-textstyle-paragraph">Password Requirements:</div>
    <app-validator-option :valid="has_length" label="Must have a minimum of 8 and maximum of 20 characters"/>
    <app-validator-option :valid="has_number" label="Must have at least one number"/>
    <app-validator-option :valid="has_lowercase" label="Must contain one lowercase letter"/>
    <app-validator-option :valid="has_uppercase" label="Must contain one uppercase letter"/>
    <app-validator-option :valid="has_special" label="Must contain one special symbol"/>
    <app-validator-option :valid="has_no_whitespace" label="Must not contain spaces"/>
    <app-validator-option v-if="use_confirm_password" :valid="has_match" label="Your new password and confirmed password must match"/>
  </div>
</template>

<script>
import AppValidatorOption from '@/components/general/ValidatorOption.vue';

export default {
  components: {
    AppValidatorOption,
  },
  props: {
    // Note: value is just used because it's nice to bind to v-model
    value: {
      type: Boolean,
    },
    password: {
      type: String,
      required: true,
    },
    confirmPassword: {
      type: String,
      default: null,
    },
  },
  computed: {
    has_length() {
      return this.password.length > 7 && this.password.length < 21;
    },
    has_special() {
      // Supports: ~`!@#$%^&*()_-+={[}]|\:;"'<,>.?/
      return /[-@#/[!$%^&*()_+|~=`{}\[\]\\:";'<>?,.\/]/g.test(this.password);
    },
    has_lowercase() {
      return /[a-z]/.test(this.password);
    },
    has_uppercase() {
      return /[A-Z]/.test(this.password);
    },
    has_number() {
      return /\d/.test(this.password);
    },
    has_no_whitespace() {
      return !/\s/.test(this.password);
    },
    has_match() {
      return this.password.length > 1 && this.password === this.confirmPassword;
    },
    use_confirm_password() {
      return this.confirmPassword !== null;
    },
    valid_password() {
      if (
        this.has_length
        && this.has_special
        && this.has_lowercase
        && this.has_uppercase
        && this.has_number
        && this.has_no_whitespace
      ) {
        if (this.use_confirm_password && !this.has_match) return false;
        return true;
      }
      return false;
    },
  },
  watch: {
    valid_password: {
      immediate: true,
      handler() {
        this.$emit('input', this.valid_password);
      },
    },
  },
};
</script>

<style scoped>
.ch-password-validator__title {
  color: var(--cs-gray-05);
  margin-bottom: 3px;
}
</style>
