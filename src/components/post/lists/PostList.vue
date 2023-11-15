<template>
  <div>
    <!-- Post list view -->
    <div v-if="posts && posts.length && featuredPosts" class="ch-profile-post-list">
      <dynamic-scroller
        cache-id="followingPostList"
        :items="filteredPosts"
        :min-item-size="1"
        :page-mode="true"
        class="scroller"
      >
        <template v-slot="{ item, index, active }">
          <dynamic-scroller-item
            :active="active"
            :item="item"
            :data-index="index"
            :data-active="active"
          >
            <app-post-card :post="item" :active="active"  :isFeaturedPost="isFeaturedPost(item.id)"/>
            <app-follow-card-segment
              v-if="showFollowCard(index)"
              :is-preview="false"
            />
            <app-recommended-live-video-list
              v-if="showRecommendedVideosCard(index)"
            />
          </dynamic-scroller-item>
        </template>
      </dynamic-scroller>
    </div>
    <!-- Empty Post List view -->
    <div v-if="(!posts || !posts.length) && !$apollo.queries.posts.loading">
      <app-follow-card-segment :is-preview="false"></app-follow-card-segment>
      <app-recommended-live-video-list />
      <app-recommended-just-the-news-video-list />
      <cs-empty-state description="No Post to display" />
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
// Components files
import AppPostCard from '@/components/post/items/PostCard.vue';
import AppInfiniteSimple from '@/components/general/InfiniteSimple.vue';
import AppFollowCardSegment from '@/components/followCards/FollowCardSegment.vue';
import AppRecommendedLiveVideoList from '@/components/video/RecommendedLiveVideoList.vue';
import ListFeaturedPosts from '@/gql/posts/ListFeaturedPosts.gql';

export default {
  components: {
    AppPostCard,
    AppInfiniteSimple,
    AppFollowCardSegment,
    AppRecommendedLiveVideoList,
  },
  apollo: {
    posts: {
      query() {
        return this.query;
      },
    },
    featuredPosts: {
      query: ListFeaturedPosts,
    },
  },
  props: {
    query: {
      type: Object,
      required: true,
      default: () => {},
    },
  },
  async mounted() {
    await this.$apollo.queries.featuredPosts.refetch();
  },
  computed: {
    filteredPosts() {
      return this.posts.filter((post) => {
        if (!post.user) return false;
        if (post.user.id === $auth.getUserId()) {
          return true;
        }
        const isBlocked =
          post.user.myRelationship && post.user.myRelationship.isBlocked;
        const isSharedPostBlocked =
          post.sharedPost &&
          post.sharedPost.myRelationship &&
          post.sharedPost.myRelationship.isBlocked;
        return (
          !isBlocked &&
          !isSharedPostBlocked &&
          post.profanityStatus !== 'rejected' &&
          post.safe &&
          (!post.sharedPost || post.sharedPost.safe)
        );
      });
    },
  },
  methods: {
    showFollowCard(index) {
      return index !== 0 && (index === 2 || index % 9 === 0);
    },
    showRecommendedVideosCard(index) {
      return index === 13;
    },
    isFeaturedPost(postId) {
      return this.featuredPosts.some(x => x.postid === postId);
    }
  },
};
</script>
