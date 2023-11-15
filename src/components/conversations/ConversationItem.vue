<template>
  <div class="ch-message-item">
    <cs-conversation-item
      :class="{ 'conversation-selected': selected }"
      :subject="conversation.otherParty.displayname"
      :picture="cdn(conversation.otherParty.profilePhotoURL)"
      :message="previewMessage"
      :unread-count="conversation.unreadCount"
      :date="previewDate"
    >
    </cs-conversation-item>
  </div>
</template>

<script>
import $auth from '@/services/auth';
import $cdn from '@/services/cdn';

export default {
  props: {
    conversation: {
      type: Object,
      required: true,
    },
    selected: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    previewMessage() {
      const latestMessage = JSON.parse(
        JSON.stringify(this.conversation.latestMessage)
      );
      if (!latestMessage) return '(No messages)';
      if (
        latestMessage.msgBody === '' &&
        (latestMessage.video || latestMessage.images || latestMessage.document)
      ) {
        latestMessage.msgBody = 'Sent an attachment';
      } else if (latestMessage.msgBody === '' && latestMessage.postId) {
        latestMessage.msgBody = 'Shared post';
      }
      const prefix =
        latestMessage.senderId === $auth.getUserId() ? 'You: ' : '';
      return `${prefix}${latestMessage.msgBody}`;
    },
    previewDate() {
      const latestMessage = JSON.parse(
        JSON.stringify(this.conversation.latestMessage)
      );
      if (latestMessage) return latestMessage.msgCreateTime;
      return this.conversation.msgCreateTime || null;
    },
  },
  methods: {
    cdn(url) {
      if (!url) return;
      // eslint-disable-next-line consistent-return
      return $cdn.optimize(url, null, 50, 50);
    },
  },
};
</script>

<style scoped>
.conversation-selected {
  background: var(--cs-primary-lightest) !important;
}

.ch-message-item > * {
  cursor: pointer;
}

.ch-message-item >>> .cs-conversation-item {
  padding: 12px;
  background-color: var(--cs-gray-00);
}

.ch-message-item
  >>> .cs-conversation-item__sender-details
  .cs-conversation-item__subject {
  font-weight: var(--cs-font-weight-medium);
}

.ch-message-item
  >>> .cs-conversation-item__sender-details
  .cs-conversation-item__message {
  display: -webkit-box;
  max-width: 200px;
  padding-top: 0px;
  white-space: pre-line;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ch-message-item
  >>> .cs-conversation-item:not(.cs-conversation-item--highlight):after {
  background: none;
}

.ch-message-item >>> .cs-avatar--medium {
  --cs-avatar-size: 35px;
  --cs-avatar-font-size: 12px;
  --cs-avatar-border-width: 1px;
}

.ch-message-item >>> .cs-conversation-item__right {
  width: 50px;
}
</style>
