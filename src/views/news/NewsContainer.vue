<template>
  <div>
    <b-container fluid="xl">
      <b-row>
        <b-col md="2">
          <app-page-menu title="News">
            <!-- Latest Section -->
            <app-page-menu-item
              label="Latest"
              :to="{ name: 'NewsList', params: { view: 'latest' } }"
            />
            <!-- Find section -->
            <app-page-menu-item
              label="Find"
              :to="{ name: 'NewsList', params: { view: 'find' } }"
            />

            <app-page-menu-item
              label="My News"
              :to="{ name: 'NewsList', params: { view: 'following' } }"
            />

            <app-page-menu-item
              label="Bookmarked"
              :to="{ name: 'NewsList', params: { view: 'bookmarked' } }"
            />

            <app-page-menu-item
              label="Read Later"
              :to="{ name: 'NewsList', params: { view: 'queue' } }"
            />

            <app-page-menu-item
              label="Recently Read"
              :to="{ name: 'NewsList', params: { view: 'history' } }"
            />

            <!-- Topics -->
            <app-page-menu title="Topics" no-border>
              <div class="topics">
                <app-page-menu-item
                  v-for="category in categories"
                  :key="category.label"
                  :label="category.label"
                  :to="{
                    name: 'NewsCategory',
                    params: { category: category.value },
                  }"
                />
              </div>
            </app-page-menu>
          </app-page-menu>
        </b-col>
        <b-col md="10">
          <b-col md="12">
            <app-news-quick-find />
          </b-col>
          <b-row class="news-row">
            <b-col md="8">
              <router-view :key="$route.fullPath" />
            </b-col>
            <b-col md="4">
              <app-news-publisher-segment
                :query="featuredPublishersQuery"
                title="Featured Publishers"
                :count="8"
              />
            </b-col>
          </b-row>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import AppPageMenu from '@/components/general/PageMenu.vue';
import AppPageMenuItem from '@/components/general/PageMenuItem.vue';
import AppNewsQuickFind from '@/components/general/NewsQuickFind.vue';
import AppNewsPublisherSegment from '@/components/news/NewsPublisherSegment.vue';
import ListFeaturedPublishers from '@/gql/news/ListFeaturedPublishers.gql';

export default {
  components: {
    AppPageMenu,
    AppPageMenuItem,
    AppNewsQuickFind,
    AppNewsPublisherSegment,
  },
  data() {
    return {
      news: [],
      categories: [
        { label: 'Politics', value: 'US' },
        { label: 'Entertainment', value: 'Entertainment' },
        { label: 'Technology', value: 'Technology' },
        { label: 'Fashion', value: 'Fashion' },
        { label: 'Family', value: 'Parents' },
        { label: 'Health', value: 'Health' },
        { label: 'Sports', value: 'Sports' },
        { label: 'Business', value: 'Business' },
        { label: 'Finance', value: 'Finance' },
        { label: 'World', value: 'Global' },
      ],
      selectedFilter: null,
      featuredPublishersQuery: ListFeaturedPublishers,
    };
  },
};
</script>
<style scoped>
.news-row {
  padding: 5px 0px 5px 0px;
}
.topics {
  padding-left: 30px;
}
</style>
