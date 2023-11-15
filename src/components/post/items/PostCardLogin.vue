<template>
  <div :class="{ 'post-card-custom': preview }">
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
            class="cs-textstyle-paragraph post-share-comment pre-line"
          >
            <span v-for="(data, i) in shareBodyText" :key="i">
              <!-- Normal text view -->
              <span v-if="data.type === 'text'">{{ data.word }} </span>
              <!-- Post mention in shared post body -->
              <span
                v-if="data.type === 'mention'"
                v-router-link="{
                  name: 'UProfile',
                  params: { username: data.word.replace('@', '') },
                }"
                class="ch-user-mention"
              >
                {{ data.word }}
              </span>
            </span>
          </div>
        </div>

        <div
          class="ch-post-info"
          :class="preview || noActions ? 'no-click' : ''"
        >
          <post-header
            :post="targetPost"
            :preview="preview || noActions"
            :can-delete="canDelete"
          ></post-header>
          <div
            v-if="targetPost.bodyText"
            class="post-message cs-textstyle-paragraph"
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
              <!-- mentions in post boby -->
              <span
                v-if="data.type === 'mention'"
                v-router-link="{
                  name: 'UProfile',
                  params: { username: data.word.replace('@', '') },
                }"
                class="ch-user-mention"
                >{{ data.word }}
              </span>
            </span>
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
          v-if="isMediaPost"
          :link-preview="targetPost.linkPreview"
          :images="targetPost.images"
          :document="targetPost.document"
          :video="targetPost.video"
          :post-id="targetPost.id"
          class="media-container"
        />

        <post-response
          v-if="!preview && !noActions"
          :no-actions="noActions"
          :post="targetPost"
        ></post-response>
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
// Components files
import SharePostHeader from '@/components/post/items/SharePostHeader.vue';
import PostHeader from '@/components/post/items/PostHeader.vue';
import PostTags from '@/components/post/items/PostTags.vue';
import PostMedia from '@/components/post/items/PostMedia.vue';
import PostResponse from '@/components/post/response/PostResponse.vue';

export default {
  name: 'PostCardLogin',
  components: {
    PostHeader,
    PostTags,
    PostMedia,
    PostResponse,
    SharePostHeader,
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
    noActions: {
      type: Boolean,
      default: false,
    },
    canDelete: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    isDetailPage() {
      return this.$route.name === 'PostDetail';
    },
    showWarning() {
      return (this.post.profanityStatus == 'pendingReview'
        && this.post.profanityStatus == 'rejected')
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
      const showAllRoutes = ['PostDetail', 'UProfile', 'Profile'];
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
      if (!this.post.bodyText || this.post.bodyText === 'Shared Post') return [];
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
      // eslint-disable-next-line consistent-return
      return finalArray;
    },
    displayBody() {
      const finalArray = [];
      const postLines = this.targetPost.bodyText.split(/\n/g);
      const previewLink = this.targetPost.linkPreview
        ? this.targetPost.linkPreview.originalLink
        : null;
      postLines.forEach((line) => {
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
        finalArray.push({
          type: 'text',
          word: '\n',
        });
      });
      return finalArray;
    },
    hideLinks() {
      return !!this.targetPost.linkPreview;
    },
  },
  async mounted() {
    if (this.post.video || this.post.type === 'news') {
      await this.$apollo.mutate({
        mutation: IncrementViewCount,
        variables: {
          postId: this.post.id,
        },
      });
    }
  },
  methods: {
    getClickableLink(link) {
      return link.startsWith('http://') || link.startsWith('https://')
        ? link
        : `http://${link}`;
    },
  },
};
</script>
<style>
.no-click {
  pointer-events: none;
}
.ch-user-mention {
  color: var(--cs-primary-dark);
  cursor: pointer;
  margin-right: 5px;
}
.post-card {
  margin: 0px !important;
  padding: 0px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px !important;
}
.ch-post-info {
  padding: 15px;
  padding-bottom: 5px;
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
  padding: 16px 20px;
  padding-top: 0px;
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
</style>
