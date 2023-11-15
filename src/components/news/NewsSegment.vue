<template>
  <div>
    <app-header-segment :title="title" button="View More" @action="viewAll" />
    <div v-if="posts">
      <app-news-list
        :posts="displayPosts"
        item-class="col-md-12"
        :empty-state="title"
      ></app-news-list>
    </div>
    <app-spinner v-if="!posts"></app-spinner>
  </div>
</template>

<script>
import AppNewsList from '@/components/news/NewsList.vue';
import AppSpinner from '@/components/general/Spinner.vue';
import AppHeaderSegment from '@/components/general/HeaderSegment.vue';

export default {
  components: {
    AppNewsList,
    AppHeaderSegment,
    AppSpinner,
  },
  props: {
    title: {
      type: String,
      required: true,
      default: 'Untitled Segment',
    },
    query: {
      type: Object,
      required: true,
    },
    count: {
      type: Number,
      required: false,
      default: 6,
    },
    to: {
      required: true,
      type: Object,
    },
  },
  apollo: {
    posts: {
      query() {
        return this.query;
      },
    },
  },
  computed: {
    displayPosts() {
      return this.posts && this.posts.slice(0, this.count);
    },
  },
  methods: {
    viewAll() {
      this.$router.push(this.to);
    },
  },
};
</script>
