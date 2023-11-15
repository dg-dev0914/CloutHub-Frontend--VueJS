<template>
  <div v-if="showComment" class="post-comment">
    <div class="post-comment-primary">
      <div class="post-comment-avatar-wrapper">
        <app-avatar
          v-router-link="{ name: 'Profile', params: commentUser }"
          :picture="commentUser.profilePhotoURL"
          :name="commentUser.displayname"
          size="small"
          class="post-comment-avatar cursor-pointer"
        >
        </app-avatar>
      </div>
      <div class="post-comment-body">
        <div class="post-comment-body-message">
          <div class="post-comment-body-title">
            <div
              v-router-link="{ name: 'Profile', params: commentUser }"
              class="flex-1 cs-textstyle-paragraph-small-bold cursor-pointer"
            >
              <app-username :user="commentUser" type="displayname" />
            </div>
            <span
              class="comment-timestamp cs-textstyle-paragraph-extra-small"
              >{{ comment.createdAt | moment('from') }}</span
            >
            <!-- Comment edit/delete options menu -->
            <app-post-comment-menu :comment="comment" @edit="edit" />
          </div>
          <div
            class="cs-textstyle-paragraph-small cursor-pointer"
            @click="redirectToPostDetailedPage"
          >
            <span v-for="(data, i) in displayBody" :key="i">
              <!-- Normal text in body -->
              <span v-if="data.type === 'text'">{{ data.word }} </span>
              <!-- mentions in comment boby -->
              <span
                v-if="data.type === 'mention'"
                v-router-link="{
                  name: 'UProfile',
                  params: { username: data.word.replace('@', '') },
                }"
                class="ch-user-mention ch-user-mention--comment"
                >{{ data.word }}
              </span>
            </span>
          </div>
          <img
            v-if="isTranslatingComment"
            src="@/assets/images/translation_icon-orange.svg"
            class="translate-button"
            alt="translate-button"
            @click="showTranslatedComment"
          />

          <div v-if="isHidingTranslateComment" class="ch-translation-wrapper">
            <img
              src="@/assets/images/translation_icon-orange.svg"
              class="translate-button"
              alt="hide-translation-button"
              @click="hideTranslatedComment"
            />
            <div class="cs-textstyle-paragraph-small message-margin">
              <span v-for="(data, i) in displayTranslatedBody" :key="i">
                <!-- Normal text in body -->
                <span v-if="data.type === 'text'">{{ data.word }} </span>
                <!-- mentions in comment boby -->
                <span
                  v-if="data.type === 'mention'"
                  v-router-link="{
                    name: 'UProfile',
                    params: { username: data.word.replace('@', '') },
                  }"
                  class="ch-user-mention ch-user-mention--comment"
                  >{{ data.word }}
                </span>
              </span>
            </div>
            <app-spinner
              v-if="loadingTranslation"
              size="small"
              class="ch-spinner"
            />
          </div>
          <div>
            <app-post-media
              v-if="comment.images || comment.linkPreview"
              :images="comment.images"
              :link-preview="comment.linkPreview"
              :is-comment="true"
            />
          </div>
        </div>

        <div
          class="cs-textstyle-paragraph-small cs-gray-04 comment-response-bar"
        >
          <div class="ch-reaction-buttons" v-if="isLoggedIn">
            <button
              :id="comment.id + '.' + randomNumber + '.reactbutton'"
              class="
                comment-react-button
                capitalize
                cs-textstyle-paragraph-small-bold
                cursor-pointer
              "
              @click="removeReaction"
            >
              <i
                v-if="!comment.myReaction"
                class="ch-icons-reaction post-comment-action-icon"
              ></i>
              <img
                v-if="myReaction"
                class="emoji"
                :src="'/assets/emojis/' + myReaction + '.png'"
                :alt="myReaction"
              />
              <span v-if="myReaction">{{ myReaction }}</span>
              <span v-else>React</span>
            </button>
            <span class="spacer-margin"> | </span>
            <div
              class="cs-textstyle-paragraph-small-bold cursor-pointer"
              @click="toggleReply()"
            >
              <i class="cs-icons-reply-filled post-comment-action-icon"></i>
              Reply
            </div>
          </div>
          <div class="ch-rection-info">
            <span @click="trigger('show-reaction-list-modal')">
              <span v-for="reaction in userReactions" :key="reaction">
                <img
                  class="emoji-small"
                  :src="'/assets/emojis/' + reaction + '.png'"
                  :alt="reaction"
                />
              </span>
              {{ comment.reactionCount }}
              <span v-if="!userReactions || !userReactions.length">
                Reactions
              </span>
            </span>
            <span
              v-if="comment.postLevel < 3"
              v-router-link="{
                name: 'PostDetail',
                params: { id: comment.rootPostId },
              }"
              class="cursor-pointer"
              >&nbsp;&nbsp;|&nbsp;&nbsp;{{ comment.replyCount }}
              {{ comment.replyCount === 1 ? 'reply' : 'replies' }}</span
            >
          </div>
        </div>
      </div>
    </div>
    <div class="post-comment-replies">
      <post-comment
        v-for="commentData in comments"
        :key="commentData.id"
        :comment="commentData"
        :parent="comment"
        :post-id="postId"
      ></post-comment>
      <post-comment-composer
        v-if="showReply"
        :parent="replyParent"
        @send="showReply = false"
      ></post-comment-composer>
    </div>
    <post-reaction
      v-if="!comment.myReaction" 
      :post="comment"
      :target-element-id="comment.id + '.' + randomNumber + '.reactbutton'"
    ></post-reaction>
    <app-edit-comment-modal
      :comment="comment"
      :show="showEditComment"
      @closeEditModal="closeEditModal"
    />
  </div>
