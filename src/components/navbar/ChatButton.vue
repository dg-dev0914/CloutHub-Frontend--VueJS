<template>
  <div>
    <div class="ch-chat-button">
      <i
        id="navbarChatIcon"
        class="ch-icons-message"
        tabindex="-1"
        :class="{ selectedIcon: highlight }"
      ></i>
      <div v-if="hasUnseenMessages" class="ch-new-content-indicator"></div>
    </div>
    <b-popover
      ref="chatPopover"
      target="navbarChatIcon"
      placement="leftbottom"
      triggers="click blur"
      @show="showPopover"
    >
      <div class="chat-header menu-popover-title">
        <div class="cs-textstyle-detail-heading">Messages</div>
        <i class="ch-icons-new-message ch-icons" @click="openNewMessageModal" />
      </div>
      <div v-if="!conversations">
        <app-spinner />
      </div>
      <div v-if="conversations">
        <conversation-item
          v-for="(conversation, $index) in filteredConversations"
          :key="conversation.conversationId + $index"
          v-router-link="{
            name: 'ConversationDetail',
            params: {
              type: type(conversation.otherParty.myRelationship),
              conversationId: conversation.conversationId,
            },
          }"
          class="message-item cursor-pointer"
          :conversation="conversation"
          @click="closeChatPopover"
        >
        </conversation-item>
      </div>
      <!-- When conversation List is empty -->
      <div
        v-if="
          conversations &&
          filteredConversations &&
          filteredConversations.length === 0
        "
      >
        <cs-empty-state>
          <div slot="title" class="empty-slot-title">No Messages</div>
          <div slot="description" class="empty-slot-desc">
            No one has messaged you yet.
          </div>
          <div slot="button">
            <cs-button size="small" @click="openNewMessageModal"
              >Start Conversation</cs-button
            >
          </div>
        </cs-empty-state>
      </div>
      <router-link
        v-if="
          conversations &&
          filteredConversations &&
          filteredConversations.length > 0
        "
        :to="{ name: 'Conversations', params: { type: 'friend' } }"
      >
        <div
          class="menu-popover-more cs-textstyle-detail-heading"
          @click="closeChatPopover"
        >
          View All Conversations
        </div>
      </router-link>
    </b-popover>
  </div>
</template>

<script>
import $auth from '@/services/auth';
import $bus from '@/services/bus';

import ConversationItem from '@/components/conversations/ConversationItem.vue';
import AppSpinner from '@/components/general/Spinner.vue';
import ListConversations from '@/gql/conversations/ListConversations.gql';

// Subscription imports
import NewMessageSubscription from '@/gql/conversations/NewMessageSubscription.gql';
import ConversationsUpdatedSubscription from '@/gql/conversations/ConversationsUpdatedSubscription.gql';

export default {
  components: {
    ConversationItem,
    AppSpinner,
  },
  apollo: {
    conversations: {
      query: ListConversations,
      variables() {
        return {
          userId: $auth.getUserId(),
        };
      },
    },
  },
  data() {
    return {
      lastSeenMessageTime: localStorage.lastSeenMessageTime,
      subscription: null, // New data property
    };
  },
  computed: {
    hasUnseenMessages() {
      let newMsg = false;
      if (this.filteredConversations && this.filteredConversations.length) {
        this.filteredConversations.forEach((data) => {
          if (
            data.latestMessage &&
            data.latestMessage.senderId === data.otherParty.id &&
            new Date(data.latestMessage.msgCreateTime).getTime() >
              this.lastSeenMessageTime
          ) {
            newMsg = true;
          }
        });
      }
      return newMsg;
    },
    filteredConversations() {
      if (this.conversations) {
        const filterConversations = this.conversations.filter(
          (t) => t.otherParty
        );
        return (
          filterConversations &&
          filterConversations
            .filter(
              (conversation) =>
                conversation.otherParty.myRelationship &&
                !conversation.otherParty.myRelationship.isBlocked &&
                conversation.otherParty.myRelationship.isFriend
            )
            .slice(0, 5)
        );
      }
      return [];
    },
    highlight() {
      return (
        this.$route.name === 'Conversations' ||
        this.$route.name === 'ConversationDetail'
      );
    },
  },
  methods: {
    showPopover() {
      localStorage.lastSeenMessageTime = Date.now();
      this.lastSeenMessageTime = localStorage.lastSeenMessageTime;
    },
    openNewMessageModal() {
      $bus.$emit('new-message-modal', {});
      this.closeChatPopover();
    },
    closeChatPopover() {
      this.$refs.chatPopover.$emit('close');
    },
    type(relationship) {
      if (!relationship.isFriend) {
        return 'others';
      }
      return 'friend';
    },
  },  
  created() {
    this.subscription = this.$apollo.queries.conversations.subscribeToMore({
      document: NewMessageSubscription,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newMessage = subscriptionData.data.newMessage;
        const updatedConversations = prev.conversations.map((conversation) => {
          if (conversation.conversationId === newMessage.conversationId) {
            conversation.messages.push(newMessage);
          }
          return conversation;
        });
        return { conversations: updatedConversations };
      },
    });

    this.$apollo.queries.conversations.subscribeToMore({
      document: ConversationsUpdatedSubscription,
      variables: {
        receiverId: $auth.getUserId(),
      },

      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const updatedConversation = subscriptionData.data.conversationsUpdated;
        if (updatedConversation.userId === $auth.getUserId()) {
          this.$apollo.queries.conversations.refetch();
        }
      },
    });

  },
  beforeDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  },
  mounted() {
    this.$apollo.queries.conversations.subscribeToMore({
      document: ConversationsUpdatedSubscription,
      variables: {
        receiverId: $auth.getUserId(),
      },

      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const updatedConversation = subscriptionData.data.conversationsUpdated;
        if (updatedConversation.userId === $auth.getUserId()) {
          this.$apollo.queries.conversations.refetch();
        }
      },
    });
  },
};
</script>

<style scoped>
.chat-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
.message-item {
  border-bottom: 1px solid var(--cs-gray-02);
}
.ch-chat-button {
  display: flex;
}
.ch-icons {
  font-size: 24px;
  color: var(--cs-gray-05);
  cursor: pointer;
}
.ch-new-content-indicator {
  width: 10px;
  position: absolute;
  height: 10px;
  background: var(--cs-primary-base);
  border-radius: 25px;
  margin-left: 15px;
}
</style>
