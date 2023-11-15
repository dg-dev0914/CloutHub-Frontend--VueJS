<template>
  <div class="conversation-bottom">
    <div class="conversation-composer">
      <!-- Attachment Icons -->
      <div class="composer__icons">
        <!-- Attachment Types -->
        <i
          v-if="!sharedPost"
          :id="attachmentTypeTarget"
          :disabled="!allowMessaging"
          class="ch-icons-attach ch-icons"
          tabindex="-1"
          @click="showAttachmentType = !showAttachmentType"
        />
        <app-conversation-attachment-type
          v-if="!sharedPost"
          :target="attachmentTypeTarget"
          @attach="attach"
          @open="openGIFsModal"
        />
        <!-- Emoji -->
        <i
          :id="emojiTarget"
          :disabled="!allowMessaging"
          class="ch-icons-reaction ch-icons"
          tabindex="-1"
          @click="openEmojiPopup"
        ></i>
        <app-emoji-picker
          :show="showEmoji"
          :target="emojiTarget"
          placement="top"
          @selected="onEmojiSelection"
        />
      </div>
      <!-- Composer -->
      <!-- TODO should we show a character counter here? -->
      <app-textarea
        ref="composer"
        v-model="message"
        :placeholder="
          allowMessaging || !receiver
            ? sharedLink
              ? 'Select user first to share link'
              : 'Type a new message...'
            : `${receiver.displayname} does not allow non-friends to send private messages`
        "
        class="conversation-textarea"
        rows="1"
        :disabled="loadingAttachment || !allowMessaging"
        :maxlength="1000"
        @input="handleInput(false)"
        @keydown.native.enter.exact.prevent="sendMessage"
      />
      <!-- Send Button -->
      <cs-button
        :disabled="emptyMessage"
        fill="clear"
        class="cs-button"
        @click="sendMessage"
      >
        <i class="cs-icons-send-filled"></i>
      </cs-button>
    </div>
    <!-- Attachments/Links Container -->
    <div
      v-if="!!attachment || attachedImages.length > 0 || !!link"
      class="message-attachments-wrapper"
    >
      <div class="message-attachments">
        <div
          v-if="link"
          class="message-link"
          :class="{ 'message-link__details': !newMsg }"
        >
          <app-link-preview
            :title="link.title"
            :src="link.url"
            :description="link.details"
            :picture="link.image"
            @remove="removeLink"
          />
        </div>
        <app-attachments
          :attached-image="attachedImages"
          :attachment="attachment"
          @remove="removeAttachments"
        />
      </div>
      <div
        v-if="loadingAttachment"
        class="attachment-state"
        :class="{ 'attachment-state__modal': newMsg }"
      >
        <cs-spinner class="ch-spinner" />
        <app-aws-progress class="conversation-composer__upload-progress" />
      </div>
    </div>
    <div v-if="loadingLink"><cs-spinner /></div>
  </div>
</template>

<script>
import $bus from '@/services/bus';
import $utils from '@/services/utils';
import $upload from '@/services/upload';
// Components
import AppEmojiPicker from '@/components/general/EmojiPicker.vue';
import AppAttachments from '@/components/general/Attachments.vue';
import AppAwsProgress from '@/components/general/AwsProgress.vue';
import AppLinkPreview from '@/components/general/LinkPreview.vue';
import AppTextarea from '@/components/general/Textarea.vue';
import AppConversationAttachmentType from '@/components/conversations/ConversationAttachmentType.vue';
// GQL
import InsertConversationMessage from '@/gql/conversations/InsertConversationMessage.gql';
import InsertNewConversationMessage from '@/gql/conversations/InsertNewConversationMessage.gql';
import GetLinkPreview from '@/gql/general/GetLinkPreview.gql';

