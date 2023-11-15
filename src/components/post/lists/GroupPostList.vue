<template>
  <div>
    <!-- Empty Post List view -->
    <cs-empty-state
      v-if="posts && posts.length === 0"
      title="There are no posts yet"
      description="Be the first one to start a discussion!"
    />
    <!-- Post list view -->
    <div v-if="posts" class="ch-profile-post-list">
      <div
        v-for="post in displayedPost"
        :key="post.id"
        :class="{ 'post-pinned': post.isPinned }"
      >
        <div v-if="post.isPinned" class="ch-post-card-label-pinned">Pinned</div>
        <!-- Approve/Delete view for post reviewers and owner -->
        <div v-if="post.canReviewPost" class="ch-pending-review">
          This post is pending {{ isModerator ? 'your' : 'Admin' }} approval
          <div>
            <!-- Approve button is only visible to moderators -->
            <cs-button
              v-if="isModerator"
              class="action-btn"
              size="small"
              @click="approvePost(post)"
            >
              Approve
            </cs-button>
            <cs-button
              class="action-btn"
              fill="outline"
              size="small"
              @click="deletePost(post)"
            >
              Delete
            </cs-button>
          </div>
        </div>
        <app-post-card :post="post" :can-delete="isModerator" />
      </div>
    </div>
    <!-- Infinite post loader -->
    <app-infinite-simple
      :query="$apollo.queries.posts"
      sort-key="createdAt"
    ></app-infinite-simple>
  </div>
</template>

<script>
// Js files
import $auth from '@/services/auth';
import $apollo from '@/services/apollo';
import $popups from '@/services/popups';
//  Graphql files
import ListGroupPosts from '@/gql/posts/ListGroupPosts.gql';
import MarkGroupPostReviewed from '@/gql/posts/MarkGroupPostReviewed.gql';
import DeletePost from '@/gql/posts/DeletePost.gql';
// Components files
import AppPostCard from '@/components/post/items/PostCard.vue';
import AppInfiniteSimple from '@/components/general/InfiniteSimple.vue';

export default {
  components: {
    AppPostCard,
    AppInfiniteSimple,
  },
  props: {
    group: {
      type: Object,
      required: true,
    },
    isModerator: {
      type: Boolean,
      default: false,
    },
  },
  async mounted() {
    await this.$apollo.queries.posts.refetch();
  },
  apollo: {
    posts: {
      query: ListGroupPosts,
      variables() {
        return {
          id: this.group.id,
        };
      },
    },
  },
  computed: {
    displayedPost() {
      return this.posts.map((data) => {
        if (
          this.group.enableAdminReview &&
          (this.isModerator || data.user.id === $auth.getUserId()) &&
          data.pendingAdminReview
        ) {
          return {
            ...data,
            canReviewPost: true,
          };
        }
        return data;
      });
    },
  },
  methods: {
    async deletePost(post) {
      const confirmDelete = await $popups.confirmDelete({
        title: 'Delete Post',
        message: 'Are you sure you wish to delete this post?',
      });
      if (!confirmDelete) return;
      await this.$apollo.mutate({
        mutation: DeletePost,
        variables: {
          postId: post.id,
        },
        optimisticResponse: {},
        update: (cache) => {
          const normalizedId = cache.identify(post);
          cache.evict({ id: normalizedId });
          cache.gc();
        },
      });
    },
    approvePost(post) {
      return $apollo.mutate({
        mutation: MarkGroupPostReviewed,
        variables: {
          postId: post.id,
        },
        update: (cache) => {
          cache.modify({
            id: cache.identify(post),
            fields: {
              pendingAdminReview() {
                return false;
              },
              safe() {
                return true;
              },
            },
          });
        },
      });
    },
  },
};
</script>

<style>
.post-pinned {
  position: relative;
  outline: 2px solid rgb(160, 167, 173);
}

.ch-post-card-label-pinned {
  position: absolute;
  top: 0;
  left: 50%;
  width: 120px;
  margin-left: -60px;
  padding-bottom: 2px;
  background: rgb(160, 167, 173);
  border-radius: 0 0 10px 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
  text-align: center;
  font-weight: 500;
  color: white;
}

.ch-pending-review {
  background: var(--cs-gray-02);
  padding: 5px 5px;
  border-bottom: 1px solid var(--cs-gray-01);
  justify-content: space-between;
  display: flex;
}
.action-btn {
  margin-right: 8px;
}
</style>
