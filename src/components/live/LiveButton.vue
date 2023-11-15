<template>
  <div>
    <cs-button
      variant="default"
      :size="btnSize"
      class="btn-class"
      @click="openModal"
    >
      Go Live
    </cs-button>
    <app-modal
      :show="showModal"
      @close="onClose"
      title="GO LIVE NOW"
      :noBackdrop="true"
      v-if="user"
      class="webcam-browser-modal"
    >
      <form @submit.prevent="onFormSubmit" class="schedule-stream-form">
        <b-form-radio-group
          v-model="goLiveOption"
          @change="handleGoLiveOptionChange"
          class="go-live-options"
        >
          <b-form-radio value="now">Now</b-form-radio>
          <b-form-radio value="later">Later</b-form-radio>
        </b-form-radio-group>
        <b-form v-if="goLiveOption === 'later'" @submit.prevent="onFormSubmit">
          <b-form-group label="Stream title">
            <b-form-input v-model="streamTitle" :maxlength="70"></b-form-input>
            <p>{{ 70 - streamTitle.length }} characters remaining</p>
          </b-form-group>
          <b-form-group label="Stream description">
            <b-form-input
              v-model="streamDescription"
              :maxlength="250"
            ></b-form-input>
            <p>{{ 250 - streamDescription.length }} characters remaining</p>
          </b-form-group>
          <b-form-group label="Stream Start Date/Time" class="date-time-group">
            <b-form-row>
              <b-col>
                <b-form-datepicker v-model="streamDate"></b-form-datepicker>
              </b-col>
              <b-col>
                <b-form-timepicker v-model="streamTime"></b-form-timepicker>
              </b-col>
            </b-form-row>
          </b-form-group>
          <b-form-group label="Stream End Date/Time" class="date-time-group">
            <b-form-row>
              <b-col>
                <b-form-datepicker v-model="streamDateEnd"></b-form-datepicker>
              </b-col>
              <b-col>
                <b-form-timepicker v-model="streamTimeEnd"></b-form-timepicker>
              </b-col>
            </b-form-row>
          </b-form-group>
          <b-form-group label="Stream Image">
            <app-image-input
              v-model="streamImage"
              :enforce-ratio="1 / 1"
              label="Image (Size: ratio 1:1 or 512x512 )"
            />
          </b-form-group>
          <b-button type="submit" variant="primary">Submit</b-button>
        </b-form>
      </form>
      <cs-page-tabs v-if="!user.isLiveStreaming && goLiveOption === 'now'">
        <cs-page-tab label="Webcam" class="web-live">
          <cs-button
            variant="primary"
            class="btn"
            @click="browserLive"
            v-if="!user.isLiveStreaming"
          >
            Test Device
          </cs-button>
        </cs-page-tab>
        <cs-page-tab label="RTMP">
          <div class="mb-4">
            Please use the following settings with your preferred live-streaming
            software:
          </div>
          <b-row>
            <b-col md="3">Stream Address:</b-col>
            <b-col md="9">{{ baseRtmpUrl }}</b-col>
          </b-row>
          <b-row>
            <b-col md="3">Stream Key:</b-col>
            <b-col md="9">{{ streamId }}</b-col>
          </b-row>
        </cs-page-tab>
      </cs-page-tabs>
    </app-modal>
  </div>
</template>

<script>
import AppModal from '@/components/general/Modal.vue';
import GetProfile from '@/gql/general/GetProfile.gql';
import $auth from '@/services/auth';
import GetLiveStream from '@/gql/general/GetLiveStream.gql';
import AppVideo from '@/components/general/Video.vue';
import AppSpinner from '@/components/general/Spinner.vue';
import AddSchedule from '@/gql/posts/ScheduleAddSchedule.gql';
import $upload from '@/services/upload';
import AppImageInput from '@/components/general/ImageInput.vue';

