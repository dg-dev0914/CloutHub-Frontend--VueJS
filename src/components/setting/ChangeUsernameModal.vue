<template lang="html">
  <app-modal :show="show" title="Change Username" @close="$emit('close')">
    <div v-if="!saving" class="change-username-form">
      <div v-if="errorMessage" class="change-username-form__error">
        {{ errorMessage }}
      </div>

      <div v-if="user" class="change-username__fields">
        <!-- Username -->
        <app-username-editor
          :name="username"
          :user="user"
          @send="updateUsername"
        ></app-username-editor>

        <div class="change-username-form__body-buttons">
          <cs-button
            v-if="user.badgeType == null || user.badgeType == 'none'"
            class="cs-form__body-save-button"
            :disabled="!validForm"
            @click="onSave"
            >Save</cs-button
          >
        </div>
      </div>
    </div>
    <div v-else>
      <cs-spinner />
    </div>
  </app-modal>
</template>

<script>
import $auth from '@/services/auth';
import GetProfile from '@/gql/general/GetProfile.gql';
import UpdateUser from '@/gql/general/UpdateUserExample.gql';
import AppModal from '@/components/general/Modal.vue';
import AppUsernameEditor from '@/components/connections/editor/UsernameEditor.vue';

export default {
  components: {
    AppModal,
    AppUsernameEditor,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  apollo: {
    user: {
      query: GetProfile,
      variables() {
        return {
          id: $auth.getUserId(),
        };
      },
    },
  },
  data() {
    return {
      username: '',
      validForm: false,
      saving: false,
      errorMessage: '',
    };
  },
  methods: {
    updateUsername(val) {
      this.username = val.username;
      this.validForm = val.valid;
    },
    async onSave() {
      this.errorMessage = '';
      this.saving = true;

      try {
        const variables = {
          username: this.username,
        };
        const response = await this.$apollo.mutate({
          mutation: UpdateUser,
          variables: {
            username: this.username,
          },
          optimisticResponse: {
            update_user: {
              __typename: 'User',
              id: $auth.getUserId(),
              username: this.username,
            },
          },
        });
        if (response) {
          this.$emit('close');
          this.$toast.open({
            message: 'Username changed',
            type: 'success',
            duration: 3000,
            dismissible: true,
            position: 'top',
          });
        }
      } catch (err) {
        this.errorMessage = err.message;
      }
      this.saving = false;
    },
  },
};
</script>

<style scoped>
.cs-form__body-save-button {
  width: 150px;
}
.change-username__fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0 auto;
}
.change-username-form__body-buttons {
  text-align: right;
}
.change-username-form__error {
  font-size: 16px;
  color: var(--cs-danger-base);
  width: 83%;
  margin: 0px;
}
</style>
