<template>
  <div class="ch-infinite-loader">
    <app-infinite-loader
      :paused="query.loading"
      :finished="!mayHaveMore"
      @more="loadMore()"
    />
  </div>
</template>

<script>
import AppInfiniteLoader from '@/components/general/InfiniteLoader.vue';

export default {
  components: {
    AppInfiniteLoader,
  },
  props: {
    query: {
      type: Object,
      required: true,
    },
    limit: {
      type: Number,
      default: 25,
    },
  },
  data() {
    return {
      offset: 0,
      mayHaveMore: true,
    };
  },
  methods: {
    loadMore() {
      if (this.mayHaveMore) {
        this.mayHaveMore = false;
        const items = this.query.vm[this.query.key];
        if (items.length === 0) {
          this.mayHaveMore = false;
          return;
        }
        this.offset += this.limit;
        const vars = {
          offset: this.offset,
        };
        this.query.fetchMore({
          variables: vars,
          updateQuery: (previousResult, { fetchMoreResult }) => {
            this.mayHaveMore = !!fetchMoreResult[this.query.key].length;
            const output = {};
            output[this.query.key] = [
              ...previousResult[this.query.key],
              ...fetchMoreResult[this.query.key],
            ];
            return output;
          },
        });
      }
    },
  },
};
</script>

<style scoped>
.ch-infinite-loader {
  min-height: 100px;
}
</style>
