<template>
  <b-row>
    <app-video-search-bar v-model="query" />
    <b-col md="8" class="ch_search_result">
      <app-video-search-results :query="query" />
    </b-col>
    <b-col md="4">
      <app-recommended-channel />
    </b-col>
  </b-row>
</template>
<script>
import AppVideoSearchBar from '@/components/video/VideoSearchBar.vue';
import AppVideoSearchResults from '@/components/video/new/VideoSearchResults.vue';
import AppRecommendedChannel from '@/components/video/new/RecommendedChannel.vue';

export default {
  components: {
    AppVideoSearchBar,
    AppVideoSearchResults,
    AppRecommendedChannel,
  },
  data() {
    return {
      query: '',
    };
  },
};
</script>
<style scoped>
.ch_search_result {
  margin-top: 10px;
  margin-left: -10px;
}
</style>
