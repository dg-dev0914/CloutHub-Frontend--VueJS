<template>
  <app-modal :show="showSharedList" :title="shareTitle" @close="onClose">
    <div class="ch-users">
      <app-user-list
        v-if="list_post_shares && list_post_shares.length"
        :users="sharedUsers"
      />
      <app-infinite-loader
        :paused="$apollo.queries.list_post_shares.loading"
        :finished="!mayHaveMore"
        @more="loadMore()"
      />
      <cs-empty-state
        v-if="list_post_shares && list_post_shares.length === 0"
        description="No one has shared this yet"
      />
    </div>
  </app-modal>
</template>

<script>
import AppModal from '@/components/general/Modal.vue';
import AppUserList from '@/components/general/UserList.vue';
import AppInfiniteLoader from '@/components/general/InfiniteLoader.vue';
import ListPostShares from '@/gql/posts/ListPostShares.gql';
import $bus from '@/services/bus';

export default {
  components: {
    AppModal,
    AppUserList,
    AppInfiniteLoader,
  },
  apollo: {
    list_post_shares: {
      query: ListPostShares,
      variables() {
        return {
          id: this.post.id,
        };
      },
      skip() {
        return !this.post;
      },
    },
  },
  data() {
    return {
      users: [],
      showSharedList: false,
      post: null,
      mayHaveMore: true,
    };
  },
  computed: {
    shareTitle() {
      // TODO sharedPostCount is a string.  Should be a number
      if (this.post)
        return this.post.sharedPostCount === '1'
          ? '1 Share'
          : `${this.post.sharedPostCount} Shares`;
      return '';
    },
    sharedUsers() {
      return this.list_post_shares && this.list_post_shares.map((r) => r.user);
    },
  },
  mounted() {
    $bus.$on('show-share-list-modal', (post) => {
      this.showSharedList = true;
      this.post = post;
    });
  },
  methods: {
    onClose() {
      this.showSharedList = false;
      this.list_post_shares = null;
      this.post = null;
    },
    loadMore() {
      if (this.mayHaveMore) {
        this.mayHaveMore = false;
        const userId =
          this.list_post_shares[this.list_post_shares.length - 1].userId;
        this.$apollo.queries.list_post_shares.fetchMore({
          variables: {
            id: this.post.id,
            userId,
          },
          updateQuery: (previousResult, { fetchMoreResult }) => {
            this.mayHaveMore = !!fetchMoreResult.list_post_shares.length;
            return {
              list_post_shares: [
                ...previousResult.list_post_shares,
                ...fetchMoreResult.list_post_shares,
              ],
            };
          },
        });
      }
    },
  },
};
</script>

<style scoped>
.ch-users {
  width: 100%;
}
/* .ch-user-list{
  max-height: 400px;
  overflow: scroll;
} */
</style>
