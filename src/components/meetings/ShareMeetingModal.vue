<template>
  <app-modal
    :show="showModal"
    class="ch-share-modal"
    :title="title"
    @close="onClose"
  >
    <div class="ch-share-modal__body">
      <div class="ch-share">
        <div>
          <div class="ch-share-btns">
            <div class="ch-share-external">
              <div class="ch-share-btn internal" @click="sharePost()">
                <i class="ch-icons-forum"></i>
              </div>
              <div class="ch-share-external-label">CloutHub Forum</div>
            </div>
            <div class="ch-share-external">
              <div class="ch-share-btn internal" @click="shareMessage()">
                <i class="ch-icons-message"></i>
              </div>
              <div class="ch-share-external-label">CloutHub Message</div>
            </div>
            <div class="ch-share-external">
              <a
                class="ch-share-btn"
                :href="`https://www.facebook.com/sharer/sharer.php?u=${link}`"
                target="_blank"
                @click="onClose()"
              >
                <i class="cs-icons-facebook"></i>
              </a>
              <div class="ch-share-external-label">Facebook</div>
            </div>
            <div class="ch-share-external">
              <a
                class="ch-share-btn"
                :href="`https://twitter.com/intent/tweet?url=${link}&text=`"
                target="_blank"
                @click="onClose()"
              >
                <i class="cs-icons-twitter"></i>
              </a>
              <div class="ch-share-external-label">Twitter</div>
            </div>
            <div class="ch-share-external">
              <a
                class="ch-share-btn"
                :href="`mailto:info@example.com?&subject=&cc=&bcc=&body=${link}`"
                target="_blank"
                @click="onClose()"
              >
                <i class="cs-icons-email"></i>
              </a>
              <div class="ch-share-external-label">Email</div>
            </div>

            <div class="ch-share-external">
              <div class="ch-share-btn" @click="copyLink()">
                <i class="ch-icons-clone"></i>
              </div>
              <div class="ch-share-external-label">Copy Link</div>
            </div>

            <div v-if="embedCode" class="ch-share-external">
              <div class="ch-share-btn" @click="copyEmbedCode()">
                <i class="cs-icons-full-screen"></i>
              </div>
              <div class="ch-share-external-label">Embed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <app-new-message-modal
      :is-meeting="showMsgModal"
      :meeting-link="link"
      @close-share="onClose"
    />
    <app-share-post-modal
      :is-meeting="showPostModal"
      :post-link="meetingPost"
      @close-share-post="onClose"
    />
  </app-modal>
</template>

<script>
import AppModal from '@/components/general/Modal.vue';
import AppNewMessageModal from '@/components/modalManager/NewMessageModal.vue';
import AppSharePostModal from '@/components/modalManager/SharePostModal.vue';
import $cdn from '@/services/cdn';
import { FirebaseDynamicLinks } from 'firebase-dynamic-links';

export default {
  components: {
    AppModal,
    AppNewMessageModal,
    AppSharePostModal,
  },
  props: {
    showModal: {
      type: Boolean,
      default: false,
    },
    sharedInfo: Object,
  },
  data() {
    return {
      title: 'Share',
      link: null,
      post: null,
      embedCode: null,
      showMsgModal: false,
      showPostModal: false,
      meetingPost: null,
    };
  },
  async mounted() {
    // title, post, embedCode, [itemType, itemId, itemTitle, itemDescription, itemPicture] OR post
    this.title = this.sharedInfo.title;
    this.post = this.sharedInfo.post;
    this.embedCode = this.sharedInfo.embedCode;
    this.link = `${process.env.VUE_APP_SHARE_DOMAIN}/m/${this.sharedInfo.itemSlug || this.sharedInfo.itemId}`;
  },
  methods: {
    async copyLink() {
      await navigator.clipboard.writeText(this.link);
      this.$toast.open({
        message: 'Copied',
        type: 'success',
        duration: 1000,
        dismissible: true,
        position: 'top',
      });
      this.onClose();
    },
    async copyEmbedCode() {
      await navigator.clipboard.writeText(this.embedCode);
      this.$toast.open({
        message: 'Copied',
        type: 'success',
        duration: 1000,
        dismissible: true,
        position: 'top',
      });
      this.onClose();
    },
    onClose() {
      this.$emit('close-modal');
    },
    shareMessage() {
      this.showMsgModal = true;
    },
    sharePost() {
      this.showPostModal = true;
      this.meetingPost = {
        linkPreview: {
          url: this.link,
          originalLink: this.link,
          title: this.sharedInfo.itemTitle,
          details: this.sharedInfo.itemDescription,
          image: this.sharedInfo.itemPicture,
        },
      };
    },
  },
};
</script>

<style scoped>
.ch-posts-tags {
  display: flex;
  flex-direction: row;
  gap: 7px;
  margin-top: 7px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.ch-posts-tags__tag {
  --cs-tag-color: var(--cs-primary-base) !important;
}

.ch-share-btns {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  padding-top: 15px;
  text-align: center;
}
.ch-share-external {
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.ch-share-btn {
  display: flex;
  width: 60px;
  height: 60px;
  background-color: var(--cs-gray-03);
  color: white;
  justify-content: center;
  align-items: center;
  font-size: 25px;
  border-radius: 50%;
  cursor: pointer;
}
.ch-share-btn.internal {
  background-color: var(--cs-primary-base);
}
</style>
