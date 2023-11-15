<template lang="html">
  <app-modal :show="show" @close="$emit('close')" title="Change Password">
    <div class="change-pass-form" v-if="!saving">
      <div class="change-pass__fields">
        <app-password-input
          v-model="currentPassword"
          label="Enter Your Current Password"
          @input="currPass"
        />
        <app-password-input
          v-model="newPassword"
          label="Enter Your New Password"
        />
        <app-password-input
          v-model="confirmPassword"
          label="Confirm Your New Password"
        />
        <div v-if="errorMsg" class="ch-reset-pw__error">
          {{ errorMessage }}
        </div>
        <app-password-validator :password="newPassword" :confirm-password="confirmPassword" v-model="validPassword"/>
        <div class="change-pass-form__body-buttons">
          <cs-button
            class="cs-form__body-save-button"
            @click="onSave"
            :disabled="!validForm"
            >Save</cs-button
          >
        </div>
      </div>
    </div>
    <div v-else>
      <app-spinner />
    </div>
  </app-modal>
</template>

<script>
import ChangePassword from '@/gql/auth/ChangePassword.gql';
import AppModal from '@/components/general/Modal.vue';
import AppPasswordInput from '@/components/general/PasswordInput.vue';
import AppPasswordValidator from '@/components/general/PasswordValidator.vue';
import AppSpinner from '@/components/general/Spinner.vue';

export default {
  components: {
    AppModal,
    AppPasswordInput,
    AppPasswordValidator,
    AppSpinner,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      validPassword: false,
      errorMessage: '',
      errorMsg: false,
      saving: false,
    };
  },
  computed: {
    validForm() {
      return this.validPassword && this.currentPassword.length > 3;
    },
  },
  methods: {
    currPass() {
      this.errorMessage = '';
      this.errorMsg = false;
    },
    reset() {
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
    },
    async onSave() {
      this.errorMessage = '';
      this.errorMsg = false;
      this.saving = true;
      const currentPassword = this.currentPassword.trim();
      const newPassword = this.newPassword.trim();
      try {
        const response = await this.$apollo.mutate({
          mutation: ChangePassword,
          variables: {
            password: currentPassword,
            newPassword,
          },
        });
        if (response) {
          this.reset();
          this.$emit('close');
          this.$toast.open({
            message: 'Password changed',
            type: 'success',
            duration: 3000,
            dismissible: true,
            position: 'top',
          });
        }
      } catch (err) {
        this.errorMessage = err.message;
        this.errorMsg = true;
      }
      this.saving = false;
    },
  },
};
</script>

<style scoped>
.cs-form__body-save-button {
  margin-left: 20px;
  width: 150px;
}
.change-pass__fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0 auto;
}
.change-pass-form__body-buttons {
  text-align: right;
}
.ch-reset-pw__error {
  font-size: 16px;
  color: var(--cs-danger-base);
  width: 83%;
  margin: 0px;
}
</style>
