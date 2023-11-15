<template>
  <div class="meeting-area">
    <div
      v-if="streams.length"
      ref="viewingArea"
      class="meeting-stream-area"
      :style="{
        gridTemplateColumns: 'repeat(' + columnCount + ', minmax(0, 1fr))',
      }"
    >
      <div v-if="streams.length" class="meeting-recording-badge">
        <div class="recording-circle"></div>
        REC
      </div>
      <div class="meeting-full-screen-toggle" @click="toggleFullScreen()">
        <i class="cs-icons-full-screen"></i>
      </div>
      <app-meeting-stream
        v-for="stream in streams"
        :key="stream.uid"
        :stream="stream"
      />
    </div>
    <div v-if="!videoStreams.length" class="placeholder">
      Waiting for someone to share video...
    </div>

    <app-meeting-links-bar :meeting="meeting" />

    <div v-show="role !== 'VIEWER'" class="meeting-publish-panel">
      <div class="cs-textstyle-paragraph meeting-publish-panel__info">
        <!-- Admin view -->
        <div v-if="role === 'ADMIN'">
          <div v-if="meeting.liveStreamMode">
            <app-agora-rtmp-button
              class="meeting-publish-panel__rtmp-btn"
              :meeting="meeting"
            />
          </div>
          <div v-else>
            <!-- Live -->
            <div v-if="publishedStream">
              <cs-button
                v-if="publishedStream"
                class="ch-publish-unpublish-btn offline-button"
                fill="outline"
                size="medium"
                @click="stopPublishing"
              >
                GO OFFLINE
              </cs-button>
            </div>
            <!-- Ready to go live -->
            <div
              v-else-if="
                !publishedStream && (selectedAudioDevice || selectedVideoDevice)
              "
            >
              <cs-button
                v-if="!publishedStream"
                class="ch-publish-unpublish-btn live-button"
                @click="publish()"
              >
                GO LIVE NOW
              </cs-button>
            </div>
            <!-- Not ready -->
            <div v-else>Please enable your mic and/or camera.</div>
          </div>
        </div>

        <!-- Moderator -->
        <div v-if="role === 'MODERATOR'">
          <!-- Live -->
          <div v-if="publishedStream">
            <cs-button
              v-if="publishedStream"
              class="offline-button"
              fill="outline"
              size="medium"
              @click="stopPublishing"
            >
              GO OFFLINE
            </cs-button>
          </div>
          <!-- Ready to go live -->
          <div
            v-else-if="
              !publishedStream && (selectedAudioDevice || selectedVideoDevice)
            "
          >
            <cs-button v-if="!publishedStream" @click="publish()" class="live-button"> 
              GO LIVE NOW
            </cs-button>
          </div>
          <!-- Not ready -->
          <div v-else>Please enable your mic and/or camera.</div>
        </div>

        <!-- Presenter -->
        <div v-if="role === 'PRESENTER'">
          <!-- Live -->
          <div v-if="publishedStream">
            <cs-button
              v-if="publishedStream"
              class="offline-button"
              fill="outline"
              size="medium"
              @click="stopPublishing"
            >
              GO OFFLINE
            </cs-button>
          </div>
          <!-- Ready to go live -->
          <div
            v-else-if="
              !publishedStream && (selectedAudioDevice || selectedVideoDevice)
            "
          >
            <cs-button v-if="!publishedStream" @click="publish()" class="live-button">
              GO LIVE NOW
            </cs-button>
          </div>
          <!-- Not ready -->
          <div v-else>Please enable your mic and/or camera to go live.</div>
        </div>

        <!-- PRESENTER_QUEUE -->
        <div v-if="role === 'PRESENTER_QUEUE'">
          <div v-if="selectedAudioDevice || selectedVideoDevice">
            Your mic or camera is ready. You'll go live as soon as a host makes
            it your turn.
          </div>
          <div v-else>
            Please enable your mic and camera. You'll go live as soon as a host
            makes it your turn.
          </div>
        </div>

        <!-- SPEAKER -->
        <div v-if="role === 'SPEAKER'">
          <!-- Live -->
          <div v-if="publishedStream">
            <cs-button
              v-if="publishedStream"
              class="offline-button"
              fill="outline"
              size="medium"
              @click="stopPublishing"
            >
              GO OFFLINE
            </cs-button>
          </div>
          <!-- Ready to go live -->
          <div v-else-if="selectedAudioDevice">
            <cs-button v-if="!publishedStream" @click="publish()" class="live-button"
              >GO LIVE NOW</cs-button
            >
          </div>
          <!-- Not ready -->
          <div v-else>Please enable your mic to go live.</div>
        </div>
      </div>
      <div
        v-if="(!isAdmin && meeting.liveStreamMode) || !meeting.liveStreamMode"
        class="meeting-publish-panel__icons"
      >
        <app-stream-control
          ref="streamControl"
          :can-share-audio="canShareAudio"
          :can-share-video="canShareVideo"
          :video-stream="publishedVideoStream"
          :audio-stream="publishedAudioStream"
          :screen-stream="publishedScreenStream"
          :role="role"
          @audioChange="handleAudioChange"
          @videoChange="handleVideoChange"
          @screenshare="shareScreen"
          @stopscreenshare="stopScreen"
        />
      </div>
      <app-meeting-end-button
        v-if="meeting.status === 'LIVE' && isAdmin"
        :meeting="meeting"
        @end="endMeeting"
      />
    </div>
  </div>
