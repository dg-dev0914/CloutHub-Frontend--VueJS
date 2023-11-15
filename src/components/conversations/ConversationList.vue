<template>
  <div class="list-container">
    <div class="list-buttons">
      <cs-button
        fill="clear"
        :to="{ name: 'Conversations', params: { type: 'friend' } }"
        :variant="friendsView ? 'primary' : 'secondary'"
        @click="showFriendList"
      >
        Friends
      </cs-button>
      <cs-button
        fill="clear"
        :to="{ name: 'Conversations', params: { type: 'others' } }"
        :variant="friendsView ? 'secondary' : 'primary'"
        @click="showOtherList"
      >
        Others
      </cs-button>
      <cs-button fill="clear" variant="default" @click="openNewMessageModal"
        ><i class="ch-icons-new-message ch-icons"></i
      ></cs-button>
    </div>
    <div class="other-conversation-option-toggle">
      <app-toggle
        v-if="!friendsView"
        :value="showOtherMessages"
        label-checked="Allow non-friends to message me"
        label-unchecked="Allow non-friends to message me"
        @change="$emit('toggleAllowOtherMessages')"
      />
    </div>
    <div v-if="friendsView || showOtherMessages">
      <app-conversation-item
        v-for="conversation in conversationList"
        :key="conversation.conversationId"
        :selected="conversation === selectedConversation"
        :conversation="conversation"
        @click="selectConversation(conversation)"
      ></app-conversation-item>
      <app-infinite-simple
        :query="$apollo.queries.conversations"
        sortKey="msgCreateTime"
      />
      <div v-if="conversationList.length === 0" class="empty-list">
        <cs-empty-state>
          <div slot="title" class="empty-slot-title">No Messages Found</div>
          <div slot="description" class="empty-slot-desc">
            Check the other tab
          </div>
        </cs-empty-state>
      </div>
    </div>
  </div>
</template>

<script>
import $auth from '@/services/auth';
import $bus from '@/services/bus';
import AppConversationItem from '@/components/conversations/ConversationItem.vue';
import AppInfiniteSimple from '@/components/general/InfiniteSimple.vue';
import ListConversations from '@/gql/conversations/ListConversations.gql';
import NewMessageSubscription from '@/gql/conversations/NewMessageSubscription.gql';
import AppToggle from '@/components/general/CsToggle.vue';

export default {
  components: {
    AppConversationItem,
    AppInfiniteSimple,
    AppToggle,
  },
  props: {
    showOtherMessages: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  apollo: {
    conversations: {
      query: ListConversations,
    },
  },
  data() {
    return {
      friendsView: true,
      selectedConversation: null,
      conversationList: [],
      isConversationDeleted: false,
      subscription: null,
    };
  },
  created() {
  this.$watch(
    () => this.$apollo.loading,
    (loading) => {
      if (!loading) {
        return this.$route.params.type === 'friend'
          ? this.showFriendList()
          : this.showOtherList();
      }
    },
  );

  this.subscription = this.$apollo.queries.conversations.subscribeToMore({
    document: NewMessageSubscription,
    variables: { conversationId: this.$route.params.conversationId },
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
},
  mounted() {
    $bus.$on('reload-conversation', async () => {
      this.isConversationDeleted = true;
      await this.$apollo.queries.conversations.refetch();
    });
  },
  updated() {
    if (!this.subscription) {
      this.subscription = this.$apollo.queries.conversations.subscribeToMore({
        document: NewMessageSubscription,
        variables: { conversationId: this.$route.params.conversationId },
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
    }
  },
  beforeDestroy() {
    if (this.subscription) {
      try {
        this.subscription.unsubscribe();
      } catch (error) {
        console.error('Error unsubscribing:', error);
      }
    }
  },
  methods: {
    openNewMessageModal() {
      $bus.$emit('new-message-modal', {});
    },
    async selectConversation(conversation) {
      this.selectedConversation = conversation;
      this.$router.push({
        name: 'ConversationDetail',
        params: {
          type: this.$route.params.type,
          conversationId: conversation.conversationId,
        },
      });
    },
    showFriendList() {
      this.friendsView = true;
      if (this.conversations) {
        const filteredConversations = this.conversations.filter(
          (t) => t.otherParty
        );
        this.conversationList = filteredConversations.filter(
          (c) =>
            c.otherParty.myRelationship &&
            c.otherParty.myRelationship.isFriend &&
            !c.otherParty.myRelationship.isBlocked
        );
        this.whichConversationToSelect();
      }
    },
    showOtherList() {
      this.friendsView = false;
      if (this.conversations) {
        const filteredConversations = this.conversations.filter(
          (t) => t.otherParty
        );
        this.conversationList = filteredConversations.filter(
          (c) =>
            !c.otherParty.myRelationship ||
            (!c.otherParty.myRelationship.isFriend &&
              !c.otherParty.myRelationship.isBlocked)
        );
        this.whichConversationToSelect();
      }
    },
    whichConversationToSelect() {
      if (
        !this.$route.params.conversationId &&
        this.conversationList.length > 0 && !this.isConversationDeleted) {
        this.selectConversation(this.conversationList[0]);
        this.selectedConversation = this.conversationList[0];
        } else if (
        this.$route.params.conversationId &&
        this.conversationList.length > 0 &&
        !this.isConversationDeleted
        ) {
        const id = this.$route.params.conversationId;
        const selectedConversationList = this.conversationList.filter(
        (c) => c.conversationId === id
        );
        this.selectedConversation = selectedConversationList[0];
        } else {
        this.$router.push({
        name: 'ConversationEmptyState',
        });
        }
  // When Conversation is deleted
  if (this.isConversationDeleted && this.conversationList.length === 0) {
    this.$router.push({
      name: 'ConversationEmptyState',
    });
    this.isConversationDeleted = false;
  } else if (
    this.isConversationDeleted &&
    this.conversationList.length > 0
  ) {
    this.selectConversation(this.conversationList[0]);
    this.selectedConversation = this.conversationList[0];
    this.isConversationDeleted = false;
  }
},
},
};
</script>

<style scoped>
.conversation-container {
  width: 280px;
  max-width: 280px;
  height: calc(100vh - 173px);
  overflow: auto;
  border-right: 1px solid var(--cs-gray-02);
}
.list-buttons {
  display: flex;
  padding: 17px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--cs-gray-02);
  border-right: 1px solid var(--cs-gray-02);
}
.list-buttons .cs-button {
  padding: 6px 10px !important;
}
.ch-icons {
  font-size: 26px;
  color: var(--cs-gray-05);
  cursor: pointer;
}
.other-conversation-option-toggle {
  padding: 10px;
}
.list-container {
  border-right: 1px solid var(--cs-gray-02);
}
</style>
