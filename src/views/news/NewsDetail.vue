<template>
  <div>
    <app-spinner v-if="!post"></app-spinner>
    <div v-if="post" class="news-frame">
      <div class="news-frame-embed">
        <div class="news-spinner">
          <app-spinner
            v-if="state == 'loading'"
            class="news-spinner"
          ></app-spinner>
        </div>
        <iframe
          v-if="post.linkPreview"
          ref="myframe"
          :src="post.linkPreview.url"
          :class="state"
          @load="handleLoad()"
        ></iframe>
        <cs-input
          v-if="!state == 'failed'"
          v-model="post.linkPreview.url"
          class="urlbar"
          type="text"
          :selectable="false"
        ></cs-input>
        <div v-if="state == 'failed'" class="news-frame-failed">
          <h5>This article can't be displayed on CloutHub</h5>
          <p>
            Some news articles only allow articles to be read on their website.
          </p>
          <cs-button target="_blank" :href="post.linkPreview.url"
            >Read on {{ domain }}</cs-button
          >
        </div>
      </div>
      <div class="news-frame-response">
        <div class="cs-textstyle-paragraph-small news-share-info">
          <app-bookmark-button :post="post" />
          <app-queue-button :post="post" />
        </div>
        <app-post-author-bar :post="post" hide-friend></app-post-author-bar>
        <app-post-response :post="post"></app-post-response>
      </div>
    </div>
  </div>
</template>

<script>
import $newsApi from '@/api/news';
import GetNews from '@/gql/news/GetNews.gql';
import AppPostResponse from '@/components/post/response/PostResponse.vue';
import AppPostAuthorBar from '@/components/post/items/PostAuthorBar.vue';
import AppBookmarkButton from '@/components/post/buttons/BookmarkButton.vue';
import AppQueueButton from '@/components/post/buttons/QueueButton.vue';
import AppSpinner from '@/components/general/Spinner.vue';

export default {
  components: {
    AppPostResponse,
    AppPostAuthorBar,
    AppBookmarkButton,
    AppQueueButton,
    AppSpinner,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      state: 'loading',
      markViewed: false, // DO NOT REMOVE
    };
  },
  computed: {
    domain() {
      return (
        this.post &&
        this.post.linkPreview &&
        this.post.linkPreview.url &&
        new URL(this.post.linkPreview.url).hostname
      );
    },
  },
  apollo: {
    post: {
      query: GetNews,
      variables() {
        return {
          id: this.id,
        };
      },
      result() {
        this.markPostViewed();
      },
    },
  },
  methods: {
    handleLoad() {
      if (this.$refs.myframe.contentWindow.length) {
        this.state = 'loaded';
      } else {
        this.state = 'failed';
      }
    },
    markPostViewed() {
      // NOTE: this check is essential to avoid an infinite loop
      // When the cache updates the viewCount it will call this function again
      if (!this.markViewed) {
        this.markViewed = true;
        $newsApi.markPostViewed(this.post);
      }
    },
  },
};
</script>

<style scoped>
.news-frame {
  display: flex;
  flex-direction: row;
  position: fixed;
  top: 80px;
  right: 20px;
  bottom: 20px;
  left: 20px;
  gap: 20px;
}
.news-frame-embed {
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
}
.news-frame-embed iframe {
  width: 100%;
  height: 100%;
}

.news-frame-embed .failed {
  display: none;
}
.news-frame-response {
  width: 350px;
  overflow-y: scroll;
  background-color: var(--cs-gray-00);
}
@media (min-width: 1201px) {
  .news-frame-response {
    width: 470px;
  }
}
.urlbar {
  font-size: 12px;
}
.news-share-info {
  padding: 12px 15px 10px;
  border-bottom: solid 1px var(--cs-gray-02);
}
.news-frame-failed {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  border: dashed 1px var(--cs-gray-04);
  align-items: center;
}
.news-spinner {
  position: absolute;
  left: 50%;
  margin-right: 440px;
  z-index: -1;
}
</style>
