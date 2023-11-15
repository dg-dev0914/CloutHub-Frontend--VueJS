<template>
  <div :class="{ 'post-card-custom': preview }" @click="incrementFeaturedPostCount('feed_clickscount')">
    <!-- Post pending review or rejected message -->
    <div
      v-if="showPost && showWarning"
      class="profanityClass cs-textstyle-paragraph-small-bold"
    >
      <!--<i class="cs-icons-warning"></i>-->
      <span v-if="post.profanityStatus === 'pendingReview'">
        <!--
        <template v-if="post.video">
          The content of a video you are posting was not properly recognized by
          the Artificial Intelligence we use to prevent inappropriate videos. It
          has been sent to a staff person to review it. This should only take a
          moment. Thank you for your understanding.
        </template>
        <template v-else>
          The content of an image you are posting was not properly recognized by
          the Artificial Intelligence we use to prevent inappropriate images. It
          has been sent to a staff person to review it. This should only take a
          moment. Thank you for your understanding.
        </template>
        -->
      </span>
      <span v-if="post.profanityStatus === 'rejected'">
        This post violates our community policies, and is not visible to anyone
        else.
      </span>
    </div>
    <cs-card v-if="isViewRootPostVisible" class="post-card">
      <div slot="body" class="post-mention">
        <p
          v-if="wasMentioned"
          class="post-mention-message cs-textstyle-paragraph"
        >
          You were mentioned in a comment by
          <span
            v-router-link="{
              name: 'UProfile',
              params: { username: formatUsername(post.user.username) },
            }"
            class="ch-user-mention"
          >
            {{ post.user.username }}
          </span>
        </p>
        <p v-else class="post-mention-message cs-textstyle-paragraph">
          Open post page
        </p>
        <cs-button
          size="small"
          fill="outline"
          @click="redirectToPostDetailedPage"
          >View Post</cs-button
        >
      </div>
    </cs-card>
    <!-- Post view -->
    <cs-card v-if="showPost" class="post-card">
      <div slot="body">
        <!-- Shared Post view -->
        <div
          v-if="post.sharedPost"
          class="post-card-share-header"
          :class="preview ? 'no-click' : ''"
        >
          <div class="cs-textstyle-paragraph-small post-card-share-data">
            <share-post-header
              v-if="post.sharedPost"
              :post="post"
              :preview="preview"
            ></share-post-header>
          </div>
          <div
            v-if="shareBodyText.length"
            class="
              cs-textstyle-paragraph
              post-share-comment
              pre-line
              cursor-pointer
            "
            @click="
              $router.push({
                name: 'PostDetail',
                params: { id: post.rootPostId },
              })
            "
          >
            <span v-for="(data, i) in shareBodyText" :key="i">
              <!-- Normal text view -->
              <span v-if="data.type === 'text'">{{ data.word }} </span>
              <!-- Post mention in shared post body -->
              <span
                v-if="data.type === 'mention'"
                v-router-link="{
                  name: 'UProfile',
                  params: { username: formatUsername(data.word) },
                }"
                class="ch-user-mention"
              >
                {{ data.word }}
              </span>
            </span>
          </div>
          <img
            v-if="isTranslatingSharedPost"
            src="@/assets/images/translation_icon-orange.svg"
            class="translate-shared-button"
            @click="showTranslatedPost"
          />
          <div
            v-if="isShowingTranslation && post.sharedPost"
            class="ch-translation-wrapper"
          >
            <img
              v-if="isHidingTranslateSharedPost"
              class="translate-shared-button"
              src="@/assets/images/translation_icon-orange.svg"
              @click="hideTranslatedPost"
            />
            <div class="post-message cs-textstyle-paragraph message-margin">
              <span
                v-for="(data, i) in displayTranslatedBody"
                :key="i + data.word"
              >
                <span v-if="data.type === 'text'">{{ data.word }} </span>

                <a
                  v-if="data.type === 'link'"
                  class="ch-link"
                  :href="data.link"
                  target="_blank"
                >
                  {{ data.word }}
                </a>

                <span
                  v-if="data.type === 'mention'"
                  v-router-link="{
                    name: 'UProfile',
                    params: { username: formatUsername(data.word) },
                  }"
                  class="ch-user-mention"
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
        </div>

        <div class="ch-post-info" :class="preview ? 'no-click' : ''" v-if="isNavBarVisible">
          <post-header
            :post="targetPost"
            :preview="preview"
            :can-delete="canDelete"
          ></post-header>
          <div
            v-if="targetPost.bodyText"
            class="post-message cs-textstyle-paragraph cursor-pointer"
            @click="redirectToPostDetailedPage"
          >
            <span v-for="(data, i) in displayBody" :key="i">
              <!-- Normal text in body -->
              <span v-if="data.type === 'text'">{{ data.word }} </span>
              <!-- Link in post poby -->
              <a
                v-if="data.type === 'link'"
                class="ch-link"
                :href="data.link"
                target="_blank"
              >
                {{ data.word }}
              </a>
              <!-- mentions in post body -->
              <span
                v-if="data.type === 'mention'"
                v-router-link="{
                  name: 'UProfile',
                  params: { username: formatUsername(data.word) },
                }"
                class="ch-user-mention"
                >{{ data.word }}
              </span>
            </span>
          </div>
          <img
            v-if="isTranslatingPost"
            src="@/assets/images/translation_icon-orange.svg"
            class="translate-button"
            @click="showTranslatedPost"
          />
          <div
            v-if="isShowingTranslation && !post.sharedPost"
            class="ch-translation-wrapper"
          >
            <img
              v-if="isHidingTranslatePost"
              class="translate-button"
              src="@/assets/images/translation_icon-orange.svg"
              @click="hideTranslatedPost"
            />
            <div class="post-message cs-textstyle-paragraph message-margin">
              <span
                v-for="(data, i) in displayTranslatedBody"
                :key="i + data.word"
              >
                <span v-if="data.type === 'text'">{{ data.word }} </span>

                <a
                  v-if="data.type === 'link'"
                  class="ch-link"
                  :href="data.link"
                  target="_blank"
                >
                  {{ data.word }}
                </a>

                <span
                  v-if="data.type === 'mention'"
                  v-router-link="{
                    name: 'UProfile',
                    params: { username: formatUsername(data.word) },
                  }"
                  class="ch-user-mention"
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
          <post-tags
            v-if="targetPost.tags && targetPost.tags.length"
            :tags="targetPost.tags"
          />
          <cs-small-tag v-if="targetPost.location" variant="default">
            <i class="cs-icons-marker-filled"></i>
            {{ targetPost.location }}
          </cs-small-tag>
        </div>

        <post-media
          v-if="isMediaPost && isNavBarVisible"
          :link-preview="targetPost.linkPreview"
          :images="targetPost.images"
          :document="targetPost.document"
          :video="targetPost.video"
          :post-id="targetPost.id"
          :autoplay="autoplay"
          class="media-container"
        />

        <post-response v-if="!preview" :post="targetPost"></post-response>
      </div>
    </cs-card>
  </div>
