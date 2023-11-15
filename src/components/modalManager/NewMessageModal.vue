<template>
  <div class="new-msg-modal">
    <app-modal
      :show="showModal"
      class="msg-modal"
      title="New Message"
      @close="onCloseMsgModal"
    >
      <div class="msg-modal__body">
        <div>
          <!-- If the user is known -->
          <div v-if="user" class="input-box">
            <app-avatar
              v-if="user"
              :picture="user.profilePhotoURL"
              :name="user.displayname"
              size="small"
            >
            </app-avatar>
            <cs-input disabled :value="user.displayname" class="input" />
          </div>
          <!-- If the user is not known -->
          <div v-else class="input-box">
            <app-avatar
              v-if="selectedUser"
              :picture="selectedUser.profilePhotoURL"
              :name="selectedUser.displayname"
              size="small"
            >
            </app-avatar>
          <!-- Use v-model to bind selectedUser to app-user-select-search component -->
          <app-user-select-search
            placeholder="To: Enter username"
            :options="options"
            custom-search
            @query="findPeople"
            @select="onSelect"
          >
          </app-user-select-search>
          </div>
        </div>
        <div v-if="!loading" class="body-content-scrollable">
          <app-post-card v-if="post" :post="post" :preview="true" />
        </div>
        <div v-if="loading"><app-spinner /></div>
      </div>
      <div slot="footer" class="msg-modal__footer">
        <app-conversation-composer
          :shared-post="post"
          :shared-link="sharedLink"
          :receiver="selectedUser"
          :conversation-id="selectedConversationId"
          new-msg
          emoji-target="emoji-modal"
          attachment-type-target="attachment-modal"
          @closeNew="onCloseMsgModal"
        />
      </div>
    </app-modal>
  </div>
</template>

<script>
import $bus from '@/services/bus';
// Components
import AppConversationComposer from '@/components/conversations/ConversationComposer.vue';
import AppPostCard from '@/components/post/items/PostCard.vue';
import AppModal from '@/components/general/Modal.vue';
import AppAvatar from '@/components/general/Avatar.vue';
import AppUserSelectSearch from '@/components/conversations/UserSelectSearch.vue';
import AppSpinner from '@/components/general/Spinner.vue';
// GQL
import UserSearch from '@/gql/search/UserSearch.gql';
import GetConversation from '@/gql/conversations/GetConversation.gql'; // Import the GetConversation query


export default {
  components: {
    AppConversationComposer,
    AppPostCard,
    AppModal,
    AppAvatar,
    AppUserSelectSearch,
    AppSpinner,
  },
  props: {
    isMeeting: {
      type: Boolean,
      default: false,
    },
    meetingLink: {
      type: String,
    },
  },
  data() {
    return {
      options: [],
      newMessage: '',
      selectedUser: {},
      selectedConversationId: null, // New data property for conversation ID
      user: null,
      post: null,
      showModal: false,
      sharedLink: null,
      loading: false,
      searchQuery: null,
    };
  },
  apollo: {
      // Define the Apollo query to get the conversation
      conversation: {
      query: GetConversation,
      variables() {
        return {
          participantId: this.selectedUser ? this.selectedUser.id : null,
        };
      },
      skip() {
        return !this.selectedUser || !this.selectedUser.id;
      },
      result({ data }) {
        if (data && data.conversation) {
          // Update selectedConversationId based on the result of the query
          this.selectedConversationId = data.conversation.conversationId;
        } else {
          this.selectedConversationId = null;
        }
    },

    },

    users: {
      query: UserSearch,
      variables() {
        return {
          query: this.searchQuery,
        };
      },
      skip() {
        return !this.searchQuery;
      },
      result() {
        if (this.users) {
          this.options = this.users.map((result) => ({
            value: result,
            label: result.username,
          }));
        }
      },
    },
  },
  watch: {
    isMeeting() {
      this.meetingConfig();
    },
  },
  mounted() {
    $bus.$on('new-message-modal', (params) => {
      this.options = [];
      this.newMessage = '';
      this.selectedUser = null;
      this.post = null;
      this.user = null;
      this.sharedLink = null;
      this.searchQuery = null;
      if (params.user) {
        this.user = params.user;
        this.selectedUser = this.user;
      }
      if (params.post) {
        this.post = params.post;
      }
      if (params.link) {
        this.sharedLink = params.link;
      }
      this.showModal = true;
    });
    $bus.$on('message-start', () => {
      this.loading = true;
    });
    $bus.$on('message-end', () => {
      this.loading = false;
    });
  },
  methods: {
    reset() {
      this.options = [];
      this.newMessage = '';
      this.selectedUser = {};
      this.post = null;
      this.user = null;
      this.searchQuery = null;
      this.sharedLink = null;
    },

    meetingConfig() {
      this.showModal = true;
      this.selectedUser = null;
      this.sharedLink = this.meetingLink;
    },
    onCloseMsgModal() {
      this.showModal = false;
      this.$emit('close-share');
      this.reset();
    },
    findPeople(query) {
      this.searchQuery = query;
    },
    onSelect(option) { // Here, 'option' is equivalent to 'user' in your code
      console.log(option);
      this.selectedUser = option.value; // Update selectedUser based on the selected option
    },

  },
};
</script>

<style scoped>
.msg-modal__body {
  min-height: 240px;
}

.input-box >>> .cs-select-search__results {
  z-index: 1000;
  position: relative;
}

.input-box {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
}

.input {
  width: 100%;
}

.body-content-scrollable {
  padding: 25px;
}

.msg-modal >>> .conversation-composer {
  padding: 0;
}
</style>
