<template>
  <div class="ch-message-details">
    <div v-if="conversation" class="ch-message-details">
      <!-- Message Header -->
      <div class="message-header">
        <div
          class="message-header__info"
          @click="viewUser(conversation.otherParty)"
        >
          <app-avatar
            size="small"
            :name="conversation.otherParty.displayname"
            :picture="conversation.otherParty.profilePhotoURL"
          />
          <div class="message-header__name">
            <span>
              <app-username
                :user="conversation.otherParty"
                type="displayname"
              />
            </span>
            <span>{{ conversation.otherParty.username }}</span>
          </div>
        </div>
        <div class="message-header__option">
          <app-context-menu>
            <app-context-menu-item @click="blockUser(conversation.otherParty)">
              Block <app-username :user="conversation.otherParty" />
            </app-context-menu-item>
            <app-context-menu-item
              @click="reportUser(conversation.otherParty.id)"
            >
              Report <app-username :user="conversation.otherParty" />
            </app-context-menu-item>
            <app-context-menu-item @click="showDeleteConversationModal = true"
              >Delete conversation</app-context-menu-item
            >
          </app-context-menu>
        </div>
      </div>
      <!-- Message Body -->
      <div ref="msgList" class="message-body">
        <div v-for="(message, index) in messages" :key="message.id + index">
          <app-conversation-message
            class="convo-msg"
            :message="message"
            :prev-message="messages[index + 1]"
            :next-message="messages[index - 1]"
          />
        </div>
        <!-- For Loading Older Messages -->
        <app-infinite-simple
          :query="$apollo.queries.messages"
          sort-key="msgCreateTime"
        />
      </div>
      <!-- Message footer -->
      <div class="message-footer">
        <app-conversation-composer
          :id="id"
          :receiver="conversation.otherParty"
          :conversation-id="conversation.conversationId"
          emoji-target="emoji-detail"
          attachment-type-target="attachment-detail"
        />
      </div>
    </div>
    <!-- Delete Message Confirm Popup -->
    <app-popup
      :show="showDeleteConversationModal"
      type="confirm"
      variant="danger"
      ok-label="Delete"
      title="Delete Conversation"
      message="Are you sure you wish to delete this conversation?"
      @close="showDeleteConversationModal = false"
      @ok="deleteConversation(conversation)"
    />
  </div>
</template>

<script>
import $auth from '@/services/auth';
import $bus from '@/services/bus';

// Components
import AppConversationMessage from '@/components/conversations/ConversationMessage.vue';
import AppInfiniteSimple from '@/components/general/InfiniteSimple.vue';
import AppConversationComposer from '@/components/conversations/ConversationComposer.vue';
import AppAvatar from '@/components/general/Avatar.vue';
import AppContextMenu from '@/components/general/ContextMenu.vue';
import AppContextMenuItem from '@/components/general/ContextMenuItem.vue';
import AppUsername from '@/components/general/Username.vue';
import AppPopup from '@/components/general/Popup.vue';
// GQL
import GetConversation from '@/gql/conversations/GetConversation.gql';
import ListConversationMessages from '@/gql/conversations/ListConversationMessages.gql';
import MarkConversationAsRead from '@/gql/conversations/MarkConversationAsRead.gql';
import DeleteConversation from '@/gql/conversations/DeleteConversation.gql';
import ConversationReadFragment from '@/gql/fragments/ConversationRead.gql';
import ConversationsUpdatedSubscription from '@/gql/conversations/ConversationsUpdatedSubscription.gql';

export default {
  components: {
    AppConversationMessage,
    AppInfiniteSimple,
    AppAvatar,
    AppConversationComposer,
    AppContextMenu,
    AppContextMenuItem,
    AppUsername,
    AppPopup,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      showDeleteConversationModal: false,
    };
  },
  apollo: {
    conversation: {
      query: GetConversation,
      variables() {
        return {
          participantId: `${$auth.getUserId()}@${this.id}`,
        };
      },
    },
    messages: {
      query: ListConversationMessages,
      variables() {
        return {
          conversationId: this.id,
        };
      },
    },
  },
  async mounted() {
    this.$apollo.queries.messages.refetch();
    this.callMarkConversationRead();
  },
  created() {
    this.$apollo.queries.messages.subscribeToMore({
      document: ConversationsUpdatedSubscription,
      variables: {
        receiverId: $auth.getUserId(),
      },

      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const updatedConversation = subscriptionData.data.conversationsUpdated;
        if (updatedConversation.conversationId === this.id) {
          this.$apollo.queries.messages.refetch();
        }
      },
    });
  },

  methods: {
    reportUser(id) {
      const reportData = {
        id,
        type: 'user',
      };
      $bus.$emit('show-report-modal', reportData);
    },
    // Delete Conversation
    async deleteConversation(conversation) {
      await this.$apollo.mutate({
        mutation: DeleteConversation,
        variables: {
          conversationId: conversation.conversationId,
        },
        update: (_, { data: { deletedConversation } }) => {
          if (deletedConversation) {
            $bus.$emit('reload-conversation');
          }
        },
      });
    },
    viewUser(person) {
      this.$router.push({
        name: 'Profile',
        params: { id: person.id, tab: 'posts' },
      });
    },
    // Mark conversation as read
    async callMarkConversationRead() {
      const participantId = `${$auth.getUserId()}@${this.id}`;
      await this.$apollo.mutate({
        mutation: MarkConversationAsRead,
        variables: {
          id: participantId,
        },
        update: (cache, { data: { markedConversation } }) => {
          cache.writeFragment({
            id: cache.identify(markedConversation),
            fragment: ConversationReadFragment,
            data: {
              unreadCount: markedConversation.unreadCount,
            },
          });
        },
      });
    },
    async blockUser(userObj) {
      $bus.$emit('block-user-modal', {
        user: userObj,
      });
      //  $bus.$emit('reload-conversation');
    },
  },
};
</script>

<style scoped>
.ch-message-details {
  display: flex;
  flex-direction: column;
  flex: 1;
  background: white;
  height: calc(100vh - 100px);
}
.message-header {
  display: flex;
  flex-direction: row;
  padding: 15px;
  border-bottom: 1px solid var(--cs-gray-02);
  align-items: center;
  justify-content: space-between;
}
.message-header__info {
  display: flex;
  flex-direction: row;
  gap: 5px;
  cursor: pointer;
  align-items: center;
}
.message-header__name {
  display: flex;
  flex-direction: column;
}
.message-header__name > span:nth-child(1) {
  font-size: 16px;
  font-weight: bold;
}
.message-header__name > span:nth-child(2) {
  font-size: 12px;
  color: var(--cs-gray-05);
}
.message-header__option {
  color: var(--cs-gray-04);
  cursor: pointer;
}
.message-body {
  display: flex;
  flex-direction: column-reverse;
  overflow-y: scroll;
  padding: 25px;
  flex: 1;
}
.message-footer {
  border-top: 1px solid var(--cs-gray-02);
  background-color: var(--cs-gray-00);
}
</style>