export default {
  components: {
    AppEmojiPicker,
    AppAttachments,
    AppAwsProgress,
    AppLinkPreview,
    AppTextarea,
    AppConversationAttachmentType,
  },
  props: {
    receiver: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    conversationId: {
      type: String,
      required: false,
      default: '',
    },
    sharedPost: {
      type: Object,
      required: false,
      default: null,
    },
    sharedLink: {
      type: String,
      required: false,
      default: '',
    },
    newMsg: {
      type: Boolean,
      default: false,
    },
    emojiTarget: {
      type: String,
      required: true,
    },
    attachmentTypeTarget: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      showEmoji: false,
      showAttachmentType: false,
      loadingAttachment: false,
      message: '',
      attachment: null,
      attachedImages: [],
      messageData: {},
      loadingLink: false,
      link: null,
      ignoredLinks: [],
      linkTimer: null,
      type: null,
    };
  },
  computed: {
    emptyMessage() {
      if (!this.loadingAttachment) {
        return !(
          this.allowMessaging &&
          (this.message ||
            this.attachedImages.length ||
            this.attachment ||
            this.link ||
            this.sharedPost)
        );
      }
      return true;
    },
    allowMessaging() {
      return (
        this.receiver &&
        (this.receiver.allowUnsolicitedMessages ||
          (this.receiver.myRelationship &&
            (this.receiver.myRelationship.isFriend ||
              this.receiver.myRelationship.isFollowing)))
      );
    },
    placeholder() {
      return this.allowMessaging || !this.receiver
        ? 'Type a new message...'
        : `${this.receiver.displayname} does not allow non-friends to send private messages`;
    },
  },
  watch: {
    $route() {
      this.reset();
    },
    receiver() {
      if (this.receiver && this.sharedLink && this.allowMessaging) {
        this.message = this.sharedLink;
      }
    },
  },
  beforeDestroy() {
    clearTimeout(this.linkTimer);
  },
  methods: {
    reset() {
      this.message = '';
      this.attachment = null;
      this.attachedImages = [];
      this.loadingAttachment = false;
      this.messageData = {};
      this.link = null;
      this.options = [];
    },
    // GIFs
    openGIFsModal() {
      $bus.$emit('show-select-gif-modal');
      $bus.$once('gif-modal-select', this.selectedGIF);
    },
    selectedGIF(gif) {
      const gifImage = {
        url: gif.url,
        name: 'Embedded Gif',
        type: 'image',
        contentType: 'image/gif',
      };
      this.attachedImages = [...this.attachedImages, gifImage];
    },
    // Emoji
    openEmojiPopup() {
      if (this.allowMessaging) {
        this.showEmoji = !this.showEmoji;
      }
    },
    onEmojiSelection(emoji) {
      const textarea = this.$refs.composer.$el.querySelector('textarea');
      const cursorPos = textarea.selectionStart;
      const beforeText = this.message.substring(0, cursorPos);
      const afterText = this.message.substring(cursorPos, this.message.length);
      this.message = `${beforeText}${emoji}${afterText}`;
    },
    // Links
    handleInput() {
      if (!this.message.length) {
        this.ignoredLinks = [];
        this.link = '';
      }
      if (!this.link) {
        clearTimeout(this.linkTimer);
        const links = this.message.match(
          /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g
        );
        if (links) {
          this.loadingLink = true;
          const notIgnoredLinks = links.filter(
            (link) => !this.ignoredLinks.includes(link)
          );
          if (notIgnoredLinks.length)
            this.linkTimer = setTimeout(
              () => this.detectLink(notIgnoredLinks[0]),
              700
            );
        }
      }
    },
    async detectLink(url) {
      this.link = null;
      const { data } = await this.$apollo.query({
        query: GetLinkPreview,
        variables: {
          url,
        },
      });
      const link = {
        ...data.link_preview,
        url,
      };
      delete link.__typename;
      this.loadingLink = false;
      this.link = link;
    },
    removeLink() {
      this.link = null;
    },
    // Attachments
    async attach(type) {
      try {
        if (type === 'image/*') {
          const files = await $utils.selectFiles(type);
          [...files].forEach((file) => {
            file.dataurl = URL.createObjectURL(file);
            this.attachedImages.push(file);
          });
          this.$emit('attachImage');
        } else {
          this.file = await $utils.selectFile(type);
          this.file.dataurl = URL.createObjectURL(this.file);
          this.attachment = this.file;
          this.$emit('attach');
        }
      } catch (error) {
        this.attachment = null;
      }
    },
    // Remove Docs and Videos and Images
    removeAttachments(image) {
      if (image) {
        this.attachedImages = this.attachedImages.filter(
          (img) => image !== img
        );
      } else {
        this.attachment = null;
      }
    },

    /** ****************************** QUERIES AND MUTATIONS *************************************** */
    // Send Message
    async sendMessage() {
      if (this.emptyMessage) return;
      this.loadingAttachment = true;

      try {
        if (this.newMsg) {
          $bus.$emit('message-start');
        }

        this.messageData = {
          msgBody: this.message,
          receiverId: this.receiver.id,
        };

        // Shared Post
        if (this.sharedPost) {
          this.messageData.postId = this.sharedPost.id;
        }

        // Links
        if (this.link) {
          this.messageData.linkPreview = { ...this.link };
        }

        // Videos and Documents
        if (this.attachment) {
          delete this.messageData.document;
          delete this.messageData.video;
          if (this.attachment.type === 'application/pdf') {
            this.messageData.document = await $upload.uploadDocument(this.file);
          }
          if (this.attachment.type.startsWith('video/')) {
            this.messageData.video = await $upload.uploadVideo(this.file);
          }
        }

        // Images
        if (this.attachedImages.length > 0) {
          this.messageData.images = await $upload.uploadImages(
            this.attachedImages
          );
        }

        if (this.conversationId) {
          await this.sendMsgToOldReceiver();
          this.reset();
        } else {
          await this.sendMsgToNewReceiver();
          this.reset();
          this.$emit('closeNew');
        }
      // Do no touch this unless you know what you're doing (fixes the focus after the message is sent)
      setTimeout(() => {
        this.$refs.composer.$el.focus();
      }, 50);

    } catch (e) {
        console.error(e);
        this.loadingAttachment = false;
      }
    },

    async sendMsgToNewReceiver() {

      if (
        this.receiver.myRelationship &&
        this.receiver.myRelationship.isFriend
      ) {
        this.type = 'friend';
      } else {
        this.type = 'others';
      }
      await this.$apollo.mutate({
        mutation: InsertNewConversationMessage,
        variables: this.messageData,
        update: (cache, { data: { newMessage } }) => {
          const cacheId = cache.identify(newMessage);
          cache.modify({
            fields: {
              list_conversations: (_, { toReference }) => toReference(cacheId),
            },
          });
          cache.modify({
            __typename: 'Post',
            id: this.sharedPost ? cache.identify(this.sharedPost.id) : null,
            fields: {
              sharedPostCount(prevCount) {
                return prevCount + 1;
              },
            },
          });
          $bus.$emit('message-end');
          this.loadingAttachment = false;
          this.$router.push({
            name: 'ConversationDetail',
            params: {
              type: this.type,
              conversationId: newMessage.conversationId,
            },
          });
        },
      });
    },

    async sendMsgToOldReceiver() {

      await this.$apollo.mutate({
        mutation: InsertConversationMessage,
        variables: this.messageData,
        optimisticResponse: {
          message: {
            __typename: 'ConversationMessage',
            id: `temp.${Date.now()}`,
            ...this.messageData,
            msgCreateTime: new Date(),
            conversationId: this.conversationId,
            sender: null,
            video: null,
            document: null,
            images: null,
            linkPreview: null,
          },
        },
        update: (cache, { data: { message } }) => {
          const cacheId = cache.identify(message);
          cache.modify({
            fields: {
              list_conversation_messages(existingFieldData, { toReference }) {
                return [...existingFieldData, toReference(cacheId)];
              },
              list_conversations: (_, { toReference }) => toReference(cacheId),
            },
          });
          this.$refs.composer.$el.querySelector('textarea').style.height =
            'auto';
        },
      });
    },
  },
};
</script>

