<template>
  <div>
    <div class="live-browser-inputs">
      <cs-select
        v-if="hasVideoPermission"
        v-model="selectedVideoDevice"
        :options="videoDevices"
        label="Camera"
        @input="switchDevice('video', selectedVideoDevice)"
      ></cs-select>
      <cs-select
        v-if="hasAudioPermission"
        v-model="selectedAudioDevice"
        :options="audioDevices"
        label="Mic"
        @input="switchDevice('audio', selectedAudioDevice)"
      ></cs-select>
      <div v-if="!isLoading" class="pt-4">
        <cs-button
          v-if="isTesting && !isLive"
          variant="primary"
          block
          class="btn"
          @click="goLive"
        >
          Start Streaming
        </cs-button>
        <div v-if="isLive" class="end-stream-button">
          <cs-button variant="danger" class="btn" @click="leave">
            Stop Streaming
          </cs-button>
        </div>
      </div>
      <cs-button
        v-if="livePostId"
        size="small"
        variant="secondary"
        fill="clear"
        @click="share"
      >
        <i class="ch-icons-share group-share-button__icon"></i>
        <span class="cs-textstyle-paragraph-small-bold"> Share </span>
      </cs-button>
    </div>
    <div v-if="!isLoading">
      <app-web-live-stream
        v-if="videoStream"
        class="mt-3"
        :stream="videoStream"
      />
      <b-row v-if="livePostId" class="wrapper">
        <b-col>
          <!-- Hiding Chat section and live chat for now -->
          <!--
          <div class="cs-textstyle-detail-heading live-addons mb-2">Chat</div>
          <app-live-chat :post-id="livePostId" />
          -->
          <!-- Comments instead of live chat -->
          <div class="cs-textstyle-detail-heading live-addons mb-2">Comments</div>
          <app-video-response
              v-if="post"
              @refresh="refreshVideo"
              :post="post"
            ></app-video-response>
        </b-col>
        <b-col class="handouts" md="4">
          <div class="cs-textstyle-detail-heading live-addons mb-2">
            Handouts
          </div>
          <app-post-resources :post-id="livePostId" :can-upload="true" />
        </b-col>
      </b-row>
      <app-spinner v-if="isLive && !livePostId" />
    </div>
    <app-spinner v-if="isLoading" />
  </div>
</template>

<script>
import AgoraRTC from 'agora-rtc-sdk-ng';
import $auth from '@/services/auth';
import GetLiveStreamAgoraToken from '@/gql/videos/GetLiveStreamAgoraToken.gql';
import AppWebLiveStream from '@/components/live/WebLiveStream.vue';
import AppSpinner from '@/components/general/Spinner.vue';
import GetLivePost from '@/gql/posts/GetLivePost.gql';
import AppLiveChat from '@/components/live/LiveChat.vue';
import GetLiveStream from '@/gql/general/GetLiveStream.gql';
import AppPostResources from '@/components/live/PostResources.vue';
import $socket from '@/services/socket';
import $bus from '@/services/bus';
import AppVideoResponse from '@/components/video/VideoResponse.vue';

import GetVideo from '@/gql/videos/GetVideo.gql';


const AGORA_APP_ID = process.env.VUE_APP_AGORA_ID;

