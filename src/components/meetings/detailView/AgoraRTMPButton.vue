<template>
  <div class="agora-rtmp">
    <cs-button
      class="agora-rtmp__modal-btn"
      :fill="fill"
      :size="size"
      @click="open"
    >
      {{ text }}
    </cs-button>
    <app-modal title="External Software" :show="showModal" @close="close">
      <p class="agora-rtmp__description">
        Copy the below RTMP link and paste the same link into both the blank for
        the RTMP URL and the Stream Keys in your broadcast software.
      </p>
      <cs-textarea v-model="url" class="agora-rtmp__input" disabled />
      <cs-button class="agora-rtmp__copy-btn" @click="copyToClipboard">
        <i v-if="copy" class="ch-icons-verified" />
        <span v-else>Copy</span>
      </cs-button>
    </app-modal>
  </div>
</template>
<script>
import $auth from '@/services/auth';

import AppModal from '@/components/general/Modal.vue';

import GetAgoraToken from '@/gql/meetings/GetAgoraToken.gql';

export default {
  components: {
    AppModal,
  },
  props: {
    meeting: {
      type: Object,
      required: true,
    },
    text: {
      type: String,
      default: 'Click to get RTMP Code',
    },
    fill: {
      type: String,
      default: 'outline',
    },
    size: {
      type: String,
      default: 'medium',
    },
  },
  data: () => ({
    url: '',
    copy: false,
    showModal: false,
  }),
  async beforeMount() {
    const userId = $auth.getUserId();
    const uid = userId.match(/\d/g).join('').substring(0, 8) * 1 + 1;
    this.url = this.getUrl(uid);
  },
  methods: {
    getUrl(uid) {
      const rtmpUrl = new URL(`${process.env.VUE_APP_AGORA_RTMP_GATEWAY}/live`);
      rtmpUrl.searchParams.append('configid', '0');
      rtmpUrl.searchParams.append('channel', this.meeting.id);
      rtmpUrl.searchParams.append('uid', uid);
      rtmpUrl.searchParams.append('abr', '120000');
      rtmpUrl.searchParams.append('dfps', '24');
      rtmpUrl.searchParams.append('dvbr', '600000');
      rtmpUrl.searchParams.append('dwidth', '1920');
      rtmpUrl.searchParams.append('dheight', '1080');
      return decodeURIComponent(rtmpUrl.toString());
    },
    copyToClipboard() {
      navigator.clipboard.writeText(this.url);
      this.copy = true;
      setTimeout(() => {
        this.close();
        this.copy = false;
      }, 300);
    },
    open() {
      this.showModal = true;
    },
    close() {
      this.showModal = false;
    },
  },
};
</script>

<style scoped>
.agora-rtmp__input {
  width: 100%;
  height: 200px;
}
.agora-rtmp__copy-btn {
  margin: 15px auto;
}
</style>
