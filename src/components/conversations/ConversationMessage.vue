<template>
  <div :class="incomingOutgoingClass" class="conversation-message">
    <div
      v-if="firstForDate"
      class="conversation-message__section-date cs-textstyle-paragraph-small"
    >
      <div class="conversation-message__section-divider">
        <div class="divider-line"></div>
      </div>
      <div>{{ sectionDate }}</div>
      <div class="conversation-message__section-divider">
        <div class="divider-line"></div>
      </div>
    </div>
    <div class="conversation-message__row">
      <app-avatar
        v-if="showAvatar"
        class="avatar"
        :picture="message.sender.profilePhotoURL"
        :name="message.sender.displayname"
        size="small"
      />
      <app-conversation-message-content
        :class="outgoing ? marginOutgoingAvatar : marginIncomingAvatar"
        :message="message"
        :outgoing="outgoing"
        :indicator="showAvatar"
      />
    </div>
    <div
      v-if="lastFromSender"
      class="conversation-message__last-time ch-textstyle-paragraph-extra-small"
    >
      {{ lastTime }}
    </div>
  </div>
</template>

<script>
import $auth from '@/services/auth';
// Component
import AppAvatar from '@/components/general/Avatar.vue';
import AppConversationMessageContent from '@/components/conversations/ConversationMessageContent.vue';

export default {
  components: {
    AppConversationMessageContent,
    AppAvatar,
  },
  props: {
    message: {
      type: Object,
      required: true,
    },
    nextMessage: {
      type: Object,
      required: false,
      default: null,
    },
    prevMessage: {
      type: Object,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      lightboxIndex: 0,
      showLightbox: false,
    };
  },
  computed: {
    outgoing() {
      return this.message.sender.id === $auth.getUserId();
    },
    incomingOutgoingClass() {
      return this.outgoing
        ? 'conversation-message--outgoing'
        : 'conversation-message--incoming';
    },
    firstFromSender() {
      if (!this.prevMessage) return true;
      return this.prevMessage.sender.id !== this.message.sender.id;
    },
    lastFromSender() {
      if (!this.nextMessage) return true;
      return this.nextMessage.sender.id !== this.message.sender.id;
    },
    firstForDate() {
      if (!this.prevMessage) return true;
      const prevDate = new Date(this.prevMessage.msgCreateTime)
        .toISOString()
        .split('T')[0];
      const thisDate = new Date(this.message.msgCreateTime)
        .toISOString()
        .split('T')[0];
      return prevDate !== thisDate;
    },
    sectionDate() {
      const dateParts = new Date(this.message.msgCreateTime)
        .toDateString()
        .split(' ');
      return `${dateParts[2]} ${dateParts[1]}, ${dateParts[3]}`;
    },
    showAvatar() {
      return this.firstFromSender || this.firstForDate;
    },
    marginIncomingAvatar() {
      return !this.outgoing && !this.showAvatar
        ? 'conversation-message__content-margin--no-avatar'
        : 'conversation-message__content-margin--avatar';
    },
    marginOutgoingAvatar() {
      return this.outgoing && !this.showAvatar
        ? 'conversation-message-outgoing__content-margin--no-avatar'
        : 'conversation-message-outgoing__content-margin--avatar';
    },
    lastTime() {
      const date = new Date(this.message.msgCreateTime);
      return date.toLocaleTimeString('en-US', {
        hour12: true,
        hour: 'numeric',
        minute: 'numeric',
      });
    },
  },
};
</script>

<style scoped>
.conversation-message {
  margin-top: 5px;
}
.conversation-message__section-date {
  display: flex;
  padding-bottom: 25px;
  text-align: center;
  color: var(--cs-gray-04);
}
.conversation-message__row {
  display: flex;
}
.conversation-message--incoming .conversation-message__row {
  flex-direction: row;
  margin-right: 50px;
}
.conversation-message--outgoing .conversation-message__row {
  flex-direction: row-reverse;
  margin-left: 50px;
}
.conversation-message__content-margin--avatar {
  margin-left: 10px;
}
.conversation-message__content-margin--no-avatar {
  margin-left: 45px;
}
.conversation-message-outgoing__content-margin--avatar {
  margin-right: 10px;
}
.conversation-message-outgoing__content-margin--no-avatar {
  margin-right: 45px;
}
.conversation-message__last-time {
  margin-top: 5px;
  margin-bottom: 15px;
  color: var(--cs-gray-05);
}
.conversation-message--incoming .conversation-message__last-time {
  margin-left: 45px;
  text-align: left;
}
.conversation-message--outgoing .conversation-message__last-time {
  margin-right: 45px;
  text-align: right;
}
.conversation-message__section-divider {
  flex: 1;
  padding: 0 5px;
}
.divider-line {
  height: 50%;
  border-bottom: 1px solid var(--cs-gray-02);
}
</style>