</template>
<script>
import AgoraRTC from 'agora-rtc-sdk-ng';

import $auth from '@/services/auth';

import AppStreamControl from '@/components/meetings/publishing/StreamControl.vue';
import AppMeetingEndButton from '@/components/meetings/buttons/MeetingEndButton.vue';
import AppMeetingStream from '@/components/meetings/MeetingStream.vue';
import AppMeetingLinksBar from '@/components/meetings/MeetingLinksBar.vue';
import AppAgoraRtmpButton from '@/components/meetings/detailView/AgoraRTMPButton.vue';

import GetAgoraToken from '@/gql/meetings/GetAgoraToken.gql';

const AGORA_APP_ID = process.env.VUE_APP_AGORA_ID;

export default {
  components: {
    AppMeetingStream,
    AppStreamControl,
    AppMeetingEndButton,
    AppMeetingLinksBar,
    AppAgoraRtmpButton,
  },
  props: {
    meeting: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      client: null,
      publishedStream: null,
      publishedVideoStream: null,
      publishedAudioStream: null,
      streams: [],
      publishedScreenStream: null,
      selectedAudioDevice: null,
      selectedVideoDevice: null,
    };
  },
  computed: {
    role() {
      return (
        this.meeting &&
        this.meeting.myMembership &&
        this.meeting.myMembership.role
      );
    },
    canModerate() {
      return this.role === 'ADMIN' || this.role === 'MODERATOR';
    },
    isAdmin() {
      return this.role === 'ADMIN';
    },
    canShareAudio() {
      return (
        [
          'ADMIN',
          'PRESENTER',
          'PRESENTER_QUEUE',
          'MODERATOR',
          'SPEAKER',
        ].includes(this.role) && !!this.client
      );
    },
    canShareVideo() {
      return (
        [
          'ADMIN',
          'PRESENTER',
          'SPEAKER',
          'PRESENTER_QUEUE',
          'MODERATOR',
        ].includes(this.role) && !!this.client
      );
    },
    columnCount() {
      return !this.videoStreams || this.videoStreams.length === 1 ? 1 : 2;
    },
    videoStreams() {
      if (this.streams) {
        return this.streams && this.streams.filter((s) => s.video);
      }
      return false;
    },
  },
  watch: {
    async role(newRole) {
      if (newRole === 'ADMIN' || newRole === 'MODERATOR') {
        // ADMIN, MODERATOR, PRESENTER = do nothing - they can publish anything
        await this.client.setClientRole('host');
      } else if (newRole === 'PRESENTER') {
        // If upgrading from presenter queue and mic / camera are available, go live
        await this.client.setClientRole('host');
        if (this.selectedAudioDevice || this.selectedVideoDevice) {
          await this.publish();
        } else {
          await this.unpublish();
        }
      } else if (newRole === 'SPEAKER') {
        await this.client.setClientRole('host');
        if (this.selectedAudioDevice || this.selectedVideoDevice) {
          await this.publish();
        } else {
          await this.unpublish();
        }
      } else {
        await this.stopPublishing();
        await this.client.setClientRole('audience');
      }
      return false;
    },
  },
  async mounted() {
    await this.joinChannel();
    this.setupListeners();
    window.onbeforeunload = (e) => {
      if (this.videoStream || this.audioStream) {
        e.preventDefault();
        this.unpublish();
        return 'This will stop publishing';
      }
    };
  },
  beforeDestroy() {
    this.unpublish();
  },
  methods: {
    async handleVideoChange(e) {
      this.selectedVideoDevice = e.device;
      // If not, published nothing to do
      if (this.publishedStream) {
        if (
          this.selectedVideoDevice &&
          this.publishedStream.video &&
          this.publishedStream.video.hasVideo()
        ) {
          // If published and already publishing video, switch
          this.publishedStream.switchDevice('video', this.selectedVideoDevice);
        } else {
          // If adding or removing audio or video, republish
          // await this.unpublish();
          await this.publish();
        }
      }
    },
    async handleAudioChange(e) {
      this.selectedAudioDevice = e.device;
      if (this.publishedStream) {
        if (
          this.selectedAudioDevice &&
          this.publishedStream.audio &&
          this.publishedStream.audio.hasAudio()
        ) {
          this.publishedStream.switchDevice('audio', this.selectedAudioDevice);
        } else {
          // await this.unpublish();
          await this.publish();
        }
      }
    },
    async publish(shareScreen) {
      await this.unpublish();
      if (!shareScreen && this.canShareVideo && !!this.selectedVideoDevice) {
        this.publishedScreenStream = null;
        this.publishedVideoStream = await AgoraRTC.createCameraVideoTrack({
          cameraId: this.selectedVideoDevice,
          encoderConfig: {
            width: 640,
            height: 480,
          },
        });
      }
      if (this.canShareAudio && !!this.selectedAudioDevice) {
        this.publishedAudioStream = await AgoraRTC.createMicrophoneAudioTrack({
          microphoneId: this.selectedAudioDevice,
        });
      }
      if (shareScreen) {
        this.publishedScreenStream = await AgoraRTC.createScreenVideoTrack({
          // Set the encoder configurations. For details, see the API description.
          encoderConfig: '1080p_1',
          // Set the video transmission optimization mode as prioritizing video quality.
          optimizationMode: 'detail',
        });
        this.publishedVideoStream = null;
      }
      if (this.canShareVideo || this.canShareAudio) {
        try {
          const publishArray = [];
          if (this.publishedAudioStream)
            publishArray.push(this.publishedAudioStream);
          if (this.publishedVideoStream)
            publishArray.push(this.publishedVideoStream);
          if (this.publishedScreenStream)
            publishArray.push(this.publishedScreenStream);
          await this.client.publish(publishArray);
          if (this.publishedVideoStream) {
            this.streams = this.streams.filter(
              (s) => s.uid !== this.client._uid
            );
            this.publishedStream = {
              uid: this.client._uid,
              video: this.publishedVideoStream,
            };
            this.streams.push(this.publishedStream);
          } else if (this.publishedAudioStream) {
            this.streams = this.streams.filter(
              (s) => s.uid !== this.client._uid
            );
            this.publishedStream = {
              uid: this.client._uid,
              audio: this.publishedAudioStream,
            };
          }
        } catch (e) {
          console.error('Publish Failed', e);
        }
      }
    },
    // To use on button click to avoid random uids for 1 user
    async stopPublishing() {
      await this.unpublish();
      this.streams = this.streams.filter((s) => s.uid !== this.client._uid);
    },
    async unpublish() {
      if (this.publishedVideoStream) {
        this.publishedVideoStream.close();
        this.publishedVideoStream = null;
      }
      if (this.publishedAudioStream) {
        this.publishedAudioStream.close();
        this.publishedAudioStream = null;
      }
      if (this.publishedScreenStream) {
        this.publishedScreenStream.close();
        this.publishedScreenStream = null;
      }
      if (this.publishedStream) {
        await this.client.unpublish();
        this.publishedStream = null;
      }
    },
    switchDevice(type, deviceId) {
      if (this.publishedStream && deviceId) {
        this.publishedStream.switchDevice(type, deviceId);
      }
    },
    async joinChannel() {
      const userId = $auth.getUserId();
      const numericUserId = userId.match(/\d/g).join('').substring(0, 8) * 1;
      const randomUid = numericUserId.toString();
      const resp = await this.$apollo.query({
        query: GetAgoraToken,
        variables: {
          meetingId: this.meeting.id,
          randomUid,
        },
      });
      const token = resp.data.token;
      const channel = this.meeting.id;
      this.client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
      this.client
        .join(AGORA_APP_ID, channel, token, numericUserId)
        .catch((err) => {
          const error = JSON.parse(JSON.stringify(err));
          if (error.code === 'UID_CONFLICT') window.location.reload();
        });
      if (this.canShareAudio || this.canShareVideo)
        await this.client.setClientRole('host');
    },
    async leave() {
      this.publishedStream = null;
      this.streams = [];
      this.selectedAudioDevice = null;
      this.selectedVideoDevice = null;
      if (this.$refs.streamControl) {
        await this.$refs.streamControl.unpreview();
      }
      return new Promise((resolve, reject) => {
        this.unpublish();
        if (this.client) {
          this.client.leave(
            () => {
              this.client = null;
              resolve();
            },
            (err) => {
              reject(err);
            }
          );
        }
      });
    },
    removeStream(uid, mediaType) {
      this.streams = this.streams.map((s) => {
        if (s.uid === uid) {
          if (mediaType === 'video') {
            return {
              ...s,
              video: null,
            };
          }
          if (mediaType === 'audio') {
            return {
              ...s,
              audio: null,
            };
          }
        } else {
          return s;
        }

        return false;
      });
      this.streams = this.streams.filter((s) => s.video || s.audio);
    },
    setupListeners() {
      const client = this.client;
      client.on('user-published', async (user, mediaType) => {
        const subscriptionData = await client.subscribe(user, mediaType);
        let found = false;
        const streamsData = this.streams.map((s) => {
          if (s.uid === user.uid) {
            found = true;
            if (mediaType === 'video')
              return {
                ...s,
                video: subscriptionData,
              };
            if (mediaType === 'audio')
              return {
                ...s,
                audio: subscriptionData,
              };
          } else return s;
          return false;
        });
        if (found) {
          this.streams = streamsData;
        } else {
          const subscribingStream = {
            uid: user.uid,
          };
          if (mediaType === 'video') subscribingStream.video = subscriptionData;
          if (mediaType === 'audio') subscribingStream.audio = subscriptionData;
          this.streams.push(subscribingStream);
        }
      });
      client.on('user-unpublished', (evt, mediaType) => {
        this.removeStream(evt.uid, mediaType);
      });
    },
    toggleFullScreen() {
      if (!document.fullscreenElement) {
        this.$refs.viewingArea.requestFullscreen();
      } else if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    },
    async shareScreen() {
      if (!this.publishedStream) {
        alert('You can only share screen when live');
        return false;
      }
      await this.publish(true);
      return false;
    },
    async stopScreen() {
      await this.publish(false);
    },
    showConfirmModal() {
      this.$emit('confirm-modal');
    },
    endMeeting() {
      this.$emit('end-meeting');
    },
  },
};
</script>
<style>
.meeting-area {
  display: flex;
  flex: 1;
  flex-direction: column;
}
.meeting-publish-panel {
  background-color: #333;
  padding: 10px;
  box-sizing: content-box;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
}

