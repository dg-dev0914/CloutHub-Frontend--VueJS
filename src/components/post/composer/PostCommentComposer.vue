<template>
  <div>
    <span v-if="parent.postLevel > 0" class="reply-info">
      replying to {{ parent.user.username }}
    </span>
    <!-- comment submit in progress -->
    <span v-if="saving" class="cs-comment-spinner-box">
      <app-spinner size="small" />
      <app-aws-progress />
    </span>

    <div v-if="(user && !saving) || shouldShowPosts" class="post-comment">
      <div class="post-comment-avatar-wrapper">
        <app-avatar
          v-if="user"
          :picture="user.profilePhotoURL"
          :name="user.displayname"
          size="small"
          class="post-comment-avatar"
        />
      </div>
      <div class="post-comment-body">
        <div class="post-comment-input-wrapper">
          <app-textarea
            :id="`${parent.id}_composer`"
            ref="composer"
            v-model="bodyText"
            :maxlength="500"
            placeholder="Write a reply..."
            class="post-comment-input cs-textstyle-paragraph"
            rows="1"
            @input="handleInput"
          />
          <!-- User list to mention in comment -->
          <app-mention-user
            v-if="showList"
            :is-comment="true"
            :user-list="userList"
            @mention-user="mentionUser"
          />
          <!-- Attachment button for adding image/video/file from system -->
          <i class="ch-icons-add-media attachment-icon" @click="attach()"></i>
          <!-- Gif button -->
          <i
            :id="`${parent.id} gif-popover`"
            class="ch-icons-gif attachment-icon"
            @click="openGIFsModal"
          ></i>
          <!-- Emoji picker -->
          <i
            :id="`${parent.id} emoji-popover`"
            class="ch-icons-reaction attachment-icon"
            tabindex="-1"
            @click="show = !show"
          ></i>
          <i class="cs-icons-send-filled send-icon" @click="send"></i>
          <app-emoji-picker
            :show="show"
            :target="`${parent.id} emoji-popover`"
            @selected="selectEmoji"
          />
        </div>

        <div v-if="link" class="live-link-container my-3">
          <app-link-preview
            :title="link.title"
            :src="link.url"
            :description="link.details"
            :picture="link.image"
            @remove="removeLinkPreview"
          />
        </div>
        <app-post-attachment
          v-if="attachments.length"
          :attached-image="attachments"
          @remove="removeAttachment"
        />
        <div v-if="loadingLink" class="cs-spinner-container-cpmment">
          <app-spinner size="small" class="ch-spinner" />
        </div>
      </div>
    </div>
    <div
      v-if="blockedUserFound"
      class="post-comment-editor__chars cs-textstyle-paragraph-small text-red"
    >
      You are not allowed to mention this user!
    </div>
    <div class="post-comment-editor__chars cs-textstyle-paragraph-small">
      {{ bodyText ? bodyText.length : 0 }}/500 Characters
    </div>
  </div>
</template>

<script>
// Js files
import $auth from '@/services/auth';
import $bus from '@/services/bus';
import $upload from '@/services/upload';
import $utils from '@/services/utils';
import $popups from '@/services/popups';
//  Graphql files
import GetLinkPreview from '@/gql/general/GetLinkPreview.gql';
import InsertPost from '@/gql/posts/InsertPost.gql';
import GetSimilarComments from '@/gql/posts/countSimilarUserComments.gql';
import UserSearch from '@/gql/search/UserSearch.gql';
import GetGroup from '@/gql/groups/GetGroup.gql';
import GetProfile from '@/gql/general/GetProfile.gql';
// Components files
import AppAvatar from '@/components/general/Avatar.vue';
import AppAwsProgress from '@/components/general/AwsProgress.vue';
import AppTextarea from '@/components/general/Textarea.vue';
import AppEmojiPicker from '@/components/general/EmojiPicker.vue';
import AppPostAttachment from '@/components/general/Attachments.vue';
import AppSpinner from '@/components/general/Spinner.vue';
import AppLinkPreview from '@/components/general/LinkPreview.vue';
import AppMentionUser from '@/components/post/composer/MentionUser.vue';

