<template>
  <app-modal
    class="create-meeting-modal"
    :show="show"
    :title="parentMeeting ? 'Create Breakout' : 'Create Event'"
    @close="$emit('close')"
  >
    <div v-if="saving" class="progress-indicator">
      <app-spinner />
      <app-aws-progress />
    </div>
    <!-- Tabs  -->
    <cs-page-tabs v-if="!saving" align="justify">
      <!-- First Tab - Details  -->
      <cs-page-tab label="Details">
        <cs-form class="meeting-form">
          <!-- Title -->
          <b-row>
            <validation-observer
              ref="meetingPayment"
              tag="b-col"
              class="meeting-form-column"
            >
              <cs-input v-model="draftMeeting.name" label="Name"></cs-input>
              <!-- Category -->
              <cs-select
                v-model="draftMeeting.category"
                label="Category"
                :options="categoryOptions"
              >
              </cs-select>
              <!-- Description -->
              <cs-textarea
                v-model="draftMeeting.description"
                label="Description"
              ></cs-textarea>
              <!-- Cover Image -->
              <app-image-input
                v-model="draftMeeting.picture"
                :enforce-ratio="1 / 1"
                label="Picture (required ratio 1 : 1)"
              />
              <!-- Tickets -->
              <div
                v-if="hasPaymentId"
                class="cs-textstyle-label-text date-label mt-3"
              >
                Tickets
              </div>
              <cs-checkbox v-if="hasPaymentId" v-model="enableTickets">
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
                <div>
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
                        Discount is required and it should be lower than Ticket
                        price
                      </div>
                    </validation-provider>
                    <div class="meeting-referral-code__footer">
                      <app-toggle
                        label-checked="Return to USD"
                        label-unchecked="Switch to %"
                        @change="changeReferralCodeType($event, index)"
                      ></app-toggle>
                      <cs-button
                        v-b-tooltip.hover
                        title="Delete ReferralCode"
                        @click="deleteReferralCode(index)"
                      >
                        <i class="cs-icons-delete"></i> #{{ index + 1 }}
                      </cs-button>
                    </div>
                  </div>
                </div>
                <cs-button class="mt-5 input-size" @click="addNewReferralCode">
                  <i class="cs-icons-plus"></i> Referral code
                </cs-button>
              </div>
            </validation-observer>
            <b-col class="meeting-form-column">
              <!-- Event Start/End date -->
              <label class="cs-textstyle-label-text date-label mt-3"
                >Meeting Date</label
              >
              <cs-radio-group
                :options="dateOptions"
                :value="value"
                @input="selectDateOption"
              />
              <div v-if="!startsImmediately" class="start-input">
                <cs-date-input
                  v-model="draftMeeting.startDate"
                  class="datetime-input"
                  label="Start Date"
                ></cs-date-input>
                <cs-time-input
                  v-model="draftMeeting.startTime"
                  class="datetime-input"
                  label="Start Time"
                ></cs-time-input>
              </div>
              <!-- Privacy -->
              <cs-radio-group
                v-model="draftMeeting.enableQueue"
                label="Allow audience to raise hand?"
                :options="enableQueueOption"
              />
              <cs-radio-group
                v-model="draftMeeting.privacy"
                label="Who can view and attend?"
                :options="privacyOptions"
              />
              <cs-radio-group
                v-model="draftMeeting.liveStreamMode"
                label="Where do you want to host speakers?"
                :options="liveStreamModeOptions"
              />
              <!-- slug -->
              <app-slug-input
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
          You can add up to 3 custom buttons to your meeting, to help attendees
          discover your other content
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
    <div slot="footer" class="ch-create-meeting__footer">
      <cs-button
        :disabled="saving || !draftMeeting.name || slugLoading"
        @click="createMeeting()"
      >
        {{ parentMeeting ? 'Create Breakout' : 'Create Meeting' }}
      </cs-button>
    </div>
  </app-modal>
</template>

<script>
import { ValidationProvider, ValidationObserver } from 'vee-validate';
import meetingcategories from '@/assets/config/meetingcategories.json';
import $upload from '@/services/upload';
import $socket from '@/services/socket';
import InsertMeeting from '@/gql/meetings/InsertMeeting.gql';
import AppModal from '@/components/general/Modal.vue';
import AppSpinner from '@/components/general/Spinner.vue';
import AppImageInput from '@/components/general/ImageInput.vue';
import AppAwsProgress from '@/components/general/AwsProgress.vue';
import AppSlugInput from '@/components/general/SlugInput.vue';
import AppToggle from '@/components/general/CsToggle.vue';

