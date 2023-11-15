<template lang="html">
  <app-modal :show="show" @close="$emit('close')" title="Change Email">
    <div class="mb-4">
      <div class="ch-notifcations__apply  font-weight-bold">
        You will use this new email address for logging in
      </div>
    </div>
    <div class="change-email-form" v-if="!saving">
      <div class="change-email__fields">
        <cs-input type="email" v-model="email" label="New Email Address" />
        <cs-input
          type="email"
          v-model="confirmEmail"
          label="Confirm Email Address"
        />
        <div class="change-email-form__body-buttons">
          <cs-button
            class="cs-form__body-save-button"
            @click="checkEmail"
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
import $popups from '@/services/popups';
import CheckUserEmail from '@/gql/onboarding/CheckUserEmail.gql';
import ChangeEmail from '@/gql/auth/ChangeEmail.gql';
import AppModal from '@/components/general/Modal.vue';
import AppSpinner from '@/components/general/Spinner.vue';

export default {
  components: {
    AppModal,
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
      saving: false,
      email: '',
      confirmEmail: '',
    };
  },
  computed: {
    validForm() {
      return this.email && this.email === this.confirmEmail;
    },
  },
  methods: {
    reset() {
      this.email = '';
      this.confirmEmail = '';
    },
    async checkEmail() {
      try {
        await this.$apollo.query({
          query: CheckUserEmail,
          variables: {
            email: this.email,
          },
        });
        this.onSave();
      } catch (err) {
        this.reset();
        $popups.alert(err.message);
      }
    },
    async onSave() {
      this.saving = true;
      try {
        const response = await this.$apollo.mutate({
          mutation: ChangeEmail,
          variables: {
            newEmail: this.email,
          },
        });
        if (response) {
          this.reset();
          this.$emit('close');
          this.$toast.open({
            message: 'Email changed',
            type: 'success',
            duration: 3000,
            dismissible: true,
            position: 'top',
          });
        }
      } catch (err) {
        $popups.alert(err.message);
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
.change-email__fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0 auto;
}
.change-email-form__body-buttons {
  text-align: right;
}
.ch-reset-pw__error {
  font-size: 16px;
  color: var(--cs-danger-base);
  width: 83%;
  margin: 0px;
}
</style>
