<template>
<div class="post-chat-wrapper">
  <div class="post-chat">
      <div v-if="messages" ref="messages" class="post-chat-messages" v-chat-scroll @scroll="handleScroll">
        <app-meeting-chat-message
          v-for="message in displayMessages"
          :message="message"
          :key="message.id"
          :postId="postId"
          :is-author="isAuthor"
          @click="$emit('showProfile', message.postedByUser)"
        ></app-meeting-chat-message>
        <app-infinite-simple
          :query="$apollo.queries.messages"
          sortKey="createdAt"
        ></app-infinite-simple>
      </div>
      <div class="post-chat-composer">
        <textarea
          v-model="draftMessage"
          @keydown.enter.prevent="sendMessage"
          class="post-chat-input"
          placeholder="Write something..."
          ref="composer"
        />
        <!-- Emoji -->
        <i
          class="ch-icons-reaction ch-icons"
          @click="showEmoji = !showEmoji"
          id="post-composer-emoji"
          tabindex="-1"
        />
        <app-emoji-picker
          :show="showEmoji"
          target="post-composer-emoji"
          @selected="onEmojiSelection"
          placement="right"
        />
        <cs-button
          fill="clear"
          class="cs-button"
          @click="sendMessage"
          :disabled="emptyMessage"
        >
          <i class="cs-icons-send-filled send-icon" />
        </cs-button>
      </div>
    </div>
  </div>
</template>

<script>
import ListPostMessages from '@/gql/live/ListPostMessages.gql';
import InsertPostMessage from '@/gql/live/InsertPostMessage.gql';
import AppEmojiPicker from '@/components/general/EmojiPicker.vue';
import $socket from '@/services/socket';
import AppMeetingChatMessage from '@/components/meetings/MeetingChatMessage.vue';
import AppInfiniteSimple from '@/components/general/InfiniteSimple.vue';

export default {
  props: {
    postId: {
      type: String,
      required: true,
    },
    isAuthor: {
      type: Boolean
    }
  },
  components: {
    AppEmojiPicker,
    AppMeetingChatMessage,
    AppInfiniteSimple
  },
  apollo: {
    messages: {
      query: ListPostMessages,
      variables() {
        return {
          postId: this.postId,
        };
      },
      fetchPolicy: 'network-only',
    },
  },
  data() {
    return {
      draftMessage: '',
      showEmoji: false,
      hasScrolledToBottom: true,
      showUser: null,
      hasScrolledToBottom: true,
    };
  },
  computed: {
    emptyMessage() {
      return !this.draftMessage;
    },
    displayMessages() {
      return this.messages && this.messages.slice(0, 500);
    },
  },
   async mounted() {
    $socket.onRoom('post', this.postId, 'post-chat-modified', () => {
      console.log('Refresh Messages');
      this.$apollo.queries.messages.refetch();
      if(this.hasScrolledToBottom) {
        const container = this.$refs.messages;
        if(container) container.scrollTop = container.scrollHeight;
      }
    });
  },
  methods: {
    handleScroll: function(el) {
      if(el.target.scrollTop === 0) {
        this.hasScrolledToBottom = true;
      } else {
        this.hasScrolledToBottom = false
      }
    },
    onEmojiSelection(emoji) {
      const textarea = this.$refs.composer;
      const cursorPos = textarea.selectionStart;
      const beforeText = this.draftMessage.substring(0, cursorPos);
      const afterText = this.draftMessage.substring(
        cursorPos,
        this.draftMessage.length
      );
      this.draftMessage = `${beforeText}${emoji}${afterText}`;
    },
    async sendMessage() {
      if (this.emptyMessage) return;
      const vars = {
        postId: this.postId,
        bodyText: this.draftMessage,
      };
      this.draftMessage = '';
        await this.$apollo.mutate({
          mutation: InsertPostMessage,
          variables: vars,
        });
        $socket.sendRoom('post', this.postId, 'post-chat-modified');
    },
  },
}
</script>


<style scoped>
.post-chat-wrapper
{
  background-color: white;
  padding: 10px;
}
.post-chat {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  /* height: 100%; */
  position: relative;
  height: 340px;
  overflow: scroll;
  background-color: var(--cs-gray-00);
}
.post-chat-messages {
  display: flex;
  flex: 1;
  overflow: auto;
  flex-direction: column-reverse;
  flex-wrap: nowrap;
  margin-bottom: 70px;
}
.post-chat-composer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  position: absolute;
  bottom: 0;
  width: 100%;
}
.post-chat-input {
  flex: 1;
  padding: 10px;
  border: solid 1px var(--cs-gray-01);
}
.post-chat-composer .send-icon {
  color: var(--cs-primary-base);
  font-size: 20px;
}
.cs-button {
  --cs-button-padding: 0px !important;
}
</style>
