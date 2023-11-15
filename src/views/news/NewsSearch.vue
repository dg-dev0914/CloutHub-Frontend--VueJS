<template>
  <b-row class="news-list">
    <cs-page-tabs v-model="selectedTab" align="justify" class="page-tab-shadow">
      <cs-page-tab label="Articles"> </cs-page-tab>
      <cs-page-tab label="Publishers"></cs-page-tab>
    </cs-page-tabs>
    <div v-if="selectedTab === 0">
      <div class="mb-2 cs-textstyle-item-heading heading">
        Articles: {{ query }}
      </div>
      <app-news-list :posts="posts" item-class="col-md-12"></app-news-list>
    </div>
    <div v-if="selectedTab === 1">
      <div class="mb-2 cs-textstyle-item-heading heading">
        Publishers: {{ query }}
      </div>
      <cs-spinner v-if="!users" />
      <div v-if="users && users.length" class="publisher-result">
        <app-publisher-circle
          v-for="user in users"
          :key="user.id"
          :user="user"
        />
      </div>
    </div>
  </b-row>
</template>

<script>
import NewsArticleSearch from '@/gql/search/NewsArticleSearch.gql';
import NewsPublishersSearch from '@/gql/search/NewsPublishersSearch.gql';
import AppNewsList from '@/components/news/NewsList.vue';
import AppPublisherCircle from '@/components/news/PublisherCircle.vue';

export default {
  components: {
    AppNewsList,
    AppPublisherCircle,
  },
  props: {
    query: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      selectedTab: 0,
    };
  },
  apollo: {
    posts: {
      query: NewsArticleSearch,
      variables() {
        return {
          type: 'news',
          query: this.query,
        };
      },
    },
    users: {
      query: NewsPublishersSearch,
      variables() {
        return {
          searchType: 'KEYWORD',
          searchString: this.query,
          badgeType: 'news',
        };
      },
    },
  },
};
</script>

<style scoped>
* >>> .cursor-pointer {
  margin-bottom: 0.5rem !important;
}
.heading {
  margin-top: 10px;
}
.publisher-result {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  gap: 20px;
}
.news-list {
  padding: 5px 0px 5px 11px;
}
</style>
