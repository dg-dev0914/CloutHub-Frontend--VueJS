<template>
  <app-modal
    :show="showModal"
    class="ch-share-modal"
    :title="title"
    @close="onClose"
  >
    <div v-if="user" class="ch-share-modal__body">
      <app-spinner v-if="saving" />
      <div v-if="!saving" class="ch-share-modal__content">
        <app-post-composer-text
          :user="user"
          :is-user-location="false"
          @textHandle="textHandle"
          @blockPosting="blockPosting"
        />
        <div
          v-if="postToBeShared && !isMeeting"
          class="ch-share-modal__content"
        >
          <app-post-card :post="post" :preview="true" />
        </div>
        <div v-if="isMeeting && postLink">
          <!-- Links -->
          <app-post-link-preview
            v-if="postLink.linkPreview"
            :preview="true"
            :title="postLink.linkPreview.title"
            :description="postLink.linkPreview.details"
            :picture="postLink.linkPreview.image"
            :src="postLink.linkPreview.url"
          />
        </div>
      </div>
    </div>
    <div v-if="user" slot="footer" class="ch-share-clouthub__footer">
      <cs-button size="small" :disabled="saving || isBlocked" @click="onShare"
        >Share</cs-button
      >
    </div>
  </app-modal>
</template>

<script>
import $auth from '@/services/auth';
import $bus from '@/services/bus';
import $postsApi from '@/api/posts';
import $popups from '@/services/popups';

import InsertPost from '@/gql/posts/InsertPost.gql';
import ListPublicPosts from '@/gql/posts/ListPublicPosts.gql';
import ListUserPosts from '@/gql/posts/ListUserPosts.gql';

import AppModal from '@/components/general/Modal.vue';
import AppPostCard from '@/components/post/items/PostCard.vue';
import AppPostComposerText from '@/components/post/composer/PostComposerText.vue';
import AppSpinner from '@/components/general/Spinner.vue';
import AppPostLinkPreview from '@/components/post/items/PostLinkPreview.vue';

export default {
  components: {
    AppModal,
    AppPostCard,
    AppPostComposerText,
    AppSpinner,
    AppPostLinkPreview,
  },
  props: {
    isMeeting: {
      type: Boolean,
      default: false,
    },
    postLink: {
      type: Object,
    },
  },
  data() {
    return {
      saving: false,
      user: {},
      showModal: false,
      showMsgModal: false,
      shareDraftPost: '',
      postToBeShared: null,
      title: '',
      isBlocked: false,
    };
  },
  computed: {
    post() {
      if (this.postToBeShared.sharedPost) {
        return this.postToBeShared.sharedPost;
      }
      return this.postToBeShared;
    },
  },
  watch: {
    isMeeting() {
      this.meetingConfig();
    },
  },
  async mounted() {
    $bus.$on('show-share-post-modal', (post, title) => {
      this.showModal = true;
      this.postToBeShared = post;
      this.title = title || 'Share Post';
    });
    this.user = await $auth.getUser();
  },
  methods: {
    openNewMessageModal() {
      this.showMsgModal = true;
    },
    onClose() {
      this.shareDraftPost = '';
      this.showModal = false;
    },
    textHandle(body) {
      this.shareDraftPost = body;
    },
    meetingConfig() {
      this.showModal = true;
      this.postToBeShared = this.postLink;
      this.title = 'Share Event';
    },

    blockPosting(blocked) {
      this.isBlocked = blocked;
    },

    // TODO: Might have to refactor this function
    onShare() {
      if (this.isMeeting) {
        this.saving = true;
        const post = {
          ...this.post,
          bodyText: this.shareDraftPost ? this.shareDraftPost : '',
        };
        this.shareMeetingLink(post);
      } else {
        const post = {
          sharedPostId: this.post.sharedPost
            ? this.post.sharedPost.id
            : this.post.id,
          bodyText: this.shareDraftPost ? this.shareDraftPost : '',
        };
        this.shareThisPost(post);
      }
    },
    async shareMeetingLink(post) {
      try {
        if (this.isMeeting) {
          await $postsApi.createPost(post);
          this.saving = false;
          this.onClose();
          this.$emit('close-share-post');
        }
      } catch (e) {
        $popups.alert({ title: 'Error Sharing', message: e.message });
        this.$emit('saving', false);
        this.saving = false;
      }
      const toastText = 'Event shared';
      this.$toast.open({
        message: toastText,
        type: 'success',
        duration: 1000,
        dismissible: true,
        position: 'top',
      });
    },
    async shareThisPost(post) {
      this.saving = true;
      await this.$apollo.mutate({
        mutation: InsertPost,
        variables: post,
        update: (cache, mutationResponse) => {
          cache.modify({
            __typename: 'Post',
            id: cache.identify(this.postToBeShared.id),
            fields: {
              sharedPostCount(prevCount) {
                return prevCount + 1;
              },
            },
          });
          this.cacheInsertPost(
            cache,
            ListUserPosts,
            {
              id: $auth.getUserId(),
            },
            mutationResponse.data.create_post
          );
          this.cacheInsertPost(
            cache,
            ListPublicPosts,
            {
              room: this.room,
            },
            mutationResponse.data.create_post
          );
        },
      });
      this.saving = false;
      this.$toast.open({
        message: 'Shared',
        type: 'success',
        duration: 1000,
        dismissible: true,
        position: 'top',
      });
      this.onClose();
    },
    cacheInsertPost(cache, query, params, post) {
      const cachedData = cache.readQuery({
        query,
        variables: params,
      });
      if (cachedData && cachedData.posts) {
        cache.writeQuery({
          query,
          variables: params,
          data: {
            posts: [post, ...cachedData.posts],
          },
        });
      }
    },
  },
};
</script>

<style scoped>
.ch-share-post__nav {
  padding: 2px;
  background-color: var(--cs-gray);
  margin-bottom: 10px;
}
.ch-share-clouthub__footer {
  text-align: right;
}
.external {
  height: 80px;
}

.ch-share-external-btns {
  display: flex;
  flex-direction: row;
  gap: 5px;
}
.ch-share-div {
  flex: 0.9;
}

.ch-share-ip {
  width: 100%;
}
.ch-composer__author {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}
.ch-composer__textbox {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 20px;
  margin-top: 10px;
}

.ch-composer-counter {
  display: flex;
  justify-content: flex-end;
}
.ch-character-cnt {
  font-size: 12px;
  color: var(--cs-gray-04);
}
.cs-icons {
  margin-left: 8px;
}

.ch-posts-tags {
  display: flex;
  flex-direction: row;
  gap: 7px;
  margin-top: 7px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.ch-posts-tags__tag {
  --cs-tag-color: var(--cs-primary-base) !important;
}
</style>
