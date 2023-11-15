<template>
  <div class="my-news-body">
    <div
      v-if="hasNoPublishers"
      class="cs-textstyle-paragraph my-news-no-publisher"
    >
      <div class="cs-textstyle-paragraph no-publisher-text">
        You haven't followed any news publishers yet.
        <p>
          When you follow a news publisher, you will be able to read their
          latest articles under MyNews. Here are some new publishers you may
          want to follow. Or you can search for a news publisher in the quick
          find at the top of the page.
        </p>
      </div>
      <div v-for="user in users" :key="user.id">
        <app-publisher-circle :user="user" />
      </div>
    </div>
    <div v-for="user in publishers" v-else :key="user.id">
      <app-publisher-circle :user="user" />
    </div>
  </div>
</template>

<script>
import AppPublisherCircle from '@/components/news/PublisherCircle.vue';
import ListFeaturedPublishers from '@/gql/news/ListFeaturedPublishers.gql';

export default {
  components: {
    AppPublisherCircle,
  },
  props: {
    publishers: {
      type: Array,
      required: true,
    },
  },
  apollo: {
    users: ListFeaturedPublishers,
  },
  computed: {
    hasNoPublishers() {
      return this.publishers && this.publishers.length === 0;
    },
  },
};
</script>

<style scoped>
.my-news-body {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 15px;
}
.no-publisher-text {
  text-align: center;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
}
.my-news-no-publisher {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
}
</style>
