<template>
  <div v-show="isVideoOn" class="meeting-stream" @dblclick="toggleFullScreen()">
    <div :id="elementId" ref="player" class="agora-video-player"></div>
    <div v-if="user && isVideoOn" class="userbar">
      {{ name }}
    </div>
  </div>
</template>
<script>
import AppAvatar from '@/components/general/Avatar.vue';
import $meetingusers from './meetingusers';
import $auth from '@/services/auth';

export default {
  components: {
    AppAvatar,
  },
  props: {
    stream: {
      type: Object,
      required: true,
    },
    autoDestroy: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      audioLevel: 0,
      user: null,
    };
  },
  watch: {
    stream(newStream, oldStream) {
      this.playStreams();
    },
  },
  methods: {
    toggleFullScreen() {
      if (!document.fullscreenElement) {
        this.$refs.player.requestFullscreen();
      } else if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    },
    playStreams() {
      if (this.stream.video && !this.stream.video.isPlaying) {
        this.stream.video.play(this.elementId, { fit: 'contain', audio: false, });
      }
      if (this.stream.audio && !this.stream.audio.isPlaying) {
        const userId = $auth.getUserId();
        const userUid = userId.match(/\d/g).join('').substring(0, 8) * 1 + 1;
        if (this.stream.uid === userUid) return;
        this.stream.audio.play();
      }
    }
  },
  computed: {
    isVideoOn() {
      return this.stream && this.stream.video;
    },
    isAudioOn() {
      return this.stream && this.stream.audio;
    },
    elementId() {
      return this.stream.uid && `el.${this.stream.uid}`;
    },
    name() {
      return (
        this.user &&
        (this.user.displayname.length
          ? this.user.displayname
          : this.user.username)
      );
    },
  },
  mounted() {
    this.$nextTick(() => {
      if(this.stream && this.stream.video || this.stream.audio) {
        this.playStreams();
      }
    });
    setInterval(() => {
      this.user = $meetingusers.getUser(this.stream.uid);
    }, 300);
  },
  beforeDestroy() {
    if (this.stream) {
      if (this.stream.video && this.stream.video.isPlaying) {
        this.stream.video.stop();
      }
      if (this.stream.audio && this.stream.audio.isPlaying) {
        this.stream.audio.stop();
      }
    }
  },
};
</script>
<style scoped>
.meeting-stream {
  background-color: black;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.agora-video-player {
  flex: 1;
}
.userbar
{
  color: #aaa;
  text-align: center;
}
</style>