export default {
  components: {
    AppAvatar,
    AppAwsProgress,
    AppTextarea,
    AppEmojiPicker,
    AppPostAttachment,
    AppSpinner,
    AppLinkPreview,
    AppMentionUser,
  },
  props: {
    parent: {
      type: Object,
      required: true,
    },
    id: {
      type: String,
      required: false,
      default: null,
    },
  },
  apollo: {
    group: {
      query: GetGroup,
      variables() {
        return {
          id: this.$route.params.id,
        };
      },
      skip() {
        return !this.id;
      },
    },
    user: {
      query: GetProfile,
      variables() {
        return {
          id: $auth.getUserId(),
        };
      },
    },
  },
  data() {
    return {
      user: null,
      bodyText: '',
      attachments: [],
      show: false,
      saving: false,
      link: '',
      loadingLink: false,
      blockedUserList: new Set(),
      blockedUserFound: false,
      ignoredLinks: [],
      linkTimer: null,
      showList: false,
      userList: null,
      lastComment: '', // stores the last comment text
      consecutiveCount: 0, // counts consecutive identical comments
      isCommentBlocked: false, // flag to check if the comment is blocked
    };
  },
  computed: {
    userIsMember() {
      if (!this.group || !this.group.myMembership) return null;
      return this.group.myMembership.role !== 'pending-member';
    },
    userIsSuperAdmin() {
      return $auth.isAdmin();
    },
    shouldShowPosts() {
      return this.userIsMember || this.userIsSuperAdmin;
    },
  },

  methods: {
    // IMAGES
    async attach() {
      const type = 'image/*';
      const files = await $utils.selectFiles(type);
      files.forEach((file) => {
        file.dataurl = URL.createObjectURL(file);
        this.attachments.push(file);
      });
    },
    removeAttachment(image) {
      this.attachments.splice(this.attachments.indexOf(image), 1);
    },

    // GIFS
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

    selectEmoji(emoji) {
      const textarea = this.$refs.composer.$el.querySelector('textarea');
      const cursorPos = textarea.selectionStart;
      const beforeText = this.bodyText.substring(0, cursorPos);
      const afterText = this.bodyText.substring(
        cursorPos,
        this.bodyText.length
      );
      this.bodyText = `${beforeText}${emoji}${afterText}`;
      this.$nextTick(() => {
        textarea.selectionEnd = cursorPos + emoji.length;
      });
    },
    // POSTING
    async send() {
      // Check for blocked user
      if ((!this.bodyText && !this.attachments.length) ||
        this.blockedUserFound
      ) {
        return false;
      }
      // Local spam check 
      if (this.checkForConsecutiveSpam()) {
        return false;
      }
      // Database spam check
      if (await this.checkForSimilarCommentsSpam()) {
        return false;
      }

      this.saving = true;
      try {
        const comment = {
          parentPostId: this.parent.id,
          rootPostId: this.parent.rootPostId,
          postLevel: (this.parent.postLevel * 1 + 1).toString(),
          bodyText: this.bodyText,
          images: [],
        };
        if (this.link) {
          comment.linkPreview = {
            ...this.link,
          };
        }
        if (this.attachments.length) {
          comment.images = await $upload.uploadImages(this.attachments);
        }
        const optimisticResponse = { ...comment };
        optimisticResponse.id = Date.now();
        optimisticResponse.createdAt = new Date();
        optimisticResponse.timestamp = Date.now();
        optimisticResponse.user = this.user;
        optimisticResponse.reactionTotals = [];
        optimisticResponse.myReaction = {};
        optimisticResponse.replyCount = 0;
        optimisticResponse.sharedPostCount = 0;
        optimisticResponse.linkPreview = null;
        optimisticResponse.location = null;
        optimisticResponse.video = null;
        optimisticResponse.document = null;
        optimisticResponse.isBookmarked = false;
        optimisticResponse.tags = [];
        optimisticResponse.reactionCount = 0;
        optimisticResponse.profanityStatus = '';
        optimisticResponse.mentions = [];
        optimisticResponse.type = '';
        optimisticResponse.category = '';
        optimisticResponse.safe = '';
        optimisticResponse.slug = '';
        optimisticResponse.pendingAdminReview = false;
        optimisticResponse.__typename = 'Post';

        await this.$apollo.mutate({
          mutation: InsertPost,
          variables: comment,
          optimisticResponse: {
            create_post: optimisticResponse,
          },
          update: (cache, mutationResponse) => {
            // Temporary workaround to prevent jumping issue - see router push below
            this.bodyText = '';
            this.attachments = [];
            this.ignoredLinks = [];
            this.link = '';
            cache.modify({
              id: cache.identify({
                __typename: 'Post',
                id: comment.rootPostId,
              }),
              fields: {
                commentsCount(prevCount) {
                  return prevCount + 1;
                },
              },
            });
            if (this.$route.name !== 'Home') {
              cache.modify({
                id: cache.identify(this.parent),
                fields: {
                  replies: (cachedRefs = [], { toReference }) => {
                    const newRef = toReference(
                      cache.identify(mutationResponse.data.create_post)
                    );
                    return [...cachedRefs, newRef];
                  },
                },
              });
            } else {
              this.$router.push({
                name: 'PostDetail',
                params: { id: this.parent.rootPostId },
              });
            }
          },
        });
        this.saving = false;
        this.$emit('send');
      } catch (err) {
        const error = JSON.stringify(err, ['message']);
        if (error.includes('prohibited')) {
          $popups.alert(`${err}`);
        } else
          $popups.alert(
            'There was an error while posting the comment.  Please try again later or contact support'
          );
        this.saving = false;
      }
      return true;
    },
    checkForConsecutiveSpam() {
      if (this.bodyText === this.lastComment) {
        this.consecutiveCount++;
      } else {
        this.consecutiveCount = 1;
        this.lastComment = this.bodyText;
      }

      if (this.consecutiveCount > 3) {
        this.isCommentBlocked = true;
        $popups.alert("There was an issue posting your comment. Please contact support to discuss.");
        return true;  // True means it's spam
      } 
      this.isCommentBlocked = false;
      return false;
    },

    async checkForSimilarCommentsSpam() {
      if (this.user.badgeType !== 'founder' && !$auth.isAdmin()) {
        try {
          const response = await this.$apollo.query({
            query: GetSimilarComments,
            variables: {
              userId: this.user.id,  // Assuming user.id contains the user's ID
              bodyText: this.bodyText
            }
          });

          const commentCount = response.data.count_similar_user_comments;

          if (commentCount >= 3) {
            $popups.alert("There was an issue posting your comment. Please contact support to discuss.");
            return true; // True means it's spam
          }
        } catch (error) {
          return false;  // Fall silent if there is an issue checking the database.
        }
      }

      return false;
    },

    focus() {
      this.$refs.composer.focus();
    },
    removeLinkPreview() {
      this.ignoredLinks.push(this.link.url);
      this.link = '';
    },
    async getLinks(notIgnoredLinks) {
      this.link = '';
      const url = notIgnoredLinks[0];
      this.loadingLink = true;
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
      link.url = url;
      this.loadingLink = false;
      this.link = link;
      this.$emit('detectLink', link);
    },
    mentionUser(user) {
      const textarea = this.$refs.composer.$el.querySelector('textarea');
      const cursorPos = textarea.selectionStart;
      const beforeText = this.bodyText.substring(0, cursorPos);
      const beforeCursorWords = beforeText.replace(/\n/g, ' ').split(' ');
      const currentWord = beforeCursorWords[beforeCursorWords.length - 1];
      this.bodyText = this.bodyText.replace(currentWord, `${user.username} `);
      this.$nextTick(() => {
        textarea.selectionEnd = cursorPos + user.username.length;
        textarea.focus();
        this.showList = false;
      });
    },
    async handleInput() {
      if (!this.bodyText.length) {
        this.ignoredLinks = [];
        this.link = '';
      }
      if (!this.link) {
        clearTimeout(this.linkTimer);
        const links = this.bodyText.match(
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
      const beforeText = this.bodyText.substring(0, cursorPos);
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
      const foundMentionnedUsers = this.bodyText.match(/\B@[a-z0-9_-]+/gi);
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
  },
};
</script>
<style scoped>
.reply-info {
  font-size: 11px;
}
.post-comment {
  display: flex;
  flex-direction: row;
}
.post-comment-avatar-wrapper {
  margin: 15px 10px 0 0;
}
.post-comment-avatar {
  display: block;
}
.post-comment-body {
  flex: 1;
  background-color: var(--cs-gray-01);
}
.post-comment-input-wrapper {
  border: 1px solid var(--cs-gray-02);
  border-radius: 5px;
  display: flex;
  padding: 0 10px 0 0;
  align-items: flex-start;
  position: relative;
}
.post-comment-input-wrapper .cs-textarea {
  width: 100%;
}
.post-comment-input >>> textarea {
  border: none;
  background: none;
}
.send-icon {
  color: var(--cs-primary-base);
  font-size: 22px;
  padding: 5px;
  margin-top: 10px;
}
.attachment-icon {
  color: var(--cs-gray-04);
  margin-right: 7px;
  font-size: 22px;
  padding: 5px 0;
  margin-top: 10px;
}
.cs-comment-spinner-box {
  display: flex;
  justify-content: center;
  gap: 40px;
}
.ch-list-container {
  width: max-content;
  height: 16px;
  background: transparent;
  position: absolute;
}
.post-comment-editor__chars {
  margin-top: 3px;
  text-align: right;
  color: var(--cs-gray-04);
}
.text-red {
  color: red;
}
</style>
