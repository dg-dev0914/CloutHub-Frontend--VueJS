<template>
  <div class="meeting-chat">
    <div v-if="messages" ref="messages" class="meeting-chat-messages">
      <app-meeting-chat-message
        v-for="message in displayMessages"
        :key="message.id"
        :message="message"
        :meeting="meeting"
        @delete="onMessageDelete"
        @click="$emit('showProfile', message.postedByUser)"
      ></app-meeting-chat-message>
      <app-infinite-simple
        :query="$apollo.queries.messages"
        sort-key="createdAt"
      ></app-infinite-simple>
    </div>
    <div class="meeting-chat-composer">
      <app-avatar
        v-if="user"
        :name="user.displayname"
        :picture="user.profilePhotoURL"
        size="medium"
      />
      <textarea
        ref="meetingChatComposerInput"
        v-model="draftMessage"
        class="meeting-chat-input"
        placeholder="Add comment here"
        @input="resize"
        @keydown.enter.prevent="sendMessage"
      />
      <!-- Emoji -->
      <i
        v-if="!disableChat ? true : false"
        id="meeting-composer-emoji"
        class="ch-icons-reaction ch-icons"
        tabindex="-1"
        @click="showEmoji = !showEmoji"
      />
      <app-emoji-picker
        :show="showEmoji"
        target="meeting-composer-emoji"
        placement="right"
        @selected="onEmojiSelection"
      />
      <cs-button
        fill="clear"
        class="cs-button"
        :disabled="emptyMessage"
        @click="sendMessage"
      >
        <i class="cs-icons-send-filled send-icon" />
      </cs-button>
    </div>
  </div>
</template>
<script>
import $socket from '@/services/socket';
import $auth from '@/services/auth';

import AppMeetingChatMessage from '@/components/meetings/MeetingChatMessage.vue';
import AppInfiniteSimple from '@/components/general/InfiniteSimple.vue';
import AppEmojiPicker from '@/components/general/EmojiPicker.vue';
import AppAvatar from '@/components/general/Avatar.vue';

import SendMeetingMessage from '@/gql/meetings/SendMeetingMessage.gql';
import ListMeetingMessages from '@/gql/meetings/ListMeetingMessages.gql';

export default {
  components: {
    AppMeetingChatMessage,
    AppInfiniteSimple,
    AppEmojiPicker,
    AppAvatar,
  },
  props: {
    meeting: {
      type: Object,
      required: true,
    },
  },
  apollo: {
    messages: {
      query: ListMeetingMessages,
      variables() {
        return {
          meetingId: this.meeting.id,
        };
      },
    },
  },
  data() {
    return {
      user: null,
      draftMessage: '',
      showEmoji: false,
      hasScrolledToBottom: true,
      showUser: null,
    };
  },
  computed: {
    emptyMessage() {
      return !this.draftMessage;
    },
    displayMessages() {
      return this.messages && this.messages.slice(0, 500);
    },
    disableChat() {
      return (
        this.meeting.status === 'TRANSCODING' || this.meeting.status === 'ENDED'
      );
    },
  },
  watch: {
    messages() {
      this.scrollToBottomOnMessages();
    },
  },
  async beforeMount() {
    this.user = await $auth.getUser();
  },
  mounted() {
    $socket.onRoom('meeting', this.meeting.id, 'meeting-chat-modified', () => {
      this.$apollo.queries.messages.refetch();
    });
  },
  methods: {
    scrollToBottomOnMessages() {
      const el = this.$refs.messages;
      if (el.scrollTop >= 0 && el.scrollTop < 400) {
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },
    scrollToBottom() {
      const el = this.$refs.messages;
      // scrollTop reversed according to .meeting-chat-messages has flex-direction: column-reverse;
      el.scrollTop = 1;
    },
    resize() {
      const el = this.$refs.meetingChatComposerInput;
      el.style.height = '36px';
      el.style.height = `${el.scrollHeight}px`;
    },
    onEmojiSelection(emoji) {
      const textarea = this.$refs.meetingChatComposerInput;
      const cursorPos = textarea.selectionStart;
      const beforeText = this.draftMessage.substring(0, cursorPos);
      const afterText = this.draftMessage.substring(
        cursorPos,
        this.draftMessage.length
      );
      this.draftMessage = `${beforeText}${emoji}${afterText}`;
    },
    onMessageDelete() {
      $socket.sendRoom('meeting', this.meeting.id, 'meeting-chat-modified');
    },
    async sendMessage() {
      if (this.emptyMessage) return;
      const vars = {
        meetingId: this.meeting.id,
        bodyText: this.draftMessage,
      };
      this.draftMessage = '';
      try {
        await this.$apollo.mutate({
          mutation: SendMeetingMessage,
          variables: vars,
        });
        $socket.sendRoom('meeting', this.meeting.id, 'meeting-chat-modified');
        this.scrollToBottom();
        this.resize();
      } catch (e) {
        if (e.message === 'Authentication failed!') {
          this.$emit('confirm-modal');
        }
        throw e;
      }
    },
    openSignupModal() {
      this.$emit('signup');
    },
  },
};
</script>
<style scoped>
.meeting-chat {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  background-color: var(--cs-gray-00);
}
.meeting-chat-messages {
  display: flex;
  flex: 1;
  overflow: auto;
  flex-direction: column-reverse;
  flex-wrap: nowrap;
  padding: 0 10px 0;
}
.meeting-chat-composer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 10px;
  box-shadow: 0 -4px 4px 0 rgba(0, 0, 0, 0.15);
}

.meeting-chat-composer .send-icon {
  color: var(--cs-primary-base);
  font-size: 20px;
}
.cs-button {
  --cs-button-padding: 0px !important;
}

.meeting-chat-input {
  flex: 1;
  padding: 8px 10px 0;
  height: 36px;
  font-size: 16px;
  background-color: #f5f7f6;
  border-radius: 8px;
  border: none;
}

.meeting-chat-input:focus {
  outline: none;
}
</style>