<style scoped>
.conversation-bottom {
  display: flex;
  flex-direction: column;
}
.conversation-composer {
  padding: 15px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  bottom: 0px;
  width: 100%;
  gap: 10px;
}
.composer__icons {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 7px;
  color: var(--cs-gray-05);
}
.composer__icons,
.cs-button {
  margin-top: 18px;
}
.composer__icons > * {
  cursor: pointer;
}
.conversation-composer >>> .cs-textarea__textarea {
  background-color: var(--cs-gray-01);
  max-height: 150px;
}
.conversation-textarea {
  flex: 1;
}
.cs-button {
  --cs-button-padding: 0px !important;
}
.ch-icons {
  font-size: 24px;
}
.shared-post {
  padding: 20px;
}
.message-link {
  display: flex;
  flex-direction: row;
  padding: 20px;
}
.message-link__details {
  max-width: 655px;
}
.link-delete {
  font-size: 20px;
  cursor: pointer;
}
.cs-send-post-btn {
  margin-bottom: 13px;
  margin-left: 90%;
}
.message-attachments-wrapper {
  position: relative;
  height: 250px;
}
.message-attachments {
  height: 100%;
  overflow: auto;
  padding: 5px;
}
/* T0DO: Might have to fix this ? */
.attachment-state {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: rgba(27, 38, 51, 0.6);
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.attachment-state__modal {
  width: 100%;
  border-bottom-right-radius: 15px;
  border-bottom-left-radius: 15px;
}
.ch-spinner {
  --cs-spinner-color: var(--cs-gray-03) !important;
}
.conversation-composer__upload-progress {
  margin-top: -50px;
  color: var(--cs-gray-00);
}
</style>
