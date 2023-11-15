<template>
  <div class="ch-post-composer">
    <div v-if="!!user" ref="dragZone" class="ch-composer-area">
      <!-- Post composer and user locaion -->
      <app-post-composer-text
        v-model="post"
        :body-text="initialBodyText"
        :shared-link="sharedLink"
        @textHandle="textHandle"
        @detectLink="detectLink"
        @removeLinkPreview="removeLinkPreview"
        @handleTags="handleTags"
        @add="addUserLocation"
        @remove="removeUserLocation"
        @blockPosting="blockPosting"
      />

      <!-- Tags -->
      <div v-if="postBodyTags.length" class="ch-posts-tags">
        <cs-tag
          v-for="(tag, $index) in postBodyTags"
          :key="tag + $index"
          class="ch-posts-tags__tag"
        >
          <span>#{{ tag }}</span>
        </cs-tag>
      </div>
      <!-- Uploads/Attachments -->
      <app-attachment-previews v-model="post" />
    </div>

    <!-- Padding to make sure all content can be viewed now that footer is absolute -->
    <div class="ch-post-composer__footer-padding"></div>

    <!-- Main/Upload Buttons -->
    <div class="ch-post-composer__footer-buttons">
      <app-attachment-buttons v-model="post" />
      <app-check-box
        v-if="forGroups"
        label="Subgroups"
        :value="isSharingToSubgroups"
        @click="openSelectSubgroupsModal"
      />
      <!-- POST/UPDATE BUTTON -->
      <cs-button size="small" :disabled="isEmpty || isBlocked" @click="save">
        {{ saveButtonLabel }}
        <i class="cs-icons-send-filled cs-post-icons"></i>
      </cs-button>
    </div>
  </div>
</template>

<script>
import $auth from '@/services/auth';
import $upload from '@/services/upload';
import $popups from '@/services/popups';
import $postsApi from '@/api/posts';

import AppPostComposerText from '@/components/post/composer/PostComposerText.vue';
import AppAttachmentPreviews from '@/components/post/composer/PostComposerAttachmentPreviews.vue';
import AppAttachmentButtons from '@/components/post/composer/PostComposerAttachmentButtons.vue';
import AppCheckBox from '@/components/general/CheckBox.vue';

function cleanPost(postdata) {
  const postData = JSON.parse(JSON.stringify(postdata));
  const createProps = [
    'images',
    'document',
    'bodyText',
    'video',
    'visibility',
    'location',
    'room',
    'tags',
    'linkPreview',
    'postLevel',
    'groupId',
    'parentPostId',
    'rootPostId',
    'sharedPostId',
    'category',
  ];
  const editProps = [
    'postId',
    'bodyText',
    'linkPreview',
    'images',
    'document',
    'video',
    'location',
    'tags',
    'category',
  ];
  const props = postData.id ? editProps : createProps;
  const post = {};
  props.forEach((prop) => {
    if (postData[prop]) post[prop] = postData[prop];
  });
  // // Extra line for editing posts to use 'postId' instead of 'id'
  if (postData.location) post.location = postData.location;
  if (postData.id) post.postId = postData.id;
  return post;
}

