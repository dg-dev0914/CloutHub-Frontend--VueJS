<template>
  <b-row>
    <b-col md="12">
      <just-the-news />
      <app-news-segment
        title="Latest News"
        :query="latestQuery"
        :count="4"
        :to="{ name: 'NewsList', params: { view: 'latest' } }"
      />
      <app-news-segment
        title="News You Follow"
        :query="followingQuery"
        :count="4"
        :to="{ name: 'NewsList', params: { view: 'following' } }"
      />
      <app-news-segment
        title="Read Later"
        :query="queuedQuery"
        :count="4"
        :to="{ name: 'NewsList', params: { view: 'queue' } }"
      />
      <app-news-segment
        title="Bookmarked"
        :query="bookmarkedQuery"
        :count="4"
        :to="{ name: 'NewsList', params: { view: 'bookmarked' } }"
      />
      <app-news-segment
        title="Recently Read"
        :query="historyQuery"
        :count="4"
        :to="{ name: 'NewsList', params: { view: 'history' } }"
      />
    </b-col>
    <!-- <b-col md="4">
      <app-news-publisher-segment
        :query="featuredPublishersQuery"
        title="Featured Publishers"
        :count="8"
      />
      <app-ad-slot widget-id="224548" height="1700" />
    </b-col> -->
    <!-- <app-ad-slot widget-id="224548" height="1700" /> -->
  </b-row>
</template>

<script>
import AppNewsSegment from '@/components/news/NewsSegment.vue';
import AppNewsPublisherSegment from '@/components/news/NewsPublisherSegment.vue';
// import AppAdSlot from '@/components/sidebar/AdSlot.vue';
import ListNewsBookmarked from '@/gql/news/ListNewsBookmarked.gql';
import ListNewsFollowing from '@/gql/news/ListNewsFollowing.gql';
import ListNewsHistory from '@/gql/news/ListNewsHistory.gql';
import ListNewsQueued from '@/gql/news/ListNewsQueued.gql';
import ListNewsLatest from '@/gql/news/ListNewsLatest.gql';
import ListFeaturedPublishers from '@/gql/news/ListFeaturedPublishers.gql';

export default {
  components: {
    AppNewsSegment,
    AppNewsPublisherSegment,
    // AppAdSlot,
  },
  data() {
    return {
      latestQuery: ListNewsLatest,
      followingQuery: ListNewsFollowing,
      queuedQuery: ListNewsQueued,
      bookmarkedQuery: ListNewsBookmarked,
      historyQuery: ListNewsHistory,
      featuredPublishersQuery: ListFeaturedPublishers,
    };
  },
};
</script>