.meeting-publish-panel__icons {
  margin: 0 25px;
}
.placeholder {
  display: flex;
  color: white;
  flex: 1;
  justify-content: center;
  align-items: center;
  position: relative;
}
.meeting-stream-area {
  position: relative;
  flex: 1;
  display: grid;
  grid-gap: 20px;
  grid-template-rows: auto;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.meeting-recording-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  color: white;
  border: solid 2px red;
  border-radius: 5px;
  display: flex;
  gap: 5px;
  justify-content: center;
  align-items: center;
  padding: 2px;
  padding-left: 8px;
  padding-right: 8px;
  z-index: 1;
}
.meeting-full-screen-toggle {
  position: absolute;
  top: 10px;
  left: 10px;
  color: white;
  z-index: 1;
  font-size: 20px;
  cursor: pointer;
}
.recording-circle {
  width: 12px;
  height: 12px;
  background-color: red;
  border-radius: 50%;
}
.ch-publish-unpublish-btn {
  min-width: 130px;
}
.meeting-publish-panel__rtmp-btn {
  margin-right: 50px;
}
/* new styles for the buttons */
.live-button {
  background-color: yellow !important; /* Makes the button yellow */
  color: black !important; /* Makes the text black */
  font-size: 20px !important; /* Increases the size of the text */
  font-weight: bold !important; /* Makes the text bolder */
  padding: 15px 30px !important; /* Increases the size of the button by adding more padding */
  border-radius: 5px !important; /* Slightly rounds the corners of the button */
}
.offline-button {
  background-color: green !important; /* Makes the button green */
  color: white !important; /* Makes the text white */
  font-size: 20px !important; /* Increases the size of the text */
  font-weight: bold !important; /* Makes the text bolder */
  padding: 15px 30px !important; /* Increases the size of the button by adding more padding */
  border-radius: 5px !important; /* Slightly rounds the corners of the button */
  text-transform: uppercase; /* Converts the text to uppercase */
}
</style>
