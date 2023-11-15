<template>
  <b-container>
    <div class="mb-2 cs-textstyle-item-heading">
      Search results for: {{ query }}
    </div>
    <b-row>
      <b-col md="4">
        <app-people-search class="search-view" :query="query" />
        <app-channel-search class="search-view" :query="query" />
        <app-video-search class="search-view" :query="query" />
      </b-col>
      <b-col md="4">
        <app-news-search class="search-view" :query="query" />
        <app-group-search class="search-view" :query="query" />
      </b-col>
      <b-col md="4">
        <app-meeting-search class="search-view" :query="query" />
        <app-post-search class="search-view" :query="query" />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import AppPeopleSearch from '@/components/search/PeopleSearch.vue';
import AppGroupSearch from '@/components/search/GroupSearch.vue';
import AppMeetingSearch from '@/components/search/MeetingSearch.vue';
import AppChannelSearch from '@/components/search/ChannelSearch.vue';
import AppVideoSearch from '@/components/search/VideoSearch.vue';
import AppPostSearch from '@/components/search/PostSearch.vue';
import AppNewsSearch from '@/components/search/NewsSearch.vue';

export default {
  components: {
    AppPeopleSearch,
    AppGroupSearch,
    AppMeetingSearch,
    AppChannelSearch,
    AppVideoSearch,
    AppPostSearch,
    AppNewsSearch,
  },
  props: {
    query: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
.search-view {
  border-bottom: solid 1px var(--cs-gray-03);
  padding-bottom: 15px;
  margin-bottom: 15px;
}
</style>
