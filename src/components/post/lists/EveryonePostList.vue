<template>
  <div>
    <!-- New Post button -->
    <div v-if="showNewPosts" class="new-posts-holder">
      <cs-button size="small" block @click="more()">New Posts</cs-button>
    </div>
    <div v-if="posts && featuredPosts" class="ch-profile-post-list">
      <dynamic-scroller
        cache-id="everyonePostList"
        :items="sortedPosts"
        :min-item-size="30"
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
            <app-post-card :post="item" :active="active" :isFeaturedPost="isFeaturedPost(item.id)" />
            <app-follow-card-segment
              v-if="showFollowCard(index)"
              :is-preview="false"
            />

            <app-recommended-live-video-list
              v-if="showRecommendedVideosCard(index)"
            />
            <div v-if="index % 5 == 2" class="ad-slot--wrapper">
              <app-ad-slot zoneName="ZZNEW2" invocationCode="39" width="600" height="160" />
            </div>
          </dynamic-scroller-item>
        </template>
      </dynamic-scroller>
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
//  Graphql files
import ListPublicPosts from '@/gql/posts/ListPublicPosts.gql';
import PublicListPublicPosts from '@/gql/posts/PublicListPublicPosts.gql';

// Components files
import AppPostCard from '@/components/post/items/PostCard.vue';
import AppInfiniteSimple from '@/components/general/InfiniteSimple.vue';
import AppFollowCardSegment from '@/components/followCards/FollowCardSegment.vue';
import AppRecommendedLiveVideoList from '@/components/video/RecommendedLiveVideoList.vue';
import $window from '@/services/window';
import AppAdSlot from '@/components/sidebar/AdSlot.vue';
import ListFeaturedPosts from '@/gql/posts/ListFeaturedPosts.gql';

export default {
  components: {
    AppPostCard,
    AppInfiniteSimple,
    AppFollowCardSegment,
    AppRecommendedLiveVideoList,
    AppAdSlot
  },
  props: {
    pinPost: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  apollo: {
    posts: {
      query() {
        return this.isLoggedIn ? ListPublicPosts : PublicListPublicPosts;
      },
    },
    featuredPosts: {
      query: ListFeaturedPosts,
    },
  },
  data() {
    return {
      showNewPosts: false,
      isLoggedIn: false,
    };
  },
  computed: {
    // Filter post from blocked users and unsafe posts
    filteredPosts() {
      const preposts = [];
      this.posts.forEach((post) => {
        if (!preposts.some((p) => p.id === post.id)) preposts.push(post);
      });
      const filtered = preposts.filter((post) => {
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
          post.safe &&
          (!post.sharedPost || post.sharedPost.safe)
        );
      });
      return filtered;
    },
    sortedPosts() {
      if (!this.pinPost) {
        return this.filteredPosts;
      }
      const myUserId = $auth.getUserId();
      const myLastPost = this.filteredPosts.find(
        (post) => post.user.id === myUserId
      );
      if (!myLastPost) {
        return this.filteredPosts;
      }
      const postList = this.filteredPosts.slice();
      const index = postList.indexOf(myLastPost);
      postList.splice(index, 1);
      postList.unshift(myLastPost);
      return postList;
    },
  },
  async mounted() {
    this.queueNotice();
    await this.$apollo.queries.featuredPosts.refetch();
  },
  created() {
    this.updateLoginStatus();
  },
  methods: {
    async updateLoginStatus() {
      this.isLoggedIn = await $auth.isLoggedInAsUser();
    },
    queueNotice() {
      setTimeout(() => {
        this.showNewPosts = true;
      }, 90 * 1000);
    },
    async more() {
      this.showNewPosts = false;
      $window.scrollToTop();
      await this.$apollo.queries.posts.refetch();
      this.queueNotice();
      this.$emit('refreshing');
    },
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
<style scoped>
.new-posts-holder {
  position: fixed;
  z-index: 1000;
  left: 50%;
  width: 140px;
  margin-left: -70px;
  top: 50px;
}
.ad-slot--wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
