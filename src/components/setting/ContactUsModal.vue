<template lang="html">
  <app-modal :show="show" @close="$emit('close')" title="Contact Us">
    <div class="change-pass-form" v-if="contactResponse">
      <div class="change-pass-form__body">
        <div class="contact-us-form">
          <div class="contact-us-form__body">
            <p class="contact-us-form__body-info">
              Hello! How can we help you today?
            </p>
            <cs-radio-group
              :options="contactUsOptions"
              :value="subject"
              v-model="subject"
            />
            <app-textarea
              label="Message"
              placeholder="Enter your message here"
              v-model="message"
              required
              class="contact-us-form__body-text-area"
            />
            <div class="contact-us-form__body-buttons">
              <cs-button
                class="contact-us-form__body-send-button"
                :disabled="!message || !subject"
                @click="contactUs"
                >Send</cs-button
              >
            </div>
            <div class="mt-4">
              <cs-alert v-if="errMsg" variant="danger" :content="errMsg">
              </cs-alert>
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
import $popups from '@/services/popups';
import SendFeedback from '@/gql/general/SendFeedback.gql';
import AppModal from '@/components/general/Modal.vue';
import AppTextarea from '@/components/general/Textarea.vue';
import AppSpinner from '@/components/general/Spinner.vue';

export default {
  components: {
    AppModal,
    AppTextarea,
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
      contactUsOptions: [
        { label: 'Send Feedback', value: 'Feedback' },
        { label: 'Need Assistance', value: 'Need Assistance' },
      ],
      subject: 'Feedback',
      message: '',
      user: {},
      errMsg: null,
      contactResponse: true,
    };
  },
  mounted() {
    this.user = JSON.parse(localStorage.getItem('user'));
  },
  methods: {
    reset() {
      this.subject = '';
      this.message = '';
    },
    async contactUs() {
      this.contactResponse = false;
      try {
        await this.$apollo.mutate({
          mutation: SendFeedback,
          variables: {
            type: this.subject,
            message: this.message,
          },
        });
        $popups.alert('Thank you for your feedback. We will contact you soon.');
      } catch (e) {
        $popups.alert(e.message);
      }
      this.reset();
      this.contactResponse = true;
      this.$emit('close');
    },
  },
};
</script>

<style scoped>
.contact-us-form__header {
  border-bottom: 1px solid #e7e9f1;
  margin-bottom: 30px;
}
.contact-us-form__header-title {
  padding: 10px;
  margin: 0px;
  font: normal normal bold 16px/24px Roboto;
}
.contact-us-form__body-text-area {
  width: 100%;
  margin: 10px 0px 30px 0px;
}
.contact-us-form__body-send-button {
  margin-left: 20px;
  width: 150px;
}
.contact-us-form__body-cancel-button {
  --cs-button-color: #e6eaea !important;
  --cs-button-text-color: var(--gray-05) !important;
  --cs-button-color-hover: #b5c0c7 !important;
  --cs-button-text-color-hover: var(--gray-05) !important;
  width: 150px;
}
.contact-us-form__body-info {
  font: normal normal normal 16px/24px Roboto;
  color: #47535a;
}
.contact-us-form__body-buttons {
  float: right;
}
</style>