</template>

<script>
// Js files
import $auth from '@/services/auth';
import $bus from '@/services/bus';
import $reactions from '@/assets/emojis/reactions.json';
import $postsApi from '@/api/posts';
import GetTranslatedPost from '@/gql/posts/GetTranslatedPost.gql';
// Components files
import AppPostMedia from '@/components/post/items/PostMedia.vue';
import AppEditCommentModal from '@/components/post/modals/EditCommentModal.vue';
import AppUsername from '@/components/general/Username.vue';
import AppAvatar from '@/components/general/Avatar.vue';
import AppPostCommentMenu from '@/components/post/response/PostCommentMenu.vue';
import PostCommentComposer from '@/components/post/composer/PostCommentComposer.vue';
import PostReaction from '@/components/post/response/PostReaction.vue';
import AppSpinner from '@/components/general/Spinner.vue';

export default {
  name: 'PostComment',
  components: {
    AppAvatar,
    PostCommentComposer,
    PostReaction,
    AppPostMedia,
    AppEditCommentModal,
    AppUsername,
    AppPostCommentMenu,
    AppSpinner,
  },
  props: {
    comment: {
      type: Object,
      required: true,
    },
    parent: {
      type: Object,
      required: false,
      default: null,
    },
    postId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      showReply: false,
      showEditComment: false,
      translatedComment: null,
      isShowingTranslation: false,
      loadingTranslation: false,
      disableTranslateButton: false,
      isLoggedIn: false,
      randomNumber: Math.floor(Math.random() * 1000),
    };
  },
  computed: {
    isTranslatingComment() {
      return !this.isShowingTranslation && !this.disableTranslateButton;
    },
    isHidingTranslateComment() {
      return this.isShowingTranslation && !this.disableTranslateButton;
    },
    displayBody() {
      const finalArray = [];
      const commentLines =
        this.comment && this.comment.bodyText
          ? this.comment.bodyText.split(/\n/g)
          : [];
      commentLines.forEach((line) => {
        const bodyArray = line.split(' ');
        bodyArray.forEach((data) => {
          if (data.startsWith('@')) {
            let matched = false;
            this.comment.mentions.forEach((mention) => {
              if (mention.username === data) {
                finalArray.push({
                  type: 'mention',
                  word: data,
                });
                matched = true;
              }
            });
            if (!matched) {
              finalArray.push({
                type: 'text',
                word: data,
              });
            }
          } else {
            finalArray.push({
              type: 'text',
              word: data,
            });
          }
        });
        finalArray.push({
          type: 'text',
          word: '\n',
        });
      });
      this.checkTranslationDemand(finalArray);
      return finalArray;
    },
    displayTranslatedBody() {
      const finalArray = [];
      if (this.translatedComment) {
        const commentLines =
          this.translatedComment.translated.result.split(/\n/g);
        commentLines.forEach((line) => {
          const bodyArray = line.split(' ');
          bodyArray.forEach((data) => {
            if (data.startsWith('@')) {
              let matched = false;
              this.comment.mentions.forEach((mention) => {
                if (mention.username === data) {
                  finalArray.push({
                    type: 'mention',
                    word: data,
                  });
                  matched = true;
                }
              });
              if (!matched) {
                finalArray.push({
                  type: 'text',
                  word: data,
                });
              }
            } else {
              finalArray.push({
                type: 'text',
                word: data,
              });
            }
          });
          finalArray.push({
            type: 'text',
            word: '\n',
          });
        });
      }
      return finalArray;
    },
    comments() {
      return this.comment.comments
        ? this.comment.comments.slice(0).reverse()
        : 0;
    },
    userReactions() {
      return this.comment.reactionTotals
        .filter((data) => data.count > 0)
        .map((reaction) => {
          if (!reaction.count > 0) return false;
          const emojiData = $reactions.find(
            (data) =>
              data.value === reaction.type || data.name === reaction.type
          );
          return emojiData.value ? emojiData.value : false;
        })
        .filter((emoji) => emoji);
    },
    replyParent() {
      if (this.comment.postLevel < 3) return this.comment;
      return (
        this.parent || {
          id: this.comment.parentPostId,
          postLevel: 2,
          rootPostId: this.comment.rootPostId,
        }
      );
    },
    myReaction() {
      if (!this.comment.myReaction) return false;
      const myReaction = $reactions.find(
        (reaction) => reaction.value === this.comment.myReaction.type
      );
      // return `${myReaction.emoji} ${myReaction.value}`;
      return myReaction.value;
    },
    showComment() {
      return (
        !(
          this.comment.user &&
          this.comment.user.myRelationship &&
          this.comment.user.myRelationship.isBlocked
        ) && this.comment.safe
      );
    },
    commentUser() {
      return this.comment && this.comment.user ? this.comment.user : {};
    },
  },
  created() {
    this.updateLoginStatus();
  },
  methods: {
    async updateLoginStatus() {
      this.isLoggedIn = await $auth.isLoggedInAsUser();
    },
    trigger(name) {
      $bus.$emit(name, this.comment);
    },
    redirectToPostDetailedPage() {
      this.$router.push({
        name: 'PostDetail',
        params: { id: this.comment.rootPostId },
      });
    },
    checkTranslationDemand(finalArray) {
      finalArray.pop();
      this.disableTranslateButton = finalArray.reduce(
        (accumulator, postElement) => accumulator && postElement.word === '',
        true
      );
    },
    async removeReaction() {
      if (this.comment.myReaction) {
        await $postsApi.unreactPost(this.comment);
      }
    },
    async showTranslatedComment() {
      this.isShowingTranslation = true;
      this.loadingTranslation = true;
      try {
        const translatedObject = await this.$apollo.query({
          query: GetTranslatedPost,
          variables: {
            id: this.comment.id,
            languageCode: localStorage.getItem('currentLanguageCode'),
          },
          fetchPolicy: 'network-only',
        });
        this.translatedComment = translatedObject.data.post;
        this.loadingTranslation = false;
      } catch (error) {
        this.loadingTranslation = false;
        this.isShowingTranslation = false;
      }
    },
    hideTranslatedComment() {
      this.isShowingTranslation = false;
      this.loadingTranslation = false;
    },
    edit() {
      this.showEditComment = true;
    },
    closeEditModal() {
      this.showEditComment = false;
    },

    toggleReply() {
      this.showReply = !this.showReply;
      setTimeout(() => {
        if (this.showReply) {
          let composerDivId = `${this.comment.id}_composer`;
          if (this.comment.postLevel > 2) {
            composerDivId = `${this.comment.parentPostId}_composer`;
          }

          document.getElementById(composerDivId).focus();
        }
      }, 100);
    },

    async detectLink(link) {
      this.comment.linkPreview = {
        ...link,
      };
    },
  },
};
</script>

