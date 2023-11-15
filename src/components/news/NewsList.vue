<template>
  <div v-if="posts" class="row">
    <just-the-news v-if="isLatestNews" />

    <app-news-item
      v-for="(post, index) in posts"
      :key="post.id + index"
      :item-class="itemClass"
      :post="post"
    ></app-news-item>
    <cs-empty-state
      v-if="!posts.length && showEmpty"
      :title="emptyStateTitle"
    ></cs-empty-state>
  </div>
  <app-spinner v-else />
</template>

<script>
import AppNewsItem from '@/components/news/NewsItem.vue';
import AppSpinner from '@/components/general/Spinner.vue';

export default {
  components: {
    AppNewsItem,
    AppSpinner,
  },
  props: {
    itemClass: {
      type: String,
      default: 'col-md-12',
    },
    showEmpty: {
      type: Boolean,
      default: true,
    },
    isLatestNews: {
      type: Boolean,
      default: false,
      require: false,
    },
    posts: {
      type: Array,
      required: true,
    },
    emptyState: {
      default: 'No Matching Articles!',
      type: String,
    },
  },
  computed: {
    emptyStateTitle() {
      if (this.emptyState === 'News You Follow')
        return 'None of the news sources you follow have posted anything yet';
      if (
        this.emptyState === 'Bookmarked Articles' ||
        this.emptyState === 'Bookmarked'
      )
        return 'You haven’t bookmarked any posts yet';
      if (this.emptyState === 'Read Later')
        return 'You haven’t added any posts to your Read Later queue';
      if (this.emptyState === 'Recently Read')
        return "You haven't read any articles yet";
      return 'There are currently no news in this category';
    },
  },
};
</script>
