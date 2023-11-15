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
                :href="`https://twitter.com/intent/tweet?url=${link}&text=Think / Speak Freely on @CloutHub`"
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
        <app-create-post-modal
          :shared-link="link"
          :show-create-modal="showPostModal"
          @closeCreateModal="closePostModal"
        />
      </div>
    </div>
  </app-modal>
</template>

<script>
import AppModal from '@/components/general/Modal.vue';
import AppCreatePostModal from '@/components/post/modals/CreatePostModal.vue';
import $bus from '@/services/bus';
import CreateShortLink from '@/gql/general/CreateShortLink.gql';

export default {
  components: {
    AppModal,
    AppCreatePostModal,
  },
  data() {
    return {
      showModal: false,
      showPostModal: false,
      title: 'Share',
      link: null,
      post: null,
      embedCode: null,
    };
  },
  async mounted() {
    $bus.$on('show-share-other', async (params) => {
      // posts: title, link, post, embedCode
      this.showModal = true;
      this.title = params.title;
      this.post = params.post;
      this.embedCode = params.embedCode;
      this.link = `${process.env.VUE_APP_SHARE_DOMAIN}${params.link}`;
    });
  },
  methods: {
    onClose() {
      this.showModal = false;
    },
    closePostModal() {
      this.showPostModal = false;
      this.onClose();
    },
    sharePost() {
      if (this.post) {
        $bus.$emit('show-share-post-modal', this.post);
        this.onClose();
      } else {
        this.showPostModal = true;
      }
    },
    shareMessage() {
      if (this.post) {
        $bus.$emit('new-message-modal', { post: this.post });
        this.onClose();
      } else if (this.link) {
        $bus.$emit('new-message-modal', { link: this.link });
        this.onClose();
      }
    },
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