<style scoped>
.post-comment {
  margin-bottom: 15px;
}
.post-comment:last-child,
.post-comment:only-child {
  margin-bottom: 0;
}
.post-comment-primary {
  display: flex;
  flex-direction: row;
}
.spacer-margin {
  margin: 0 20px;
}
.post-comment-avatar {
  display: block;
  margin-right: 10px;
  --cs-avatar-size: 50px;
}
.post-comment-body {
  flex: 1;
}
.post-comment-body-message {
  background-color: var(--cs-gray-01);
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 10px;
}
.post-comment-body-title {
  display: flex;
  align-items: center;
  margin-top: -10px;
}
.post-comment-replies {
  padding-left: 25px;
  margin-top: 10px;
  border-left: solid 3px var(--cs-gray-01);
}
.post-comment-action-icon {
  margin-right: 2px;
}
.comment-response-bar {
  display: flex;
  justify-content: space-between;
}
.spacer {
  flex: 1;
}
.comment-react-button {
  border-style: none;
  background: none;
  padding: 0;
  margin: 0;
  color: inherit;
}
.ch-reaction-buttons {
  display: flex;
  flex-direction: row;
}
.comment-timestamp {
  margin-right: 10px;
}
.emoji-small {
  cursor: pointer;
  width: 14px;
  height: 14px;
  margin: 2px;
}
.emoji {
  cursor: pointer;
  width: 14px;
  height: 14px;
  margin: 5px;
}

.translate-button {
  font-weight: normal;
  cursor: pointer;
  width: 28px;
  height: 28px;
  padding: 5px 0 !important;
}

.message-margin {
  margin: 5px 0 5px 10px;
}

.ch-translation-wrapper {
  display: flex;
  padding: 5px;
}

.ch-spinner {
  margin: 0;
}
</style>