export default {
  props: {
    btnSize: {
      type: String,
      default: 'small',
    },
  },
  apollo: {
    user: {
      query: GetProfile,
      variables() {
        return {
          id: $auth.getUserId(),
          viewerId: $auth.getUserId(),
        };
      },
      pollInterval: 6000,
      skip() {
        return this.isSkipQuery;
      },
    },
    get_live_stream: {
      query: GetLiveStream,
    },
  },
  data() {
    return {
      showModal: false,
      baseRtmpUrl: 'rtmp://rtmp.clouthub.com:5222/app',
      streamId: null,
      isBrowserLive: false,
      alreadyStreaming: false,
      goLiveOption: 'now',
      streamTitle: '',
      streamDescription: '',
      streamDate: '',
      streamDateEnd: '',
      streamTime: '',
      streamTimeEnd: '',
      streamImage: null,
    };
  },
  components: {
    AppModal,
    AppVideo,
    AppSpinner,
    AppImageInput,
  },

  computed: {
    isSkipQuery() {
      if (!this.user) return false;
      if (!this.isBrowserLive && this.showModal) return false;
      return true;
    },
  },
  methods: {
    browserLive() {
      this.isBrowserLive = true;
      this.showThirdPartySettings = false;
      this.$router.push({ name: 'LiveStreaming' });
    },
    async openModal() {
      this.showModal = true;
      if (!this.streamId) this.streamId = this.get_live_stream.liveStreamKey;
      // this.alreadyStreaming = this.user.isLiveStreaming;
    },
    onClose() {
      this.showModal = false;
      this.streamId = null;
      this.isLoading = false;
      this.isBrowserLive = false;
    },
    handleGoLiveOptionChange() {
      if (this.goLiveOption === 'now') {
        this.streamTitle = '';
        this.streamDescription = '';
        this.streamDate = '';
        this.streamDateEnd = '';
        this.streamTime = '';
        this.streamTimeEnd = '';
      }
    },
    async onFormSubmit() {
      if (
        this.streamTitle === '' ||
        this.streamDescription === '' ||
        this.streamDate === '' ||
        this.streamDateEnd === '' ||
        this.streamTime === '' ||
        this.streamTimeEnd === ''
      ) {
        alert('All fields are required!');
        return;
      }

      const streamDateTime = new Date(this.streamDate + ' ' + this.streamTime);

      const streamDateTimeEnd = new Date(
        this.streamDateEnd + ' ' + this.streamTimeEnd
      );

      // You already have a file, no need to convert
      const imageFile = this.streamImage;

      if (this.streamImage) {
        // Upload the image and get the URL
        $upload
          .uploadImages([imageFile])
          .then((uploadInfo) => {
            // Get the image URL from the uploadInfo
            let imageURL = ''; // Declare imageURL here

            if (uploadInfo.length > 0) {
              imageURL = uploadInfo[0].url; // Access the url property of the first object in the array
            } else {
              imageURL = ''; // Empty string, so it databases falls silent when no image uplaod.
            }

            this.$apollo
              .mutate({
                mutation: AddSchedule,
                variables: {
                  uid: $auth.getUserId(),
                  stream_datetime: streamDateTime,
                  stream_datetime_end: streamDateTimeEnd,
                  stream_title: this.streamTitle,
                  stream_description: this.streamDescription,
                  stream_image: imageURL, // use the imageURL here
                },
              })
              .then(({ data }) => {
                // Reset the form fields to default after successful submission
                this.goLiveOption = 'now';
                this.streamTitle = '';
                this.streamDescription = '';
                this.streamDate = '';
                this.streamDateEnd = '';
                this.streamTime = '';
                this.streamTimeEnd = '';
                this.streamImage = null;

                this.onClose();
                this.$router.push('/upcoming?filter=mine');
              })
              .catch((error) => {
                alert('Failed to schedule stream. Please try again.');
              });
          })
          .catch((error) => {
            alert('Failed to upload image. Please try again.');
          });
      } else {
        let imageURL = '';
        this.$apollo
          .mutate({
            mutation: AddSchedule,
            variables: {
              uid: $auth.getUserId(),
              stream_datetime: streamDateTime,
              stream_datetime_end: streamDateTimeEnd,
              stream_title: this.streamTitle,
              stream_description: this.streamDescription,
              stream_image: imageURL, // use the imageURL here
            },
          })
          .then(({ data }) => {
            // Reset the form fields to default after successful submission
            this.goLiveOption = 'now';
            this.streamTitle = '';
            this.streamDescription = '';
            this.streamDate = '';
            this.streamDateEnd = '';
            this.streamTime = '';
            this.streamTimeEnd = '';
            this.streamImage = null;

            this.onClose();
            this.$router.push('/upcoming?filter=mine');
          })
          .catch((error) => {
            alert('Failed to schedule stream. Please try again.');
          });
      }
    },
  },
};
</script>

<style scoped>
.stream-info {
  background: var(--cs-gray-02);
  padding: 5px 10px;
}
.live-rtml-btn {
  margin-top: 10px;
}
.header {
  font-size: medium;
}
.rtmp-info {
  display: flex;
}
.btn-class {
  width: 100%;
  --cs-button-color: #747577 !important;
}
.webcam-browser-modal >>> .ch-modal__body {
  padding: 0px !important;
}
.web-live {
  text-align: center;
}
.schedule-stream-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}
.schedule-stream-form b-form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.schedule-stream-form b-form-input,
.schedule-stream-form b-form-datepicker {
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  width: 100%;
  box-sizing: border-box;
}
.schedule-stream-form b-button {
  align-self: flex-end;
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  background-color: #0099cc;
  color: #fff;
  cursor: pointer;
}
.schedule-stream-form b-button:hover {
  background-color: #007399;
}
.go-live-options {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
}
.go-live-options .custom-control {
  position: relative;
  display: block;
  min-height: 1.5rem;
  padding-left: 2.5rem;
}
.go-live-options .custom-control-input:checked ~ .custom-control-label::before {
  color: #fff;
  border-color: #007bff;
  background-color: #007bff;
}
.go-live-options .custom-control-label::before {
  border: 1px solid #adb5bd;
}
.go-live-options .custom-control-label::after {
  position: absolute;
  top: 0.25rem;
  left: -2rem;
  width: 1rem;
  height: 1rem;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 50% 50%;
  content: '';
}
.date-time-group {
  margin-bottom: 20px; /* Adjust this value as necessary */
}
</style>
