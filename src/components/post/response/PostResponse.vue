<template>
  <div>
    <div class="ch-post-response">
      <!-- Current post interaction detail -->
      <div class="post-response-summary cs-textstyle-paragraph-small-bold">
        <!-- Reactions on post -->
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
        <!-- Comments on post -->
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
      <!-- Post response action bar -->
      <app-post-response-bar
        :my-reaction="myReaction ? myReaction : null"
        :post="post"
        @remove-reaction="removeReaction"
        @focus="$refs.commentComposer.focus()"
        @share="share"
      />
    </div>
    <div class="ch-post-comments">
      <!-- Comments -->
      <div v-if="post.commentsCount > 0" class="comments-body">
        <app-post-comments :post="post"></app-post-comments>
      </div>
      <!-- Comment Composer -->
      <div class="comment-composer">
        <app-post-comment-composer
          ref="commentComposer"
          :parent="post"
        ></app-post-comment-composer>
      </div>
    </div>
  </div>
</template>

<script>
// Js files
import $postsApi from '@/api/posts';
import $bus from '@/services/bus';
import $reactions from '@/assets/emojis/reactions.json';
// Components files
import AppPostCommentComposer from '@/components/post/composer/PostCommentComposer.vue';
import AppPostComments from '@/components/post/response/PostComments.vue';
import AppPostResponseBar from '@/components/post/response/PostResponseBar.vue';

export default {
  components: {
    AppPostComments,
    AppPostCommentComposer,
    AppPostResponseBar,
  },
  props: {
    post: {
      type: Object,
      required: true,
    },
  },
  computed: {
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
  },
  methods: {
    async removeReaction() {
      if (this.myReaction) {
        await $postsApi.unreactPost(this.post);
      }
    },
    share() {
      const link = `/p/${this.post.slug || this.post.id}`;
      $bus.$emit('show-share-other', {
        link,
        title: 'Share Post',
        post: this.post,
      });
    },
    trigger(name) {
      $bus.$emit(name, this.post);
    },
  },
};
</script>

<style scoped>
.post-response-summary {
  display: flex;
  justify-content: space-between;
  border-bottom: solid 1px var(--cs-gray-02);
  padding: 12px 20px;
  font-size: 15px;
  color: var(--cs-gray-04);
}
.comments-body {
  padding: 16px 20px 6px;
  border-top: 1px solid var(--cs-gray-02);
}
.post-response-buttons {
  display: flex;
  padding: 12px 20px;
  justify-content: space-between;
  text-transform: capitalize;
  margin: 0 -12px;
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
.emoji-small {
  cursor: pointer;
  width: 18px;
  height: 18px;
  margin: 2px;
}
</style>
