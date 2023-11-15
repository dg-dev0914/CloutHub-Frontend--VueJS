<template>
  <app-form-modal
    :show="show"
    class="ch-edit-post__modal"
    title="Edit Comment"
    :saving="saving"
    @close="onCloseModal"
  >
    <div class="ch-edit-post__body">
      <div class="text_mention_wrapper">
        <app-textarea
          ref="composer"
          v-model="editedComment"
          class="ch-edit-comment"
          label="Comment"
          :maxlength="allowedCharacters"
          placeholder="Type a comment"
          @input="handleInput"
        />
        <app-mention-user
          v-if="showList"
          :is-comment="true"
          :user-list="userList"
          @mention-user="mentionUser"
          class="ch-edit-post__body__mention"
        />
      </div>
      <div
        v-if="blockedUserFound"
        class="ch-edit-post__modal__chars cs-textstyle-paragraph-small text-red"
      >
        You are not allowed to mention this user!
      </div>
      <div class="ch-edit-post__modal__chars cs-textstyle-paragraph-small">
        {{ editedComment ? editedComment.length : 0 }}/{{ allowedCharacters }}
        Characters
      </div>
      <div class="ch-buttons">
        <cs-button
          class="cs-btns"
          variant="default"
          size="small"
          corners="round"
          @click="attach"
        >
          <i class="ch-icons-add-media mr-2"></i>
          Photo
        </cs-button>
        <cs-button
          :id="`${comment.id} gif-popover`"
          class="cs-btns"
          variant="default"
          size="small"
          corners="round"
          @click="openGIFsModal"
        >
          <i class="ch-icons-gif attachment-icon"></i>
          GIF
        </cs-button>
        <cs-button
          id="emoji-popover"
          class="cs-btns emoji-btn"
          variant="default"
          size="small"
          corners="round"
        >
          <i class="ch-icons-reaction attachment-icon"></i>
        </cs-button>
      </div>

      <app-post-attachment
        v-if="attachments.length"
        :attached-image="attachments"
        @remove="removeAttachment"
      ></app-post-attachment>
    </div>
    <cs-button
      slot="footer"
      size="small"
      class="submit-btn"
      @click="editComment"
      :disabled="blockedUserFound"
    >
      Update
    </cs-button>
    <app-emoji-picker
      :show="showEmoji"
      target="emoji-popover"
      @selected="selectEmoji"
    />
  </app-form-modal>
</template>

<script>
import $bus from '@/services/bus';
import $upload from '@/services/upload';
import $utils from '@/services/utils';
import $popups from '@/services/popups';

import AppFormModal from '@/components/general/FormModal.vue';
import AppPostAttachment from '@/components/general/Attachments.vue';
import AppEmojiPicker from '@/components/general/EmojiPicker.vue';
import AppTextarea from '@/components/general/Textarea.vue';
import AppMentionUser from '@/components/post/composer/MentionUser.vue';

import UpdatePost from '@/gql/posts/UpdatePost.gql';
import UserSearch from '@/gql/search/UserSearch.gql';

