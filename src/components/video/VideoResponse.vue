<template>
  <div>
    <div class="ch-post-response">
      <div class="post-response-summary cs-textstyle-paragraph-small-bold">
        <span @click="trigger('show-reaction-list-modal')">
          <span v-for="reaction in userReactions" :key="reaction">
            <img
              class="emoji-small"
              :src="'/assets/emojis/' + reaction + '.png'"
              :alt="reaction"
            />
          </span>
          {{ post.reactionCount }}
          <span v-if="!userReactions || !userReactions.length">
            <i class="ch-icons-reaction"></i>
          </span>
        </span>
        <span
          class="cursor-pointer"
          @click="$router.push({ name: 'PostDetail', params: post })"
          >{{ post.commentsCount }} <i class="ch-icons-comments"></i>
        </span>
        <!-- Post Shares -->
        <span @click="trigger('show-share-list-modal')"
          >{{ post.sharedPostCount || 0 }} <i class="ch-icons-share"></i>
        </span>
      </div>
      <div class="post-response-buttons">
        <cs-action-bar-button v-if="isLoggedIn"
          :id="post.id + '.' + randomNumber + '.reactbutton'"
          :icon="myReaction ? '' : 'ch-icons-reaction'"
          class="capitalize"
          @click="removeReaction"
        >
          <img
            v-if="myReaction"
            class="emoji"
            :src="'/assets/emojis/' + myReaction.value + '.png'"
            :alt="myReaction.value"
          />
          <span v-if="myReaction">{{ myReaction.name }}</span>
          <span v-else>React</span>
        </cs-action-bar-button>
        <cs-action-bar-button v-if="isLoggedIn"
          icon="ch-icons-comments"
          @click="$refs.commentComposer.focus()"
        >
          Comment
        </cs-action-bar-button>
        <cs-action-bar-button icon="ch-icons-share" @click="share()">
          Share
        </cs-action-bar-button>
      </div>
      <div class="cs-textstyle-paragraph video-description">
        <div class="cs-textstyle-paragraph-small">
          <div v-if="!post.video.description" class="description-block">
            No Description
          </div>
          <div v-else class="description-block">
            <app-expandable-text
              class="cs-textstyle-paragraph video-title"
              :post="post"
              is-description
              :max-lines="5"
              placeholder="Untitled Video"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="ch-post-comments">
      <post-reaction
        v-if="!myReaction"
        :post="post"
        :target-element-id="post.id + '.' + randomNumber + '.reactbutton'"
      ></post-reaction>
      <div v-if="post.replyCount > 0" class="comments-body">
        <post-comments :post="post"></post-comments>
      </div>
      <div class="comment-composer">
        <post-comment-composer
          ref="commentComposer"
          :parent="post"
        ></post-comment-composer>
      </div>
    </div>
  </div>
</template>

<script>
import $auth from '@/services/auth';
import $postsApi from '@/api/posts';
import $bus from '@/services/bus';
import $reactions from '@/assets/emojis/reactions.json';
import PostReaction from '@/components/post/response/PostReaction.vue';
import PostCommentComposer from '@/components/post/composer/PostCommentComposer.vue';
import PostComments from '@/components/post/response/PostComments.vue';
import AppExpandableText from '@/components/general/ExpandableText.vue';

export default {
  components: {
    PostComments,
    PostCommentComposer,
    PostReaction,
    AppExpandableText,
  },
  props: {
    post: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showFullText: false,
      isLoggedIn: false,
      randomNumber: Math.floor(Math.random() * 1000),
    };
  },
  computed: {
    embedCode() {
      return `<iframe width="710" height="400" allowfullscreen="true" src="${process.env.VUE_APP_SHARE_DOMAIN}/embed/${this.post.id}"></iframe>`;
    },
    userReactions() {
      return this.post.reactionTotals
        .filter((data) => data.count > 0)
        .map((reaction) => {
          if (reaction.count > 0) {
            const emojiData = $reactions.find(
              (data) =>
                data.value === reaction.type || data.name === reaction.type
            );
            return emojiData.value || false;
          }
          return false;
        })
        .filter((emoji) => emoji);
    },
    myReaction() {
      if (!this.post.myReaction) return false;
      const myReaction = $reactions.find(
        (reaction) => reaction.value === this.post.myReaction.type
      );
      return myReaction || false;
    },
    displayedText() {
      return this.post.video.description;
    },
    readMoreText() {
      return this.showFullText ? 'see less' : 'see more';
    },
  },
  created() {
    this.updateLoginStatus();
  },
  methods: {
    async updateLoginStatus() {
      this.isLoggedIn = await $auth.isLoggedInAsUser();
    },
    async copyEmbedCode() {
      await navigator.clipboard.writeText(this.embedCode);
      this.$toast.open({
        message: 'Code copied',
        type: 'success',
        duration: 1000,
        dismissible: true,
        position: 'top',
      });
    },
    async emitRefresh() {
      this.$emit('refresh');
    },
    updateReactionSummary(existingFieldData) {
      const newData = existingFieldData.map((data) => {
        if (data.type === this.post.myReaction.type) {
          return {
            count: data.count - 1,
            type: data.type,
          };
        }
        return data;
      });
      return newData;
    },
    async removeReaction() {
      if (this.myReaction) {
        await $postsApi.unreactPost(this.post);
        await this.emitRefresh();
      }
    },
    share() {
      const link = `/v/${this.post.slug || this.post.id}`;
      $bus.$emit('show-share-other', {
        link,
        title: 'Share Video',
        post: this.post,
      });
    },
    commentClick() {
      document.getElementById(`${this.post.id}_composer`).focus();
    },
    trigger(name) {
      $bus.$emit(name, this.post);
    },
    async loadMoreReplies() {
      this.$router.push({
        name: 'PostDetail',
        params: this.post,
      });
    },
  },
};
</script>

<style scoped>
.cs-textstyle-paragraph {
  white-space: pre !important;
}
.post-response-summary {
  display: flex;
  justify-content: space-between;
  border-bottom: solid 1px var(--cs-gray-02);
  padding: 12px 20px;
  padding-bottom: 12px;
  align-items: center;
  font-size: 15px;
  color: var(--cs-gray-04);
}
.comments-body {
  padding: 16px 20px;
  padding-bottom: 6px;
  border-top: 1px solid var(--cs-gray-02);
}
.post-response-buttons {
  display: flex;
  padding: 12px 20px;
  justify-content: space-between;
  text-transform: capitalize;
  margin: 0 -12px;
  border-bottom: solid 1px var(--cs-gray-02);
}
.comment-composer {
  margin-top: 0;
  padding: 16px;
  border-top: 1px solid var(--cs-gray-02);
}
.post-response-summary span {
  cursor: pointer;
}
.title-case {
  text-transform: capitalize;
}
.margin-bottom-10 {
  margin-bottom: 10px;
  cursor: pointer;
}
.video-description {
  padding: 12px 20px;
}
.embed-btn {
  margin-right: 6px;
}
.emoji-small {
  cursor: pointer;
  width: 18px;
  height: 18px;
  margin: 2px;
}
.emoji {
  cursor: pointer;
  width: 20px;
  height: 20px;
  margin: 5px;
}
.see-more-button {
  color: var(--cs-gray-04);
  cursor: pointer;
}
</style>
