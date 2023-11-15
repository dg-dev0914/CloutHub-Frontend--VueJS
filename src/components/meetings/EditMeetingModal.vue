// TODO: Date and time doesn't work as expected
<template>
  <app-modal
    class="edit-meeting-modal"
    :show="show"
    title="Edit Event"
    @close="close()"
  >
    <cs-spinner v-if="saving" />
    <!-- Tabs  -->
    <cs-page-tabs v-if="!saving" align="justify">
      <!-- First Tab - Details  -->
      <cs-page-tab label="Details">
        <cs-form class="meeting-form">
          <b-row v-if="draftMeeting">
            <b-col class="meeting-form-column">
              <validation-observer
                ref="meetingPayment"
                tag="b-col"
                class="meeting-form-column"
              >
                <!-- Title -->
                <cs-input v-model="draftMeeting.name" label="Name"></cs-input>
                <!-- Category -->
                <cs-select
                  v-model="draftMeeting.category"
                  label="Category"
                  :options="categoryOptions"
                ></cs-select>
                <!-- Description -->
                <cs-textarea
                  v-model="draftMeeting.description"
                  label="Description"
                ></cs-textarea>
                <!-- Image -->
                <app-image-input
                  v-model="draftMeeting.picture"
                  :enforce-ratio="1 / 1"
                  label="Picture (required ratio 1 : 1)"
                />
                <div
                  v-if="hasPaymentId"
                  class="cs-textstyle-label-text date-label mt-3"
                >
                  Tickets
                </div>
                <cs-checkbox
                  v-if="hasPaymentId"
                  v-model="enableTickets"
                  @input="clearTicketPrice"
                >
                  Charge for access
                </cs-checkbox>
                <div v-if="enableTickets" class="meeting-payment">
                  <validation-provider
                    v-slot="{ errors }"
                    :rules="{ required: true, min_value: 1 }"
                  >
                    <cs-input
                      v-model="draftMeeting.ticketPrice"
                      class="input-size"
                      label="Ticket Price (USD)"
                      type="number"
                    >
                    </cs-input>
                    <div
                      v-if="errors[0]"
                      class="cs-textstyle-paragraph-small price-error"
                    >
                      The ticket price cannot be 0 or less than 0 or empty
                    </div>
                  </validation-provider>
                  <div class="meeting-referralCodes">
                    <div
                      v-for="(referralCode, index) in referralCodes"
                      :key="index"
                      class="meeting-referral-code"
                    >
                      <div class="cs-textstyle-label-text date-label mt-3">
                        Referral code #{{ index + 1 }}
                      </div>
                      <validation-provider
                        v-slot="{ errors }"
                        :rules="{ required: true }"
                      >
                        <cs-input
                          v-model="referralCodes[index].name"
                          class="mt-3 input-size"
                          label="Name"
                          type="text"
                        >
                        </cs-input>
                        <div
                          v-if="errors[0]"
                          class="cs-textstyle-paragraph-small price-error"
                        >
                          Referral code name is required
                        </div>
                      </validation-provider>
                      <validation-provider
                        v-slot="{ errors }"
                        :rules="{
                          required: true,
                          min_value: 1,
                          max_value:
                            referralCodes[index].type === 'USD'
                              ? draftMeeting.ticketPrice
                              : 100,
                        }"
                      >
                        <cs-input
                          v-model="referralCodes[index].amount"
                          class="mt-3 input-size"
                          :label="`Discount in ${referralCodes[index].type}`"
                          type="number"
                        >
                        </cs-input>
                        <div
                          v-if="errors[0]"
                          class="cs-textstyle-paragraph-small price-error"
                        >
                          Discount is required and it should be lower than
                          Ticket price
                        </div>
                      </validation-provider>
                      <div class="meeting-referral-code__footer">
                        <app-toggle
                          label-checked="Return to USD"
                          label-unchecked="Switch to %"
                          :value="referralCodes[index].type === '%'"
                          @change="changeReferralCodeType($event, index)"
                        ></app-toggle>
                        <cs-button
                          v-b-tooltip.hover
                          title="Delete ReferralCode"
                          @click="areYouSure(index)"
                        >
                          <i class="cs-icons-delete"></i> #{{ index + 1 }}
                        </cs-button>
                      </div>
                    </div>
                  </div>
                  <cs-button
                    class="mt-5 input-size"
                    @click="addNewReferralCode"
                  >
                    <i class="cs-icons-plus"></i> Referral code
                  </cs-button>
                  <app-popup
                    :show="showDeleteReferralCodeModal"
                    type="confirm"
                    variant="danger"
                    ok-label="Delete"
                    :title="`Delete Referral code #${
                      referralCodeDeleteIndex + 1
                    }`"
                    message="Are you sure you wish to delete this referral code?"
                    @close="showDeleteReferralCodeModal = false"
                    @ok="deleteReferralCode"
                  />
                </div>
              </validation-observer>
            </b-col>
            <b-col class="meeting-form-column">
              <div>
                <cs-date-input
                  v-model="startDate"
                  class="datetime-input"
                  label="Start Date"
                ></cs-date-input>
                <cs-time-input
                  v-model="startTime"
                  class="datetime-input"
                  label="Start Time"
                ></cs-time-input>
              </div>
              <!-- Enable Queue -->
              <cs-radio-group
                v-model="draftMeeting.enableQueue"
                label="Allow audience to raise hand?"
                :options="enableQueueOption"
              />
              <cs-radio-group
                v-model="draftMeeting.liveStreamMode"
                label="How You want to livestream?"
                :options="liveStreamModeOptions"
              />
              <!-- slug -->
              <app-slug-input
                :slug="originalMeeting.slug"
                :name="draftMeeting.name"
                slug-type="MEETING"
                @slugInput="handleSlugInput"
                @slugChecking="slugLoading = true"
              />
            </b-col>
          </b-row>
        </cs-form>
      </cs-page-tab>
      <!-- Second Tab - Custom Buttons  -->
      <cs-page-tab label="Custom Buttons">
        <div class="cs-textstyle-paragraph-small info-text custom-button-text">
          Edit your custom buttons
        </div>
        <b-row>
          <b-col>
            <cs-input
              v-model="button1Label"
              class="input-size"
              label="Button 1 Label"
              placeholder="e.g. My First Button"
            />
          </b-col>
          <b-col>
            <cs-input
              v-model="button1Link"
              class="input-size"
              label="Button 1 Link"
              placeholder="e.g. https://example.com/"
            />
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <cs-input
              v-model="button2Label"
              class="input-size"
              label="Button 2 Label"
              placeholder="e.g. My Second Button"
            />
          </b-col>
          <b-col>
            <cs-input
              v-model="button2Link"
              class="input-size"
              label="Button 2 Link"
              placeholder="e.g. https://example.com/"
            />
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <cs-input
              v-model="button3Label"
              class="input-size"
              label="Button 3 Label"
              placeholder="e.g. My Third Button"
            />
          </b-col>
          <b-col>
            <cs-input
              v-model="button3Link"
              class="input-size"
              label="Button 3 Link"
              placeholder="e.g. https://example.com/"
            />
          </b-col>
        </b-row>
      </cs-page-tab>
    </cs-page-tabs>
    <div v-if="draftMeeting" slot="footer">
      <cs-button
        :disabled="saving || !draftMeeting.name || slugLoading"
        @click="saveChanges()"
        >Save Changes</cs-button
      >
    </div>
  </app-modal>
</template>
<script>
import { ValidationProvider, ValidationObserver } from 'vee-validate';
import $meetingsApi from '@/api/meetings';
import meetingcategories from '@/assets/config/meetingcategories.json';
import UpdateMeeting from '@/gql/meetings/UpdateMeeting.gql';
import AppModal from '@/components/general/Modal.vue';
import AppImageInput from '@/components/general/ImageInput.vue';
import AppPopup from '@/components/general/Popup.vue';
import $aws from '@/services/aws';
import $socket from '@/services/socket';
import AppSlugInput from '@/components/general/SlugInput.vue';
import $auth from '@/services/auth';
import AppToggle from '@/components/general/CsToggle.vue';

export default {
  components: {
    AppModal,
    AppImageInput,
    AppSlugInput,
    AppPopup,
    ValidationProvider,
    ValidationObserver,
    AppToggle,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    originalMeeting: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      referralCodeDeleteIndex: null,
      showDeleteReferralCodeModal: false,
      draftMeeting: null,
      privacyOptions: [
        { label: 'Public', value: 'public' },
        { label: 'Private', value: 'private' },
      ],
      enableQueueOption: [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' },
      ],
      liveStreamModeOptions: [
        { label: 'CloutHub', value: 'false' },
        { label: 'External Software', value: 'true' },
      ],
      hasPaymentId: false,
      categoryOptions: meetingcategories,
      value: 'Start Now',
      saving: false,
      startDate: null,
      startTime: null,
      formattedDate: null,
      isPrivate: false,
      button1Label: null,
      button2Label: null,
      button3Label: null,
      button1Link: null,
      button2Link: null,
      button3Link: null,
      priceError: false,
      buttons: [],
      slugLoading: false,
      enableTickets: false,
      referralCodes: [],
    };
  },
  async mounted() {
    const user = await $auth.getUser();
    if (user.enablePayments) this.hasPaymentId = true;
    this.button3Label =
      this.originalMeeting.buttons && this.originalMeeting.buttons[2]
        ? this.originalMeeting.buttons[2].label
        : '';
    this.button2Label =
      this.originalMeeting.buttons && this.originalMeeting.buttons[1]
        ? this.originalMeeting.buttons[1].label
        : '';
    this.button1Label =
      this.originalMeeting.buttons && this.originalMeeting.buttons[0]
        ? this.originalMeeting.buttons[0].label
        : '';
    this.button3Link =
      this.originalMeeting.buttons && this.originalMeeting.buttons[2]
        ? this.originalMeeting.buttons[2].link
        : '';
    this.button2Link =
      this.originalMeeting.buttons && this.originalMeeting.buttons[1]
        ? this.originalMeeting.buttons[1].link
        : '';
    this.button1Link =
      this.originalMeeting.buttons && this.originalMeeting.buttons[0]
        ? this.originalMeeting.buttons[0].link
        : '';

    this.draftMeeting = {
      ...this.originalMeeting,
      ticketPrice: this.originalMeeting.ticketPrice
        ? this.originalMeeting.ticketPrice
        : 0,
      enableQueue: this.originalMeeting.enableQueue ? 'true' : 'false',
      liveStreamMode: this.originalMeeting.liveStreamMode ? 'true' : 'false',
    };

    this.referralCodes = this.originalMeeting.referralCodes.map(
      ({ __typename, ...rest }) => {
        if (Number.isInteger(Number(rest.amount)))
          rest.amount = Math.trunc(Number(rest.amount)).toString();
        return rest;
      }
    );

    this.enableTickets = this.originalMeeting.ticketPrice;

    const currentStartTime = new Date(this.originalMeeting.startTime);
    // this.startDate = `${currentStartTime.getFullYear()}-${currentStartTime.getMonth()}-${currentStartTime.getDate()}`;
    this.startDate = this.originalMeeting.startTime;
    this.startTime = currentStartTime;
  },
  methods: {
    areYouSure(index) {
      this.referralCodeDeleteIndex = index;
      this.showDeleteReferralCodeModal = true;
    },
    async deleteReferralCode() {
      const index = this.referralCodeDeleteIndex;
      this.showDeleteReferralCodeModal = false;
      await $meetingsApi.deleteReferralCode(
        this.referralCodes[index].id,
        this.originalMeeting
      );
      this.referralCodes.splice(index, 1);
    },
    changeReferralCodeType({ value }, index) {
      this.referralCodes[index].type = value ? '%' : 'USD';
    },
    async addNewReferralCode() {
      const valid = await this.$refs.meetingPayment.validate();
      if (!valid) return;
      this.referralCodes.push({
        name: '',
        amount: '',
        type: 'USD',
      });
    },
    handleSlugInput(slug) {
      this.draftMeeting.slug = slug;
      this.slugLoading = false;
    },
    async saveChanges() {
      const valid = await this.$refs.meetingPayment.validate();
      if (!valid) return;
      this.saving = true;
      this.priceError = false;
      if (this.button1Label || this.button1Link) {
        const link =
          this.button1Link &&
          this.button1Link.split('').slice(0, 4).join('') === 'http'
            ? `${this.button1Link}`
            : this.button1Link === '' ||
              this.button1Link === null ||
              this.button1Link.value === 0
            ? null
            : `http://${this.button1Link}`;
        this.buttons = [{ label: this.button1Label, link }];
      }
      if (this.button2Label || this.button2Link) {
        const link =
          this.button2Link &&
          this.button2Link.split('').slice(0, 4).join('') === 'http'
            ? `${this.button2Link}`
            : this.button2Link === '' ||
              this.button2Link === null ||
              this.button2Link.value === 0
            ? null
            : `http://${this.button2Link}`;
        this.buttons = [...this.buttons, { label: this.button2Label, link }];
      }
      if (this.button3Label || this.button3Link) {
        const link =
          this.button3Link &&
          this.button3Link.split('').slice(0, 4).join('') === 'http'
            ? `${this.button3Link}`
            : this.button3Link === '' ||
              this.button3Link === null ||
              this.button3Link.value === 0
            ? null
            : `http://${this.button3Link}`;
        this.buttons = [...this.buttons, { label: this.button3Label, link }];
      }
      let finalTime;
      if (this.startDate.split(':').length > 1) {
        finalTime = new Date(this.startDate);
      } else {
        finalTime = new Date(this.startDate.replace(/-/g, '/'));
      }
      if (typeof this.startTime === 'string') {
        finalTime.setHours(this.startTime.split(':')[0]);
        finalTime.setMinutes(this.startTime.split(':')[1]);
      } else {
        finalTime.setHours(this.startTime.getHours());
        finalTime.setMinutes(this.startTime.getMinutes());
      }
      if (
        this.draftMeeting.picture &&
        this.draftMeeting.picture !== this.originalMeeting.picture
      ) {
        this.draftMeeting.picture = await $aws.uploadFile(
          this.draftMeeting.picture,
          'forum'
        );
      }
      const mutationVar = {
        id: this.draftMeeting.id,
        name: this.draftMeeting.name,
        description: this.draftMeeting.description,
        picture: this.draftMeeting.picture,
        category: this.draftMeeting.category,
        privacy: this.draftMeeting.privacy,
        startTime: finalTime, // this.formattedDate ? this.formattedDate : new Date(),
        endTime: this.draftMeeting.endTime,
        buttons: this.buttons,
        slug: this.draftMeeting.slug,
        parentMeetingId: this.draftMeeting.parentMeetingId,
        enableQueue: this.draftMeeting.enableQueue === 'true',
        liveStreamMode: this.draftMeeting.liveStreamMode === 'true',
      };
      if (this.hasPaymentId) {
        mutationVar.ticketPrice = parseFloat(this.draftMeeting.ticketPrice);
        mutationVar.referralCodes = this.referralCodes;
      }

      await this.$apollo.mutate({
        mutation: UpdateMeeting,
        variables: mutationVar,
      });
      this.formattedDate = null;
      this.buttons = [];
      this.saving = false;
      this.close();
      $socket.sendRoom('meeting', this.draftMeeting.id, 'meeting-edited');
    },
    close() {
      this.$emit('close');
    },
    clearTicketPrice() {
      this.draftMeeting.ticketPrice = 0;
    },
  },
};
</script>
<style scoped>
.ch-create-meeting >>> .cs-modal__footer {
  display: none;
}
.ch-create-meeting__body {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.ch-create-meeting__footer {
  text-align: right;
}
.meeting-form {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.date-label {
  color: var(--cs-gray-05);
}
.start-input {
  display: flex;
  gap: 20px;
}
.datetime-input {
  flex: 1;
}
.info-text {
  color: var(--cs-gray-05);
}
.meeting-form >>> .cs-radio-group {
  display: flex;
  flex-direction: row;
  gap: 20px;
}
.checkbox {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
}
input[type='checkbox'] {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  border: 1px solid var(--cs-primary-base);
  position: relative;
  -moz-appearance: none;
  -webkit-appearance: none;
  appearance: none;
  background: white;
}
input[type='checkbox']:checked {
  background: white;
}
input[type='checkbox']:checked:after {
  content: '';
  position: absolute;
  width: 15px;
  height: 8px;
  background: rgba(0, 0, 0, 0);
  top: 3px;
  left: 2px;
  border: 2px solid var(--cs-primary-base);
  border-top: none;
  border-right: none;
  -webkit-transform: rotate(-45deg);
  -moz-transform: rotate(-45deg);
  -o-transform: rotate(-45deg);
  -ms-transform: rotate(-45deg);
  transform: rotate(-45deg);
}
.meeting-form-column {
  display: flex;
  flex-direction: column;
}
.custom-button-text {
  margin-bottom: 10px;
}
.input-size {
  width: 100%;
  margin-top: 5px;
}
.edit-meeting-modal >>> .ch-modal__body {
  padding: 1px 0px !important;
}
* >>> .cs-page-tabs__content {
  padding: 0 15px;
}
.price-error {
  color: var(--cs-danger-base);
  margin-top: -20px;
}

.meeting-referral-code__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
