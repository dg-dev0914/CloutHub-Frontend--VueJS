<template>
  <app-modal :show="showSetupModal" :title="displayTitle" @close="save()">
    <div>
      {{ displayDescription }}
    </div>
    <div v-if="canShareAudio">
      <cs-select
        v-if="audioDevices && audioDevices.length"
        v-model="selectedAudioDevice"
        class="setup-dropdown"
        :options="audioDevices"
        label="Microphone"
      ></cs-select>
      <div class="microphone-settings">
        <app-audio-preview
          v-if="audioStream && selectedAudioDevice"
          class="full-width"
          :stream="audioStream"
        />
      </div>
    </div>
    <div v-if="canShareVideo">
      <cs-select
        v-if="videoDevices && videoDevices.length"
        v-model="selectedVideoDevice"
        class="setup-dropdown"
        label="Camera"
        placeholder="Go live without camera"
        :options="videoDevices"
      ></cs-select>
      <div v-if="videoStream && selectedVideoDevice">
        <app-web-live-stream class="video-preview" :stream="videoStream" />
      </div>
      <div v-else class="video-preview no-video">Video Preview</div>
    </div>
    <div slot="footer" class="meeting-media-settings-footer">
      <cs-button @click="save()">Done</cs-button>
    </div>
  </app-modal>
</template>
<script>
import AgoraRTC from 'agora-rtc-sdk-ng';
import AppModal from '@/components/general/Modal.vue';
import AppWebLiveStream from '@/components/live/WebLiveStream.vue';
import AppAudioPreview from './AudioPreview.vue';

export default {
  components: {
    AppModal,
    AppAudioPreview,
    AppWebLiveStream,
  },
  props: {
    canShareAudio: {
      type: Boolean,
      required: true,
    },
    canShareVideo: {
      type: Boolean,
      required: true,
    },
    role: {
      type: String,
      required: true,
      default: '',
    },
  },
  data() {
    return {
      showSetupModal: false,
      selectedAudioDevice: null,
      selectedVideoDevice: null,
      videoDevices: [],
      audioDevices: [],
      previewStream: null,
      audioStream: null,
      videoStream: null,
    };
  },
  computed: {
    displayTitle() {
      if (this.canShareVideo) {
        return 'Set Up Camera & Mic';
      }
      return 'Set Up Mic';
    },
    displayDescription() {
      if (this.canShareVideo) {
        return `Choose the camera and microphone you'd like to use for this event.`;
      }
      return `Choose the microphone you'd like to use for this event.`;
    },
  },
  watch: {
    selectedAudioDevice() {
      this.switchDevice('audio', this.selectedAudioDevice);
    },
    selectedVideoDevice() {
      this.switchDevice('video', this.selectedVideoDevice);
    },
  },
  methods: {
    save() {
      this.$emit('updated', {
        selectedAudioDevice: this.selectedAudioDevice,
        selectedVideoDevice: this.selectedVideoDevice,
      });
      this.closeModal();
    },
    switchDevice(type, deviceId) {
      if (deviceId) {
        if (this.videoStream && !this.videoStream.muted && type === 'video') {
          this.videoStream.setDevice(deviceId);
        } else if (
          this.audioStream &&
          !this.audioStream.muted &&
          type === 'video'
        ) {
          this.audioStream.switchDevice(type, deviceId);
        } else if (!this.showSetupModal) {
          this.unpreview();
          this.preview();
        }
      } else if (!this.showSetupModal) {
        this.unpreview();
        this.preview();
      }
    },
    closeModal() {
      this.unpreview();
      this.showSetupModal = false;
    },
    async preview() {
      if (!this.selectedAudioDevice && !this.selectedVideoDevice) {
        return false;
      }
      if (this.audioStream || this.videoStream) {
        return false;
      }
      this.audioStream = await AgoraRTC.createMicrophoneAudioTrack({
        microphoneId: this.selectedAudioDevice,
      });
      this.videoStream = await AgoraRTC.createCameraVideoTrack({
        cameraId: this.selectedVideoDevice,
      });

      return false;
    },
    async requestVideoPermission(silent) {
      try {
        const localVideo = await AgoraRTC.createCameraVideoTrack();
        localVideo.close();

        await this.findVideoDevices();
      } catch (err) {
        if (err.msg === 'NotAllowedError') {
          if (!silent) {
            alert(
              'Your browser settings prevent CloutHub from accessing your camera.'
            );
          }
          this.closeModal();
        }
      }
    },
    async findVideoDevices() {
      const devices = await AgoraRTC.getDevices();
      this.videoDevices = devices
        .filter((device) => device.kind === 'videoinput')
        .map((device) => ({
          label: device.label,
          value: device.deviceId,
        }));
      if (this.role !== 'SPEAKER')
        this.selectedVideoDevice =
          this.videoDevices[0] && this.videoDevices[0].value;
      else {
        this.selectedVideoDevice = null;
      }
    },
    async requestAudioPermission(silent) {
      try {
        const localAudio = await AgoraRTC.createMicrophoneAudioTrack();
        localAudio.close();
        await this.findAudioDevices();
      } catch (err) {
        if (err.msg === 'NotAllowedError') {
          if (!silent) {
            alert(
              'Your browser settings prevent CloutHub from accessing your microphone.'
            );
          }
          this.closeModal();
        }
      }
    },
    async findAudioDevices() {
      const devices = await AgoraRTC.getDevices();
      this.audioDevices = devices
        .filter((device) => device.kind === 'audioinput')
        .map((device) => ({
          label: device.label,
          value: device.deviceId,
        }));
      this.selectedAudioDevice =
        this.audioDevices[0] && this.audioDevices[0].value;
    },
    async unpreview() {
      if (this.videoStream) {
        this.videoStream.close();
        this.videoStream = null;
      }
      if (this.audioStream) {
        this.audioStream.close();
        this.audioStream = null;
      }
    },
    async setupModal() {
      if (!this.showSetupModal) {
        this.showSetupModal = true;
        await this.requestAudioPermission();
        if (this.canShareVideo) {
          await this.requestVideoPermission();
        }
        await this.preview();
      }
    },
  },
};
</script>

<style scoped>
.video-preview {
  width: 100%;
  height: 400px;
  margin-top: 20px;
}
.setup-dropdown {
  width: 100%;
  margin-top: 10px;
}
.no-video {
  text-align: center;
  background: black;
  color: white;
  padding-top: 200px;
}
.microphone-settings {
  display: flex;
}
.full-width {
  width: 100%;
}
.meeting-media-settings-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
