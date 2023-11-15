<template>
  <app-modal
    :show="showUpdateModal"
    class="ch-update-modal"
    title="Update Your Email"
    @close="onClose"
  >
    <div class="update-email-container">
      <cs-input
        v-model="emailAddress"
        label="Email Address"
        required
        type="email"
        :disabled="verifying"
        placeholder="Enter your email address"
        class="update-email-ip"
      />
      <cs-input
        v-model="confirmEmailAddress"
        label="Confirm Email Address "
        required
        type="email"
        :disabled="verifying"
        placeholder="Enter confirm email address"
        class="update-email-ip"
      />
    </div>
    <div class="email-form__requirements-info">
      <p class="email-form__requirements">Requirements</p>
      <p
        :class="
          emailFormatError
            ? 'email-form__requirement'
            : 'email-form__requirement_success'
        "
      >
        <i class="cs-icons-check-success"></i> Valid email entered.
      </p>
      <p
        :class="
          isEmailMismatch
            ? 'email-form__requirement'
            : 'email-form__requirement_success'
        "
      >
        <i class="cs-icons-check-success"></i> Email matches with confirm email.
      </p>
    </div>
    <cs-button
      size="small"
      variant="primary"
      :disabled="!validEmail"
      @click="update"
    >
      Update Email
    </cs-button>
  </app-modal>
</template>

<script>
import $popups from '@/services/popups';
import AppModal from '@/components/general/Modal.vue';
import CheckUserEmail from '@/gql/onboarding/CheckUserEmail.gql';
import UpdateEmail from '@/gql/onboarding/UpdateEmail.gql';

export default {
  components: {
    AppModal,
  },
  props: {
    showUpdateModal: {
      type: Boolean,
      required: true,
      default: false,
    },
    username: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      emailAddress: null,
      confirmEmailAddress: null,
      verifying: false,
    };
  },
  computed: {
    emailFormatError() {
      const emailFormat =
        this.emailAddress === null || this.emailAddress === ''
          ? true
          : this.emailAddress &&
            !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(
              this.emailAddress
            );
      return emailFormat;
    },
    validEmail() {
      return (
        !!this.confirmEmailAddress &&
        !!this.emailAddress &&
        this.emailAddress === this.confirmEmailAddress &&
        !this.emailFormatError
      );
    },
    isEmailMismatch() {
      return this.emailAddress === null || this.emailAddress === ''
        ? true
        : this.emailAddress !== this.confirmEmailAddress;
    },
  },
  methods: {
    onClose(email) {
      this.$emit('close-update-modal', email);
    },
    async update() {
      if (this.validEmail) {
        this.verifying = true;
        try {
          await this.$apollo.query({
            query: CheckUserEmail,
            variables: {
              email: this.emailAddress,
            },
          });
          localStorage.draftUserEmailAddress = this.emailAddress;
          this.updateOldEmail();
        } catch (err) {
          $popups.alert(err.message);
        }
        this.verifying = false;
      }
    },
    async updateOldEmail() {
      const updated = this.$apollo.mutate({
        mutation: UpdateEmail,
        variables: {
          newEmail: this.emailAddress,
          username: this.username,
        },
      });
      if (updated) {
        this.onClose(this.emailAddress);
      }
    },
  },
};
</script>

<style scoped>
.update-email-container {
  display: flex;
  align-items: center;
  gap: 20px;
}
.update-email-ip {
  width: 250px;
}
.email-form__requirement i {
  margin-right: 3px;
}

.email-form__requirement {
  margin: 3px;
  color: var(--cs-gray-04);
}
.email-form__requirement_success {
  margin: 3px;
  color: var(--cs-success-base);
}
.email-form__requirements-info {
  margin-bottom: 20px;
}
.email-form__requirements {
  margin-bottom: 0;
  font-weight: bold;
  color: var(--cs-gray-05);
}
</style>
