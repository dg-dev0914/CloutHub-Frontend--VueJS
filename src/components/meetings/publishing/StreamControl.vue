<template>
  <div class="media-control">
    <!-- MIC -->
    <div v-show="canShareAudio" class="media-control-item" @click="tapMic()">
      <i
        id="mic-control"
        :class="micStatus"
        class="cs-icons-microphone media-icon"
      ></i>
    </div>
    <!-- CAMERA -->
    <div v-show="canShareVideo" class="media-control-item" @click="tapCamera()">
      <i
        id="camera-control"
        :class="cameraStatus"
        class="cs-icons-video media-icon"
      ></i>
    </div>
    <!-- SCREEN -->
    <div
      v-show="canShareVideo"
      id="screen-control"
      class="media-control-item"
      @click="tapScreen()"
    >
      <i :class="screenStatus" class="cs-icons-channels media-icon"></i>
    </div>
    <!-- SETTINGS -->
    <div
      v-show="canShareVideo || canShareAudio"
      class="media-control-item"
      @click="showSettingsModal()"
    >
      <i class="cs-icons-settings media-icon"></i>
    </div>
    <app-meeting-media-settings-modal
      ref="settingsModal"
      :can-share-audio="canShareAudio"
      :can-share-video="canShareVideo"
      :role="role"
      @updated="handleUpdated"
    />
  </div>
</template>
<script>
import $socket from '@/services/socket';
import AppMeetingMediaSettingsModal from './MeetingMediaSettingsModal.vue';

export default {
  components: {
    AppMeetingMediaSettingsModal,
  },
  props: {
    audioStream: {
      type: Object,
      required: false,
      default: null,
    },
    screenStream: {
      type: Object,
      required: false,
      default: null,
    },
    videoStream: {
      type: Object,
      required: false,
      default: null,
    },
    canShareAudio: {
      type: Boolean,
      required: false,
      default: false,
    },
    canShareVideo: {
      type: Boolean,
      required: false,
      default: false,
    },
    role: {
      type: String,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      selectedAudioDevice: null,
      selectedVideoDevice: null,
      savedVideoDevice: null,
    };
  },
  computed: {
    micStatus() {
      if (!this.selectedAudioDevice) {
        return 'OFFLINE';
      }
      if (!this.audioStream) {
        return 'READY';
      }
      if (this.micMuted) {
        return 'MUTED';
      }
      return 'LIVE';
    },
    cameraStatus() {
      if (this.savedVideoDevice || this.cameraMuted) {
        return 'MUTED';
      }
      if (!this.selectedVideoDevice) {
        return 'OFFLINE';
      }
      if (!this.videoStream) {
        return 'READY';
      }
      if (this.videoStream && this.videoStream.enabled) {
        return 'LIVE';
      }
      return 'OFFLINE';
    },
    screenStatus() {
      return this.screenStream ? 'LIVE' : 'OFFLINE';
    },
    micMuted() {
      return this.audioStream && this.audioStream.muted;
    },
    cameraMuted() {
      return this.videoStream && this.videoStream.muted;
    },
  },
  watch: {
    selectedAudioDevice() {
      this.$emit('audioChange', {
        device: this.selectedAudioDevice,
      });
      this.setUserAttributes();
    },
    selectedVideoDevice() {
      this.$emit('videoChange', {
        device: this.selectedVideoDevice,
      });
      this.setUserAttributes();
    },
    canShareAudio() {
      if (!this.canShareAudio) {
        // Disable audio preview
        this.selectedAudioDevice = null;
      }
      if (this.canShareAudio && !this.selectedAudioDevice) {
        this.showSettingsModal();
      }
    },
    canShareVideo() {
      if (!this.canShareVideo) {
        this.selectedVideoDevice = null;
      }
      if (this.canShareVideo && !this.selectedVideoDevice) {
        this.showSettingsModal();
      }
    },
  },
  mounted() {
    setInterval(() => {
      this.setUserAttributes();
    }, 10 * 1000);
    if (this.canShareAudio || this.canShareVideo) {
      this.showSettingsModal();
    }
  },
  methods: {
    handleUpdated(e) {
      this.selectedAudioDevice = e.selectedAudioDevice;
      this.selectedVideoDevice = e.selectedVideoDevice;
      this.setUserAttributes();
    },
    setUserAttributes() {
      $socket.setUserAttributes({
        camera: this.cameraStatus,
        mic: this.micStatus,
        device: 'Desktop',
      });
    },
    muteAudio() {
      if (this.audioStream) this.audioStream.setMuted(true);
      this.setUserAttributes();
    },
    unmuteAudio() {
      if (this.audioStream) this.audioStream.setMuted(false);
      this.setUserAttributes();
    },
    muteVideo() {
      if (this.videoStream) this.videoStream.setMuted(true);
      this.setUserAttributes();
    },
    unmuteVideo() {
      if (this.videoStream) this.videoStream.setMuted(false);
      this.setUserAttributes();
    },
    selectScreen() {
      this.$emit('screenshare');
    },
    stopScreen() {
      this.$emit('stopscreenshare');
    },
    showSettingsModal() {
      this.savedVideoDevice = null;
      this.$refs.settingsModal.setupModal();
    },
    tapCamera() {
      if (this.videoStream) {
        if (this.cameraStatus === 'LIVE') {
          this.muteVideo();
        } else if (this.cameraStatus === 'MUTED') {
          this.unmuteVideo();
        } else {
          this.showSettingsModal();
        }
      } else {
        this.showSettingsModal();
      }
    },
    tapMic() {
      if (this.micStatus === 'LIVE') {
        this.muteAudio();
      } else if (this.micStatus === 'MUTED') {
        this.unmuteAudio();
      } else {
        this.showSettingsModal();
      }
    },
    tapScreen() {
      if (this.screenStatus === 'LIVE') {
        this.stopScreen();
      } else {
        this.selectScreen();
      }
    },
  },
};
</script>
<style scoped>
.media-control {
  display: inline-flex;
}
.media-control-item {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.media-control-item div {
  font-size: 11px;
}

.READY,
.OFFLINE {
  color: #999999;
  background-color: #d8d8d8;
}

.LIVE {
  color: #fff;
  background: #6dd400;
}

.MUTED {
  position: relative;
  color: #fff;
  background: #ea4335;
}

.MUTED:after {
  content: '';
  position: absolute;
  left: 7px;
  top: 22px;
  height: 2px;
  width: 31px;
  background: #fff;
  transform: rotate(45deg);
}

.media-icon__settings {
  color: #999999;
  background-color: #d8d8d8;
}

.media-icon {
  font-size: 25px;
  width: 45px;
  height: 45px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: 50px;
  cursor: pointer;
  margin: 10px;
  transition: all 0.2s ease-in-out;
}
</style>
