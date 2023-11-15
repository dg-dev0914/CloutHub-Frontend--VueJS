<template lang="html">
  <app-form-modal :show="show" @close="$emit('close')" title="Request Verification" :saving="saving">
    <div class="request-verification-form">
      <div class="mb-4">
        <div class="ch-notifcations__apply cs-textstyle-paragraph">
          Please select the verification you require and upload a photo to confirm your identity
        </div>
      </div>
      <div class="request-verification__fields">
        <div class="">
          <cs-radio-group
            :options="badgeTypeOptions"
            v-model="requestedBadgeType"
          ></cs-radio-group>
        </div>
        <app-image-input label="Upload Picture" v-model="verificationFile" />
        <p>Please ensure that your face and ID are visible in the photo.</p>
        <div class="verification-images">
          <img class="verification-good" src="@/assets/images/verification/verification_good.png" alt="">
          <img class="verification-bad" src="@/assets/images/verification/verification_bad.png" alt="">
        </div>
      </div>
    </div>
    <div slot="footer" class="request-verification-form__body-buttons">
      <cs-button
        class="cs-form__body-save-button"
        @click="onSave"
        :disabled="!validForm"
        >Verify</cs-button
      >
    </div>
  </app-form-modal>
</template>
<script>
import $aws from '@/services/aws';
import $popups from '@/services/popups';

import RequestVerification from '@/gql/auth/RequestVerification.gql';

import AppFormModal from '@/components/general/FormModal.vue';
import AppImageInput from '@/components/general/ImageInput.vue';

export default {
  components: {
    AppFormModal,
    AppImageInput,
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
      requestedBadgeType: null,
      verificationFile: null,
      badgeTypeOptions: [
        {
          label: 'Verified',
          value: 'user',
        },
        {
          label: 'Influencer',
          value: 'influencer',
        },
      ],
    };
  },
  computed: {
    validForm() {
      return this.requestedBadgeType && this.verificationFile;
    },
  },
  methods: {
    reset() {
      this.requestedBadgeType = null;
      this.verificationFile = null;
    },
    async onSave() {
      this.saving = true;
      let verificationUrl = '';
      try {
        verificationUrl = await $aws.uploadFile(this.verificationFile);
      } catch (e) {
        this.saving = false;
        return $popups.alert('Error uploading the verification image');
      }
      try {
        const response = await this.$apollo.mutate({
          mutation: RequestVerification,
          variables: {
            requestedBadgeType: this.requestedBadgeType,
            verificationUrl,
          },
        });
        if (response) {
          this.reset();
          this.$emit('close');
          this.$toast.open({
            message: 'Verification in progress',
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
.request-verification__fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0 auto;
}
.request-verification-form__body-buttons {
  text-align: right;
}
.ch-reset-pw__error {
  font-size: 16px;
  color: var(--cs-danger-base);
  width: 83%;
  margin: 0px;
}
.verification-images
{

}
.verification-images img
{
  height: 100px;
  border: solid 3px white;
}
.verification-good
{
  border: solid 3px green;
}
.verification-bad
{
  border: solid 3px red;
}
</style>