export default {
  components: {
    AppPostComposerText,
    AppAttachmentPreviews,
    AppAttachmentButtons,
    AppCheckBox,
  },
  props: {
    postData: {
      type: Object,
      required: true,
    },
    video: File,
    groupId: {
      type: String,
      required: false,
      default: '',
    },
    sharedLink: {
      type: String,
      required: false,
      default: '',
    },
    forGroups: {
      type: Boolean,
      required: false,
      default: false,
    },
    selectedSubgroupIds: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  data() {
    return {
      post: cleanPost(this.postData),
      user: null,
      initialBodyText: '',
      bodyText: '',
      postBodyTags: [],
      showEmoji: false,
      saving: false,
      isBlocked: false,
    };
  },
  computed: {
    hasAttachment() {
      return (
        !!(this.post.images && this.post.images.length) ||
        this.post.video ||
        this.post.document
      );
    },
    isEmpty() {
      return !this.bodyText && !this.hasAttachment;
    },
    isCreate() {
      return !(this.postData && this.postData.id);
    },
    saveButtonLabel() {
      return this.isCreate ? 'Post' : 'Update';
    },
    isSharingToSubgroups() {
      return !!this.selectedSubgroupIds.length;
    },
  },
  async mounted() {
    this.user = await $auth.getUser();

    if (this.video) this.post.video = this.video;
    if (this.groupId) this.post.groupId = this.groupId;

    if (this.postData) {
      this.initialBodyText = this.postData.bodyText
        ? this.postData.bodyText
        : '';
      this.bodyText = this.initialBodyText;
      if (this.postData.tags) {
        this.postBodyTags = this.postData.tags ? this.postData.tags : [];
      }
    }
  },
  methods: {
    addUserLocation(location) {
      this.$set(this.post, 'location', location);
    },
    removeUserLocation() {
      this.$set(this.post, 'location', null);
    },
    textHandle(bodyText) {
      this.bodyText = bodyText;
    },
    handleTags(tags) {
      this.postBodyTags = tags;
    },
    blockPosting(blocked) {
      this.isBlocked = blocked;
    },
    detectLink(link) {
      this.$set(this.post, 'linkPreview', {
        ...link,
      });
    },
    removeLinkPreview() {
      this.$set(this.post, 'linkPreview', null);
    },
    openSelectSubgroupsModal() {
      this.$emit('toggleSelectSubgroupsModal', true);
    },
    async save() {
      this.$emit('saving', true);
      this.saving = true;

      this.post.subgroupIds = this.selectedSubgroupIds;
      this.post.bodyText = this.bodyText;
      this.post.tags = this.postBodyTags;
      if (!this.post.visibility) this.post.visibility = 'all';

      if (this.hasAttachment) {
        try {
          const images = this.post.images;
          if (images && images.length > 0) {
            this.post.images = await $upload.uploadImages(images);
          }
          // Add video Attachment
          if (this.post.video) {
            this.post.video = await $upload.uploadVideo(this.post.video);
          }
          // Add Document Attachment
          if (this.post.document) {
            this.post.document = await $upload.uploadDocument(
              this.post.document
            );
          }
        } catch (error) {
          $popups.alert({
            title: 'Error Uploading',
            message:
              'There was an error uploading.  Please check your internet connection.',
          });
          this.$emit('saving', false);
          this.saving = false;
          return;
        }
      }

      try {
        if (this.isCreate) {
          console.log(this.post);
          await $postsApi.createPost(this.post);
        } else {
          await $postsApi.updatePost(this.post);
        }
      } catch (e) {
        $popups.alert({ title: 'Error Publishing', message: e.message });
        this.$emit('saving', false);
        this.saving = false;
        return;
      }
      this.saving = false;
      const toastText = this.saveButtonLabel === 'Post' ? 'Posted' : 'Updated';
      this.$toast.open({
        message: toastText,
        type: 'success',
        duration: 1000,
        dismissible: true,
        position: 'top',
      });
      this.$emit('saving', false);
      this.$emit('close');
    },
  },
};
</script>

<style scoped>
.ch-character-cnt {
  font-size: 12px;
  color: var(--cs-gray-04);
}
.ch-post-composer__footer-padding {
  height: 48px;
}
.ch-post-composer__footer-buttons {
  position: absolute;
  bottom: 0px;
  left: 0px;
  right: 0px;
  padding: 20px;
  border-top: solid 1px var(--cs-gray-02);
  background-color: var(--cs-gray-00);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-top: 16px;
  border-radius: 15px;
}
.ch-posting-spinner {
  background: transparent;
  height: 0px;
}
.ch-posting-spinner-box {
  background: transparent;
  height: 71px;
}
.cs-post-icons {
  margin-left: 5px;
}
.emoji-picker {
  position: absolute;
  right: 20px;
  top: 45%;
}
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
.ch-posts-tags >>> .cs-tag__name {
  text-transform: none !important;
  font-weight: bold !important;
  font-size: 12px !important;
}
.ch-post-composer__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  color: var(--cs-gray-07);
  display: flex;
  justify-content: center;
  align-items: center;
}
.ch-post-composer__overlay-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--cs-gray-00);
  opacity: 0.4;
}
.ch-post-composer__overlay-content {
  position: relative;
}
</style>
