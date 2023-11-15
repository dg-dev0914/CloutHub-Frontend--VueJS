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
    sortKey: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      prevCursor: undefined,
    };
  },
  computed: {
    items() {
      return this.query.vm[this.query.key] || [];
    },
    cursor() {
      return this.items.length > 0
        ? this.items[this.items.length - 1][this.sortKey]
        : undefined;
    },
    mayHaveMore() {
      return this.cursor && this.prevCursor !== this.cursor;
    },
  },
  methods: {
    loadMore() {
      console.info('InfiniteSimple | loadMore | start', { query: this.query });

      if (this.mayHaveMore) {
        console.info('InfiniteSimple | loadMore | have more');
        const vars = { before: this.cursor };
        this.prevCursor = this.cursor;
        this.query.fetchMore({
          variables: vars,
          updateQuery: (previousResult, { fetchMoreResult }) => {
            const output = {};
            output[this.query.key] = [
              ...previousResult[this.query.key],
              ...fetchMoreResult[this.query.key],
            ];

            console.info('InfiniteSimple | loadMore | updateQuery end', {
              output,
            });
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