</template>

<script>
// Js files
import linkifyStr from 'linkifyjs/string';
import $auth from '@/services/auth';
//  Graphql files
import IncrementViewCount from '@/gql/videos/IncrementViewCount.gql';
import GetTranslatedPost from '@/gql/posts/GetTranslatedPost.gql';
// Components files
import SharePostHeader from '@/components/post/items/SharePostHeader.vue';
import PostHeader from '@/components/post/items/PostHeader.vue';
import PostTags from '@/components/post/items/PostTags.vue';
import PostMedia from '@/components/post/items/PostMedia.vue';
import PostResponse from '@/components/post/response/PostResponse.vue';
import AppSpinner from '@/components/general/Spinner.vue';
import IncrementFeaturedPostCount from '@/gql/posts/IncrementFeaturedPostCount.gql'

export default {
  name: 'PostCard',
  components: {
    PostHeader,
    PostTags,
    PostMedia,
    PostResponse,
    SharePostHeader,
    AppSpinner,
  },
  props: {
    post: {
      type: Object,
      required: true,
    },
    preview: {
      type: Boolean,
      default: false,
    },
    canDelete: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: false,
    },
    autoplay: {
      type: Boolean,
      default: false,
    },
    isFeaturedPost: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      translatedPost: null,
      isShowingTranslation: false,
      loadingTranslation: false,
      disableTranslateButton: false,
      isNavBarVisible:true,
    };
  },
  computed: {
    isTranslatingSharedPost() {
      return (
        this.shareBodyText.length &&
        !this.isShowingTranslation &&
        this.post.sharedPost &&
        !this.disableTranslateButton
      );
    },
    isTranslatingPost() {
      return (
        this.targetPost.bodyText &&
        !this.isShowingTranslation &&
        !this.post.sharedPost &&
        !this.disableTranslateButton
      );
    },
    isHidingTranslateSharedPost() {
      return this.shareBodyText.length && !this.disableTranslateButton;
    },
    isHidingTranslatePost() {
      return this.targetPost.bodyText && !this.disableTranslateButton;
    },
    isViewRootPostVisible() {
      if (!this.post.rootPostId) return false;
      return this.post.id !== this.post.rootPostId;
    },
    async wasMentioned() {
      const me = await $auth.getUser();
      return (
        this.post.id !== this.post.rootPostId &&
        this.post.bodyText.includes(me.username)
      );
    },
    isDetailPage() {
      return this.$route.name === 'PostDetail';
    },
    showWarning() {
      return (
        this.post.profanityStatus === 'pendingReview' ||
        this.post.profanityStatus === 'rejected'
      );
    },
    targetPost() {
      return this.post.sharedPost || this.post;
    },
    isMediaPost() {
      return (
        this.targetPost.linkPreview ||
        this.targetPost.images ||
        this.targetPost.document ||
        this.targetPost.video
      );
    },
    showPost() {
      if (this.post.user.id === $auth.getUserId()) {
        return true;
      }
      const showAllRoutes = ['PostDetail'];
      if (showAllRoutes.includes(this.$router.currentRoute.name)) {
        return true;
      }
      if (this.post.canReviewPost) {
        return true;
      }
      if (this.preview) return true;
      const isBlocked =
        this.post.user.myRelationship &&
        this.post.user.myRelationship.isBlocked;
      const isSharedPostBlocked =
        this.post.sharedPost &&
        this.post.sharedPost.myRelationship &&
        this.post.sharedPost.myRelationship.isBlocked;
      return (
        !isBlocked &&
        !isSharedPostBlocked &&
        this.post.safe &&
        (!this.post.sharedPost || this.post.sharedPost.safe) &&
        (!this.post.sharedPost || !this.post.sharedPost.user.suspended)
      );
    },
    displayText() {
      return (
        this.targetPost &&
        this.targetPost.bodyText &&
        linkifyStr(this.targetPost.bodyText, {
          target: {
            url: '_blank',
          },
        })
      );
    },
    shareBodyText() {
      if (!this.post.sharedPost) return;
      if (!this.post.bodyText || this.post.bodyText === 'Shared Post')
        return [];
      const bodyArray = this.post.bodyText.split(' ');
      const finalArray = [];
      bodyArray.forEach((data) => {
        if (data.startsWith('@')) {
          let matched = false;
          this.post.mentions.forEach((mention) => {
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
      this.checkSharedTranslationDemand(finalArray);
      return finalArray;
    },
    displayBody() {
      const finalArray = [];
      const postLines = this.targetPost.bodyText.split(/\n/g);
      const previewLink = this.targetPost.linkPreview
        ? this.targetPost.linkPreview.originalLink
        : null;
      postLines.forEach((line, index) => {
        const isNotLastLine = index < postLines.length - 1;
        const bodyArray = line.split(' ');
        bodyArray.forEach((data) => {
          const link = data.match(
            /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)/g
          );
          if (link) {
            const email = data.match(/.*@.*/);
            if (data !== previewLink || email) {
              let clicableLink;
              if (email) clicableLink = `mailto:${data}`;
              else clicableLink = this.getClickableLink(data);
              finalArray.push({
                type: 'link',
                word: data,
                link: clicableLink,
              });
            }
          } else if (data.startsWith('@')) {
            let matched = false;
            this.targetPost.mentions.forEach((mention) => {
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

        if (isNotLastLine) {
          finalArray.push({
            type: 'text',
            word: '\n',
          });
        }
      });
      this.checkTranslationDemand(finalArray);
      return finalArray;
    },
    displayTranslatedBody() {
      const finalArray = [];
      if (this.translatedPost) {
        const postLines = this.translatedPost.translated.result.split(/\n/g);
        const previewLink = this.targetPost.linkPreview
          ? this.targetPost.linkPreview.originalLink
          : null;
        postLines.forEach((line, index) => {
          const isNotLastLine = index < postLines.length - 1;
          const bodyArray = line.split(' ');
          bodyArray.forEach((data) => {
            const link = data.match(
              /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g
            );
            if (link) {
              const email = data.match(/.*@.*/);
              if (data !== previewLink || email) {
                let clicableLink;
                if (email) clicableLink = `mailto:${data}`;
                else clicableLink = this.getClickableLink(data);
                finalArray.push({
                  type: 'link',
                  word: data,
                  link: clicableLink,
                });
              }
            } else if (data.startsWith('@')) {
              let matched = false;
              this.targetPost.mentions.forEach((mention) => {
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

          if (isNotLastLine) {
            finalArray.push({
              type: 'text',
              word: '\n',
            });
          }
        });
      }
      return finalArray;
    },
    hideLinks() {
      return !!this.targetPost.linkPreview;
    },
  },
  watch: {
    active() {
      this.hideTranslatedPost();
    },
  },
  mounted() {
    const routeName = this.$route.name;
    if(routeName==='PostEmbedDetail') {
      this.isNavBarVisible = false;  
    }    
    this.incrementViewCount();
    this.incrementFeaturedPostCount('feed_impressionscount');
    this.incrementFeaturedPostCount('feed_viewscount');
  },
  updated() {
    this.incrementViewCount();
  },
  methods: {
    checkSharedTranslationDemand(finalArray) {
      this.disableTranslateButton =
        finalArray && finalArray.length
          ? finalArray.reduce(
              (accumulator, postElement) =>
                accumulator && !!(postElement.word === '' || postElement.link),
              true
            )
          : false;
    },
    checkTranslationDemand(finalArray) {
      this.disableTranslateButton = finalArray.reduce(
        (accumulator, postElement) =>
          accumulator && !!(postElement.word === '' || postElement.link),
        true
      );
    },
    redirectToPostDetailedPage() {
      this.$router.push({
        name: 'PostDetail',
        params: { id: this.post.rootPostId },
      });
    },
    formatUsername(username) {
      return username.replace('@', '');
    },
    async showTranslatedPost() {
      this.isShowingTranslation = true;
      this.loadingTranslation = true;
      try {
        const translatedObject = await this.$apollo.query({
          query: GetTranslatedPost,
          variables: {
            id: this.post.id,
            languageCode: localStorage.getItem('currentLanguageCode'),
          },
          fetchPolicy: 'network-only',
        });
        this.translatedPost = translatedObject.data.post;
        this.loadingTranslation = false;
      } catch (error) {
        console.log('Error when translating post:', error);
        this.loadingTranslation = false;
        this.isShowingTranslation = false;
      }
    },
    hideTranslatedPost() {
      this.isShowingTranslation = false;
      this.loadingTranslation = false;
      this.translatedPost = null;
    },
    incrementViewCount() {
      if (this.post.video || this.post.type === 'news') {
        this.$apollo.mutate({
          mutation: IncrementViewCount,
          variables: {
            postId: this.post.id,
          },
        });
      }
    },
    getClickableLink(link) {
      return link.startsWith('http://') || link.startsWith('https://')
        ? link
        : `http://${link}`;
    },
    async incrementFeaturedPostCount(property) {
      if(this.isFeaturedPost) {
        this.$apollo.mutate({
          mutation: IncrementFeaturedPostCount,
          variables: {
            postId: this.post.id,
            property
          },
        });
      }
    }
  },
};
</script>
<style>
.no-click {
  pointer-events: none;
}

.ch-user-mention {
  margin-right: 5px;
  padding: 3px;
  background: var(--cs-gray-01);
  color: var(--cs-primary-dark);
  font-weight: 600;
  border-radius: 5px;
  cursor: pointer;
}

.ch-user-mention--comment {
  background: var(--cs-gray-00);
}

.post-card {
  margin: 0 !important;
  padding: 0;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px !important;
}
.ch-post-info {
  padding: 15px 15px 5px;
}
.cs-card__info {
  padding: 0 !important;
}
.post-message {
  white-space: pre-line;
  margin-top: 10px;
}
.post-card-share-data {
  padding: 16px 20px;
}
.post-card-share-header {
  color: var(--cs-gray-05);
  border-bottom: solid 1px var(--cs-gray-02);
}
.post-share-comment {
  padding: 0 20px 8px;
  white-space: pre-line;
}

.media-container > .ch-link-preview,
.media-container > .cs-file-preview {
  padding: 0 15px;
}
.media-container > div.post-video,
.media-container > div.post-image {
  padding: 0;
}
.ch-read-more {
  color: var(--cs-primary-base);
  cursor: pointer;
}
.hideLinks a {
  display: none;
}
.profanityClass {
  background: var(--cs-gray-02);
  padding: 5px 5px;
  border-bottom: 1px solid var(--cs-gray-01);
}
.ch-link {
  color: var(--cs-gray-04);
  cursor: pointer;
  margin-right: 5px;
}
.post-card-custom {
  pointer-events: none;
}

.post-mention {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 15px;
}

.post-mention-message {
  margin: 0;
}

.translate-button {
  font-weight: normal;
  cursor: pointer;
  width: 30px;
  height: 30px;
  padding: 5px 0 !important;
}

.translate-shared-button {
  font-weight: normal;
  cursor: pointer;
  width: 30px;
  height: 30px;
  margin-left: 10px;
  margin-bottom: 5px;
  padding: 2px 0 !important;
}

.message-margin {
  margin: 5px 0px 5px 10px;
}

.ch-translation-wrapper {
  display: flex;
  padding: 5px;
}

.ch-spinner {
  margin: 0;
}
</style>
