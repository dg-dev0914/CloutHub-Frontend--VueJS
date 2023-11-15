<template>
  <div :class="incomingOutgoingClass" class="conversation-message-content">
    <!-- Simple Msg -->
    <!-- Option to delete message -->
    <div
      v-if="outgoing"
      class="message-option"
      :class="{ 'message-option__indicator': indicator }"
    >
      <div v-if="indicator" class="cs-textstyle-paragraph-small-bold indicator">
        You
      </div>
      <app-context-menu class="more-option">
        <app-context-menu-item @click="showConfirmDelete = true"
          >Delete message</app-context-menu-item
        >
      </app-context-menu>
    </div>
    <!-- eslint-disable vue/no-v-html -->
    <div v-if="!!message.msgBody" class="cs-textstyle-paragraph-small">
      {{ msgText }}
    </div>
    <!-- Link Preview -->
    <div v-if="message && message.linkPreview" class="link-preview">
      <app-link-preview
        :preview="true"
        :title="message.linkPreview.title"
        :description="message.linkPreview.details"
        :picture="message.linkPreview.image"
        :src="message.linkPreview.url"
      />
    </div>
    <!-- File -->
    <div v-if="message && message.document">
      <cs-file-preview
        :src="cdn(message.document.url)"
        :file-type="message.document.type"
        :title="message.document.name"
        :file-size="message.document.size"
        class="attachment-file"
      ></cs-file-preview>
    </div>
    <!-- Video -->
    <div v-if="message && message.video">
      <cs-video-player :src="cdn(message.video.url)" />
    </div>
    <!-- Images -->
    <div
      v-if="message && message.images && message.images.length > 0"
      class="ch-image-container"
    >
      <div v-for="(image, index) in message.images" :key="image.url + index">
        <app-img
          :src="image.url"
          class="ch-image"
          @click.stop="openLightbox(index)"
        />
      </div>
      <vue-easy-lightbox
        move-disabled
        :visible="showLightbox"
        :imgs="lightboxImages"
        :index="lightboxIndex"
        @hide="showLightbox = false"
      />
    </div>
    <!-- Shared Post -->
    <div v-if="message && message.sharedPost" class="ch-shared-post">
      <app-conversation-post-preview :shared-post="message.sharedPost" />
    </div>
    <!-- Delete Message Confirm Popup -->
    <app-popup
      :show="showConfirmDelete"
      type="confirm"
      variant="danger"
      ok-label="Delete"
      title="Delete Message"
      message="Are you sure you wish to delete this message?"
      @close="showConfirmDelete = false"
      @ok="deleteMessage(message)"
    />
  </div>
</template>

<script>
import $cdn from '@/services/cdn';
// import * as linkify from 'linkifyjs';
// Component
import AppImg from '@/components/general/Img.vue';
import AppConversationPostPreview from '@/components/conversations/ConversationPostPreview.vue';
import AppContextMenu from '@/components/general/ContextMenu.vue';
import AppContextMenuItem from '@/components/general/ContextMenuItem.vue';
import AppPopup from '@/components/general/Popup.vue';
import AppLinkPreview from '@/components/general/LinkPreview.vue';

// GQL
import DeleteMessage from '@/gql/conversations/DeleteMessage.gql';

export default {
  components: {
    AppImg,
    AppPopup,
    AppLinkPreview,
    AppContextMenu,
    AppConversationPostPreview,
    AppContextMenuItem,
  },
  props: {
    message: {
      type: Object,
      required: true,
    },
    outgoing: {
      type: Boolean,
      default: false,
    },
    indicator: Boolean,
  },
  data() {
    return {
      lightboxIndex: 0,
      showLightbox: false,
      showConfirmDelete: false,
    };
  },
  computed: {
    incomingOutgoingClass() {
      return this.outgoing
        ? 'conversation-message-content--outgoing'
        : 'conversation-message-content--incoming';
    },
    lightboxImages() {
      return (
        this.message.images && this.message.images.map((i) => this.cdn(i.url))
      );
    },
    msgText() {
      // const linkInMsg = linkify.find(this.message.msgBody);
      // if (linkInMsg.length > 0) {
      //   let newMsgBody = JSON.parse(JSON.stringify(this.message.msgBody));
      //   linkInMsg.forEach((link) => {
      //     newMsgBody = newMsgBody
      //       .split(link.value)
      //       .join(`<a href=${link.href} target="_blank">${link.value}</a>`);
      //   });
      //   return newMsgBody;
      // }
      return this.message.msgBody;
    },
  },
  methods: {
    cdn(url) {
      return $cdn.optimize(url);
    },
    openLightbox(index) {
      this.lightboxIndex = index || 0;
      this.showLightbox = true;
    },
    // Delete Message
    async deleteMessage(message) {
      await this.$apollo.mutate({
        mutation: DeleteMessage,
        variables: {
          messageId: message.id,
        },
        update: (cache) => {
          const cacheId = cache.identify(message);
          cache.modify({
            fields: {
              list_conversation_messages(existingMsgRefs, { readField }) {
                return existingMsgRefs.filter(
                  (msgRef) => message.id !== readField('id', msgRef)
                );
              },
              list_conversations: (_, { toReference }) => toReference(cacheId),
            },
          });
        },
      });
    },
  },
};
</script>

<style scoped>
.conversation-message-content {
  min-width: 120px;
  padding: 10px;
  border-radius: 5px;
  color: var(--cs-gray-05);
}
.conversation-message-content--incoming {
  background-color: var(--cs-primary-lightest);
}
.conversation-message-content--outgoing {
  background-color: var(--cs-gray-01);
}
.conversation-message-content__menu {
  text-align: right;
  color: var(--cs-gray-04);
}
.conversation-message-content__text {
  color: var(--cs-gray-05);
}
.message-option {
  display: flex;
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
}
.message-option >>> .text-light {
  color: var(--cs-gray-03) !important;
}
.message-option__indicator {
  justify-content: space-between;
}
.ch-image-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}
.ch-image {
  max-height: 250px;
  max-width: 250px;
  padding: 10px;
  flex: 1 auto;
}
.link-preview {
  max-width: 500px;
  padding: 10px;
}
.link-preview >>> .cs-link-preview__content {
  color: var(--cs-gray-05);
}
.link-preview >>> .cs-link-preview__content-textbox--desc {
  max-height: 70px;
  overflow: hidden;
}
</style>
