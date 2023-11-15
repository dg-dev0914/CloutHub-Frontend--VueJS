<template>
  <app-tab-modal
    v-model="tabIndex"
    :show="showReactions"
    :tabs="tabs"
    custom
    @close="onClose"
    @custom-ip="changeIndex"
  >
    <div v-if="post" slot="body">
      <div v-for="(tab, $index) in tabs" :key="$index">
        <app-post-reaction-user-list
          v-if="$index === tabIndex"
          :post="post"
          :type="tab.value"
        />
      </div>
    </div>
  </app-tab-modal>
</template>

<script>
import AppTabModal from '@/components/general/TabModal.vue';
import AppPostReactionUserList from '@/components/post/response/PostReactionUserList.vue';
import $bus from '@/services/bus';
import PostReactionSummary from '@/gql/posts/PostReactionSummary.gql';

export default {
  components: {
    AppTabModal,
    AppPostReactionUserList,
  },
  data() {
    return {
      showReactions: false,
      post: null,
      tabs: [],
      tabIndex: 0,
    };
  },
  mounted() {
    $bus.$on('show-reaction-list-modal', (post) => {
      this.post = post;
      const tabs = [];
      this.$apollo
        .query({
          query: PostReactionSummary,
          variables: {
            id: this.post.id,
          },
          fetchPolicy: 'network-only',
        })
        .then(({ data }) => {
          data.post.reactionTotals.forEach((reactionType) => {
            if (reactionType.count > 0) {
              tabs.push({
                label: `${reactionType.count}`,
                value: reactionType.type,
              });
            }
          });
          this.tabs = [
            {
              label: `All ${data.post.reactionCount}`,
            },
            ...tabs,
          ];
          this.showReactions = true;
        });
    });
  },
  methods: {
    reset() {
      this.showReactions = false;
      this.tabs = [];
      this.tabIndex = 0;
      this.post = null;
    },
    onClose() {
      this.reset();
    },
    changeIndex(val) {
      this.tabIndex = val;
    },
  },
};
</script>

<style scoped></style>