export default {
  components: {
    AppModal,
    AppImageInput,
    AppAwsProgress,
    AppSpinner,
    AppSlugInput,
    ValidationProvider,
    ValidationObserver,
    AppToggle,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    parentMeeting: {
      type: Object,
      required: false,
    },
    hasPaymentId: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tempDate = tomorrow.toISOString().split('T')[0];
    return {
      enableTickets: false,
      draftMeeting: {
        startDate: tempDate.replace(/-/g, '/'),
        startTime: '12:00:00',
        privacy: 'public',
        enableQueue: 'true',
        ticketPrice: 0,
        liveStreamMode: 'false',
      },
      privacyOptions: [
        { label: 'Anyone', value: 'public' },
        { label: 'Only people invited by hosts', value: 'private' },
      ],
      liveStreamModeOptions: [
        { label: 'CloutHub', value: 'false' },
        { label: 'External Software', value: 'true' },
      ],
      enableQueueOption: [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' },
      ],
      categoryOptions: meetingcategories,
      startsImmediately: true,
      saving: false,
      dateOptions: ['Start Now', 'Start Later'],
      value: 'Start Now',
      formattedDate: null,
      button1Label: null,
      button1Link: null,
      button2Label: null,
      button2Link: null,
      button3Label: null,
      button3Link: null,
      buttons: [],
      priceError: false,
      slugLoading: false,
      referralCodes: [],
    };
  },
  computed: {
    defaultMeetingPicture() {
      if (this.draftMeeting.category === 'news')
        return 'https://chforum.backendcdn.com/us-west-2:1323b126-2579-4eba-bfe1-7d01b2e75c56/72a76cac-0a84-49e2-a214-8b905c08fb21.jpg';
      if (this.draftMeeting.category === 'faith')
        return 'https://chforum.backendcdn.com/us-west-2:1323b126-2579-4eba-bfe1-7d01b2e75c56/f7d9e5bb-dc61-4b0a-b944-c350e4511721.jpg';
      if (this.draftMeeting.category === 'politics')
        return 'https://chforum.backendcdn.com/us-west-2:1323b126-2579-4eba-bfe1-7d01b2e75c56/accdfc90-cf02-40be-afac-2969e210e471.jpg';
      if (this.draftMeeting.category === 'music')
        return 'https://chforum.backendcdn.com/us-west-2:1323b126-2579-4eba-bfe1-7d01b2e75c56/9f3a762c-54c5-4c0f-b403-646fea404390.jpg';
      if (this.draftMeeting.category === 'finance')
        return 'https://chforum.backendcdn.com/us-west-2:1323b126-2579-4eba-bfe1-7d01b2e75c56/110335ab-41da-4f67-8337-4db2626e3853.jpg';
      if (this.draftMeeting.category === 'business')
        return 'https://chforum.backendcdn.com/us-west-2:1323b126-2579-4eba-bfe1-7d01b2e75c56/07f2824b-b4aa-459c-9d46-9df627633967.jpg';
      if (this.draftMeeting.category === 'health')
        return 'https://chforum.backendcdn.com/us-west-2:1323b126-2579-4eba-bfe1-7d01b2e75c56/0cf89b2a-9db0-4bde-8d68-ea100928ddc8.jpg';
      if (this.draftMeeting.category === 'movies')
        return 'https://chforum.backendcdn.com/us-west-2:1323b126-2579-4eba-bfe1-7d01b2e75c56/2b7c4959-fb9e-4875-baef-ed12a1a28a38.jpg';
      if (this.draftMeeting.category === 'sports')
        return 'https://chforum.backendcdn.com/us-west-2:1323b126-2579-4eba-bfe1-7d01b2e75c56/36310ca6-95d8-4637-bf6f-92fdbd9185dc.jpg';
      if (this.draftMeeting.category === 'technology')
        return 'https://chforum.backendcdn.com/us-west-2:1323b126-2579-4eba-bfe1-7d01b2e75c56/4a5aa8b0-f119-4686-a6e1-917942b89798.jpg';
      if (this.draftMeeting.category === 'games')
        return 'https://chforum.backendcdn.com/us-west-2:1323b126-2579-4eba-bfe1-7d01b2e75c56/69779d41-a83e-4c2e-9803-593b78648006.jpg';
      if (this.draftMeeting.category === 'education')
        return 'https://chforum.backendcdn.com/us-west-2:1323b126-2579-4eba-bfe1-7d01b2e75c56/885f2e84-eecd-444a-9a09-655dddbc5f4b.jpg';
      if (this.draftMeeting.category === 'personalgrowth')
        return 'https://chforum.backendcdn.com/us-west-2:1323b126-2579-4eba-bfe1-7d01b2e75c56/da1e0f0b-6a45-4d91-bb97-43ea4ffc4fa4.jpg';
      if (this.draftMeeting.category === 'fashion')
        return 'https://chforum.backendcdn.com/us-west-2:1323b126-2579-4eba-bfe1-7d01b2e75c56/6542d9b4-b0c3-4d37-bacc-ea278a0b4033.jpg';
      if (this.draftMeeting.category === 'humor')
        return 'https://chforum.backendcdn.com/us-west-2:1323b126-2579-4eba-bfe1-7d01b2e75c56/b9305028-a6ea-4789-91f8-1d8c229019d6.jpg';
      return 'https://chforum.backendcdn.com/us-west-2:1323b126-2579-4eba-bfe1-7d01b2e75c56/acad50d2-1315-4f00-995f-49110e899f08.jpg';
    },
  },
  methods: {
    deleteReferralCode(index) {
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
    selectDateOption(val) {
      if (val === 'Start Now') {
        this.startsImmediately = true;
      } else {
        this.startsImmediately = false;
      }
    },
    async createMeeting() {
      const valid = await this.$refs.meetingPayment.validate();
      if (!valid) return;
      this.saving = true;
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
      if (!this.startsImmediately) {
        this.formattedDate = this.$moment(
          `${this.draftMeeting.startDate} ${this.draftMeeting.startTime}`,
          'YYYY-MM-DD HH:mm:ss'
        ).format();
      } else {
        this.formattedDate = this.$moment().format();
      }
      if (this.draftMeeting.picture) {
        const picture = await $upload.uploadImages([this.draftMeeting.picture]);
        this.draftMeeting.picture = picture[0].url;
      }
      const mutationVar = {
        name: this.draftMeeting.name,
        buttons: this.buttons,
        description: this.draftMeeting.description,
        picture: this.draftMeeting.picture || this.defaultMeetingPicture,
        category: this.draftMeeting.category,
        privacy: this.draftMeeting.privacy,
        startTime: this.formattedDate,
        enableQueue: this.draftMeeting.enableQueue === 'true',
        parentMeetingId: this.parentMeeting ? this.parentMeeting.id : null,
        slug: this.draftMeeting.slug,
        liveStreamMode: this.draftMeeting.liveStreamMode === 'true',
        referralCodes: this.referralCodes,
      };
      if (this.hasPaymentId)
        mutationVar.ticketPrice = parseFloat(this.draftMeeting.ticketPrice);
      const resp = await this.$apollo.mutate({
        mutation: InsertMeeting,
        variables: mutationVar,
      });
      const meeting = resp.data.insert_meeting;
      this.saving = false;
      this.buttons = [];
      this.$emit('close');
      if (this.parentMeeting) {
        $socket.sendRoom(
          'meeting',
          this.parentMeeting.id,
          'meeting-breakouts-modified'
        );
      } else {
        this.$router.push({
          name: 'MeetingDetail',
          params: meeting,
        });
      }
    },
    clearTicketPrice() {
      this.draftMeeting.ticketPrice = 0;
    },
  },
};
</script>
<style scoped>
.create-meeting-modal {
  width: 800px;
}
.ch-create-meeting__footer {
  text-align: right;
}
.meeting-form {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
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
.progress-indicator {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.meeting-form-column {
  display: flex;
  flex-direction: column;
}
.input-size {
  width: 100%;
  margin-top: 5px;
}
.custom-button-text {
  margin-bottom: 10px;
}
* >>> .ch-modal__body {
  padding: 1px 0px !important;
}
* >>> .cs-page-tabs__content {
  padding: 0 15px;
}
.price-error {
  color: var(--cs-danger-base);
  margin-top: -20px;
}

.meeting-referral-code__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.meeting-referral-code__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
<style>
.meeting-referral-code__footer .cs-toggle__error {
  display: none !important;
}
</style>