export default {
  components: {
    AppFormModal,
    AppPostAttachment,
    AppEmojiPicker,
    AppTextarea,
    AppMentionUser,
  },
  props: {
    comment: {
      type: Object,
      required: true,
    },
    show: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showEmoji: false,
      editedComment: '',
      attachments: [],
      saving: false,
      allowedCharacters: 500,
      blockedUserList: new Set(),
      blockedUserFound: false,
      showList: false,
      userList: null,
    };
  },
  mounted() {
    this.editedComment = this.comment.bodyText;
    this.attachments = this.comment.images ? [...this.comment.images] : [];
  },
  methods: {
    async handleInput() {
      if (!this.editedComment.length) {
        this.ignoredLinks = [];
        this.link = '';
      }
      if (!this.link) {
        clearTimeout(this.linkTimer);
        const links = this.editedComment.match(
          /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)/g
        );
        if (links) {
          const notIgnoredLinks = links.filter(
            (link) => !this.ignoredLinks.includes(link)
          );
          if (notIgnoredLinks.length) {
            this.linkTimer = setTimeout(
              () => this.getLinks(notIgnoredLinks),
              700
            );
          }
        }
      }

      const textarea = this.$refs.composer.$el.querySelector('textarea');
      const cursorPos = textarea.selectionStart;
      const beforeText = this.editedComment.substring(0, cursorPos);
      const beforeCursorWords = beforeText.replace(/\n/g, ' ').split(' ');
      const currentWord = beforeCursorWords[beforeCursorWords.length - 1];

      if (currentWord.startsWith('@')) {
        this.showList = true;
        clearTimeout(this.userSearchTimer);
        this.userSearchTimer = setTimeout(
          () => this.searchUsers(currentWord),
          700
        );
      } else this.showList = false;
      const foundMentionnedUsers = this.editedComment.match(/\B@[a-z0-9_-]+/gi);
      let containsBlockedUsers;
      if (foundMentionnedUsers && this.blockedUserList) {
        containsBlockedUsers = foundMentionnedUsers.reduce(
          (accumulator, mentionedUser) =>
            accumulator || !!this.blockedUserList.has(mentionedUser),
          false
        );
      }
      this.blockedUserFound = containsBlockedUsers;
      if (containsBlockedUsers) {
        this.$emit('blockPosting', true);
      } else {
        this.$emit('blockPosting', false);
      }
    },
    // Image attachment
    async attach() {
      const type = 'image/*';
      const files = await $utils.selectFiles(type);
      files.forEach((file) => {
        file.dataurl = URL.createObjectURL(file);
        this.attachments.push(file);
      });
    },
    async searchUsers(query) {
      const { data } = await this.$apollo.query({
        query: UserSearch,
        variables: {
          query,
        },
      });
      this.userList = data.users;
      data.users.forEach((user) => {
        if (user.myRelationship.isBlocked)
          this.blockedUserList.add(user.username);
      });
    },
    mentionUser(user) {
      const textarea = this.$refs.composer.$el.querySelector('textarea');
      const cursorPos = textarea.selectionStart;
      const beforeText = this.editedComment.substring(0, cursorPos);
      const beforeCursorWords = beforeText.replace(/\n/g, ' ').split(' ');
      const currentWord = beforeCursorWords[beforeCursorWords.length - 1];
      this.editedComment = this.editedComment.replace(
        currentWord,
        `${user.username} `
      );
      this.$nextTick(() => {
        textarea.selectionEnd = cursorPos + user.username.length;
        textarea.focus();
        this.showList = false;
      });
    },
    selectEmoji(emoji) {
      const textarea = this.$refs.composer.$el.querySelector('textarea');
      const cursorPos = textarea.selectionStart;
      const beforeText = this.editedComment.substring(0, cursorPos);
      const afterText = this.editedComment.substring(
        cursorPos,
        this.editedComment.length
      );
      this.editedComment = `${beforeText}${emoji}${afterText}`;
      this.$nextTick(() => {
        textarea.selectionEnd = cursorPos + emoji.length;
      });
    },
    async editComment() {
      const editData = {
        bodyText: this.editedComment,
        postId: this.comment.id,
        images: [],
      };
      this.saving = true;
      try {
        if (this.attachments.length) {
          editData.images = await $upload.uploadImages(this.attachments);
        }
        await this.$apollo.mutate({
          mutation: UpdatePost,
          variables: editData,
          update: (cache) => {
            cache.modify({
              id: cache.identify(this.comment),
              fields: {
                bodyText() {
                  return editData.bodyText;
                },
                images() {
                  return editData.images;
                },
              },
            });
          },
        });
        this.saving = false;
        this.onCloseModal();
      } catch (e) {
        this.saving = false;
        $popups.alert(
          'Error saving comment.  Please try again later or contact support'
        );
      }
    },
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
      this.attachments.push(gifImage);
    },
    onCloseModal() {
      this.$emit('closeEditModal');
    },
    removeAttachment(data) {
      this.attachments = this.attachments.filter(
        (attachment) => data !== attachment
      );
    },
  },
};
</script>

<style scoped>
.ch-edit-comment {
  padding-bottom: 20px;
  display: block;
  width: 100%;
}
.ch-edit-post__body {
  width: -webkit-fill-available;
}

.text_mention_wrapper {
  width: 100%;
  display: flex;
  flex: 1;
  flex-direction: row;
}
.ch-edit-post__body__mention {
}

.submit-btn {
  float: right;
}
.ch-buttons {
  display: flex;
  flex-direction: row;
  gap: 8px;
  padding-bottom: 10px;
}
.cs-btns {
  --cs-button-color: var(--cs-gray-01) !important;
  --cs-button-text-color: var(--cs-gray-05) !important;
}
.emoji-btn {
  margin-left: auto;
}
.ch-edit-post__modal__chars {
  margin-bottom: 5px;
  text-align: right;
  color: var(--cs-gray-04);
}

.text-red {
  color: red;
}
</style>
