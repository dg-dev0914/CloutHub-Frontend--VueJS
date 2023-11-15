<template lang="html">
    <app-modal
      :show="show"
      @close="$emit('close')"
      title="Deleting Your CloutHub Account"
    >
      <div class="change-pass-form" v-if="deleteAccountResponse">
        <div class="change-pass-form__body">
          <div class="delete-user-form">
            <div class="delete-user-form__body">
              <p class="delete-user-form__body-info">
                <strong>This is permanent. <br /></strong> When you delete
                your CloutHub account, you won't be able to retrieve the
                content or information you've shared on CloutHub. It cannot be
                reactivated.
              </p>
              <app-password-input
                v-model="password"
                label="Enter your password to confirm"
              />
              <div v-if="errorMsg" class="cs-error-color">
                {{ errorMessage }}
              </div>
              <div class="delete-user-form__body-buttons mt-4">
                <cs-button
                  class="cs-form__body-send-button"
                  @click="deleteAccount()"
                  :disabled="!password"
                  >Delete Account</cs-button
                >
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <app-spinner />
      </div>
    </app-modal>
</template>

<script>
import DeleteAccount from '@/gql/auth/DeleteAccount.gql';
import AppModal from '@/components/general/Modal.vue';
import AppPasswordInput from '@/components/general/PasswordInput.vue';
import AppSpinner from '@/components/general/Spinner.vue';

export default {
  components: {
    AppModal,
    AppPasswordInput,
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
      password: '',
      deleteAccountResponse: true,
      errorMessage: '',
      errorMsg: false,
    };
  },
  methods: {
    async deleteAccount() {
      const currentPassword = this.password.trim();
      this.deleteAccountResponse = false;
      try {
        const response = await this.$apollo.mutate({
          mutation: DeleteAccount,
          variables: {
            password: currentPassword,
          },
        });
        if (response) {
          this.deleteAccountResponse = true;
          this.$emit('close');
        }
        localStorage.clear();
        window.location.href = '/';
      } catch (err) {
        setInterval(() => {
          this.deleteAccountResponse = true;
        }, 3000);
        this.errorMessage = err.message;
        this.errorMsg = true;
      }
    },
  },
};
</script>

<style scoped>
.cs-form__body-send-button {
  margin-left: 20px;
}
.cs-form__body-cancel-button {
  --cs-button-color: #e6eaea !important;
  --cs-button-text-color: var(--gray-05) !important;
  --cs-button-color-hover: #b5c0c7 !important;
  --cs-button-text-color-hover: var(--gray-05) !important;
  width: 150px;
}
.ch-blocked-members {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--cs-gray-00);
}
.ch-blocked-members__header >>> .cs-main-header {
  padding: 14px 20px;
  font-size: 20px;
  background-color: var(--cs-gray-00);
}

.ch-blocked-members__content {
  padding: 20px;
}
.ch-blocked-members__title {
  font-size: 14px;
  color: var(--cs-gray-05);
}
.ch-blocked-user {
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
.ch-blocked-users-info {
  display: flex;
  flex-direction: row;
  gap: 10px;
}
.ch-blocked-users-content {
  display: flex;
  flex-direction: column;
}
.ch-blocked-users-name {
  color: var(--cs-gray-05);
}
.ch-blocked-users-status {
  color: var(--cs-gray-04);
  font-size: 14px;
}
.delete-user-form__body-buttons {
  float: right;
}
.cs-error-color {
  color: var(--cs-danger-base);
}
</style>
