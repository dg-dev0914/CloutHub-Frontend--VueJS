<template>
  <div>
    <!-- Only appears in detail views -->
    <div v-if="isDetailView">
      <div v-if="comments">
        <post-comment
          :id="'comment.' + comment.id"
          v-for="comment in comments"
          :key="comment.id"
          :comment="comment"
          :post-id="post.id"
        />
      </div>
      <div
        v-if="hiddenCommentCount && !this.$apollo.queries.comments.loading"
        class="
          load-more-comments
          cs-textstyle-paragraph-small-bold
          detail-load-more-comments
        "
        @click="loadMore()"
      >
        {{ hiddenCommentCount }} more comment{{
          hiddenCommentCount > 1 ? 's' : ''
        }}
      </div>
      <app-spinner v-if="$apollo.queries.comments.loading" />
    </div>

    <!-- Latest post -->
    <div v-if="post.comments && !isDetailView">
      <div
        v-if="post.comments && post.replyCount > post.comments.length"
        class="
          load-more-comments
          cs-textstyle-paragraph-small-bold
          list-load-more-comments
        "
        @click="$router.push({ name: 'PostDetail', params: post })"
      >
        {{ post.replyCount - post.comments.length }} earlier comment{{
          post.replyCount - post.comments.length > 1 ? 's' : ''
        }}
      </div>
      <post-comment
        v-for="comment in post.comments"
        :key="comment.id"
        :comment="comment"
        :post-id="post.id"
      />
    </div>
  </div>
</template>

<script>
import AppSpinner from '@/components/general/Spinner.vue';
import ListPostComments from '@/gql/posts/ListPostComments.gql';
import PostComment from './PostComment.vue';

export default {
  components: {
    PostComment,
    AppSpinner,
  },
  props: {
    post: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      mayHaveMore: true,
    };
  },
  apollo: {
    comments: {
      query: ListPostComments,
      variables() {
        return {
          postId: this.post.id,
        };
      },
      skip() {
        return !this.isDetailView;
      },
    },
  },
  async mounted() {
    if (this.$route.query.comment) {
      while (this.mayHaveMore) {
        await this.loadMore();
      }
      setTimeout(() => {
        const key = `comment.${this.$route.query.comment}`;
        const commentElement = document.getElementById(key);
        commentElement.scrollIntoView();
      }, 1000);
    }
  },
  computed: {
    isDetailView() {
      return this.$route.name === 'PostDetail';
    },
    hiddenCommentCount() {
      return this.comments ? this.post.replyCount - this.comments.length : 0;
    },
  },
  methods: {
    loadMore() {
      if (this.mayHaveMore) {
        this.mayHaveMore = false;
        let after = null;
        if (this.comments && this.comments.length) {
          after = this.comments[this.comments.length - 1].createdAt;
        }
        this.$apollo.queries.comments.fetchMore({
          variables: {
            postId: this.post.id,
            after,
          },
          updateQuery: (previousResult, { fetchMoreResult }) => {
            this.mayHaveMore = !!fetchMoreResult.comments.length;
            return {
              comments: [
                ...previousResult.comments,
                ...fetchMoreResult.comments,
              ],
            };
          },
        });
      }
    },
  },
};
</script>

<style>
.reverse-comments {
  display: flex;
  flex-direction: column-reverse;
}
.load-more-comments {
  cursor: pointer;
  color: var(--cs-primary-base);
  text-align: center;
}
.detail-load-more-comments {
  padding-top: 10px;
  margin-top: 10px;
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-top: solid 1px var(--cs-gray-01);
  border-bottom: solid 1px var(--cs-gray-01);
}
.list-load-more-comments {
  text-align: left;
  margin-bottom: 10px;
}
</style>