export default {
  components: {
    AppWebLiveStream,
    AppSpinner,
    AppLiveChat,
    AppPostResources,
    AppVideoResponse,
  },
  apollo: {
    get_live_post: {
      query: GetLivePost,
      skip() {
        if (!this.isLive || this.livePostId) return true;
        return false;
      },
      pollInterval: 1000,
      result() {
        if (this.get_live_post) {
          this.livePostId = this.get_live_post.id;
          this.connectSocket();
        }
      },
    },
    post: {
        query: GetVideo,
        variables() {
          //console.log(this.livePostId);
          // ID is correct that we need. TEST IT.
          return {
            id: this.livePostId,
          }
        },
      }
  },
  async mounted() {
    await this.testDevice();
    await this.joinChannel();
    await this.getLocalStream();
  },
  data() {
    return {
      publishSettings: {
        audio: true,
        video: true,
      },
      streamId: null,
      livePostId: null,
      isTesting: false,
      isLive: false,
      isLoading: false,
      videoStream: null,
      audioStream: null,
      client: null,
      baseStreamUrl: 'rtmps://global-live.mux.com:443/app',
      audioDevices: [],
      videoDevices: [],
      selectedAudioDevice: null,
      selectedVideoDevice: null,
      hasAudioPermission: false,
      hasVideoPermission: false,
    };
  },
  beforeDestroy() {
    this.livePostId = null;
  },
  methods: {
    async refreshVideo() {
      this.$apollo.queries.post.skip = false;
      await this.$apollo.queries.post.refetch();
    },
    share() {
      $bus.$emit('show-share-other', {
        title: 'Share Video',
        post: this.post,
        embedCode: `<iframe width="710" height="400" allowfullscreen="true" src="${process.env.VUE_APP_SHARE_DOMAIN}/embed/${this.livePostId}"></iframe>`,
        link: `/v/${this.livePostId}`,
      });
    },
    async connectSocket() {
      await $socket.connect('post');
      await $socket.joinRoom('post', this.livePostId);
    },
    switchDevice(type, deviceId) {
      if (type === 'video' && this.videoStream && deviceId) {
        this.videoStream.setDevice(deviceId);
      }
      if (type === 'audio' && this.audioStream && deviceId) {
        this.audioStream.setDevice(deviceId);
      }
    },
    async listDevices() {
      const devices = await AgoraRTC.getDevices();
      this.audioDevices = devices
        .filter((device) => device.kind === 'audioinput')
        .map((device) => ({
          label: device.label,
          value: device.deviceId,
        }));
      this.videoDevices = devices
        .filter((device) => device.kind === 'videoinput')
        .map((device) => ({
          label: device.label,
          value: device.deviceId,
        }));
      this.selectedAudioDevice =
        this.audioDevices[0] && this.audioDevices[0].value;
      this.selectedVideoDevice =
        this.videoDevices[0] && this.videoDevices[0].value;
    },
    async transcode() {
      const url = `${this.baseStreamUrl}/${this.streamId}`;
      const userId = $auth.getUserId();
      const transcodingConfig = {
        width: 1280,
        height: 720,
        videoBitrate: 1130,
        videoFramerate: 24,
        lowLatency: false,
        audioBitrate: 48,
        audioChannels: 1,
        videoGop: 30,
        userCount: 1,
        backgroundColor: 0x000000,
        transcodingUsers: [
          {
            uid: userId,
            alpha: 1,
            width: 1280,
            height: 720,
            zOrder: 1,
            x: 0,
            y: 0,
          },
        ],
      };
      await this.client.setLiveTranscoding(transcodingConfig);
      await this.client.startLiveStreaming(url, true);
    },
    async publish() {
      try {
        await this.client.publish([this.audioStream, this.videoStream]);
      } catch (e) {
        console.log('publish failed', e);
      }
    },
    async getLocalStream() {
      this.audioStream = await AgoraRTC.createMicrophoneAudioTrack({
        microphoneId: this.selectedAudioDevice,
      });
      this.videoStream = await AgoraRTC.createCameraVideoTrack({
        cameraId: this.selectedVideoDevice,
        encoderConfig: {
          width: 1280,
          height: 720,
        },
      });
    },
    async leave() {
      if (!this.videoStream || !this.isLive) {
        return true;
      }
      await this.unpublish();
      if (this.client) {
        await this.client.leave();
        this.client = null;
        this.$toast.open({
          message:
            'Your video is processing, and will be available on your channel soon',
          type: 'success',
          duration: 3000,
          dismissible: true,
          position: 'top',
        });
        this.livePostId = null;
        this.$router.push({ name: 'VideoContainer' });
      }
    },
    async unpublish() {
      const url = `${this.baseStreamUrl}/${this.streamId}`;
      await this.client.stopLiveStreaming(url);
      if (this.videoStream) {
        await this.client.unpublish();
        this.videoStream.close();
        this.audioStream.close();
      }
    },
    async requestAudioPermission(silent) {
      try {
        const localAudio = await AgoraRTC.createMicrophoneAudioTrack();
        localAudio.close();
        this.hasAudioPermission = true;
      } catch (err) {
        const error = JSON.parse(JSON.stringify(err));
        if (error.code == 'PERMISSION_DENIED') {
          this.hasAudioPermission = false;
          if (!silent) {
            alert(
              'Your browser settings prevent CloutHub from accessing your microphone.'
            );
          }
        }
      }
    },
    async requestVideoPermission(silent) {
      try {
        const localVideo = await AgoraRTC.createCameraVideoTrack();
        localVideo.close();
        this.hasVideoPermission = true;
      } catch (err) {
        const error = JSON.parse(JSON.stringify(err));
        if (error.code == 'PERMISSION_DENIED') {
          this.hasVideoPermission = false;
          if (!silent) {
            alert(
              'Your browser settings prevent CloutHub from accessing your camera.'
            );
          }
        }
      }
    },
    async testDevice() {
      this.isLoading = true;
      this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      AgoraRTC.setLogLevel(1);
      await this.requestAudioPermission();
      await this.requestVideoPermission();
      this.isLoading = false;
      if (this.hasAudioPermission || this.hasVideoPermission) {
        this.listDevices();
        this.isTesting = true;
      } else if (this.client) this.client.leave();
    },
    async goLive() {
      await this.publish();
      this.transcode();
      this.isLive = true;
    },
    async joinChannel() {
      const userId = $auth.getUserId();
      const numericUserId = userId.match(/\d/g).join('').substring(0, 8) * 1;
      const randomUid = numericUserId.toString();
      const { data } = await this.$apollo.query({
        query: GetLiveStream,
      });
      this.streamId = data.get_live_stream.liveStreamKey;
      const resp = await this.$apollo.query({
        query: GetLiveStreamAgoraToken,
        variables: {
          liveStreamKey: this.streamId,
        },
      });
      const token = resp.data.token;
      const channel = this.streamId;
      this.client.join(AGORA_APP_ID, channel, token, userId).catch((err) => {
        const error = JSON.parse(JSON.stringify(err));
        if (error.code === 'UID_CONFLICT') window.location.reload();
      });
    },
  },
};
</script>

<style scoped>
.live-browser-inputs {
  display: flex;
  flex-direction: 1;
  gap: 10px;
  align-items: center;
}
.btn {
  height: fit-content;
}
.start-stream-button {
  padding: 50px;
  border: dashed 1px var(--cs-primary-base);
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.end-stream-button {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-top: 10px;
}
.live-chat {
  background: white;
  height: 300px;
  position: relative;
}
.live-addons {
  text-align: center;
}
.wrapper {
  padding-top: 30px;
}
</style>
