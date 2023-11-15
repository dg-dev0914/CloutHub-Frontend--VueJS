<template>
  <div class="">
    <div class="mb-2 cs-textstyle-item-heading capitalize">{{ title }}</div>
    <app-video-list :videos="videos"></app-video-list>
    <app-infinite-simple
      :query="$apollo.queries.videos"
      sort-key="createdAt"
    ></app-infinite-simple>
  </div>
</template>
<script>
import ListCategoryVideos from '@/gql/videos/ListCategoryVideos.gql';
import AppVideoList from '@/components/video/VideoList.vue';
import AppInfiniteSimple from '@/components/general/InfiniteSimple.vue';

export default {
  components: {
    AppVideoList,
    AppInfiniteSimple,
  },
  props: {
    category: {
      type: String,
      required: true,
    },
  },
  computed: {
    title() {
      const titleMap = {
        news: 'News',
        faith: 'Faith',
        politics: 'Politics & Civic',
        music: 'Music',
        finance: 'Finance & Investing',
        business: 'Business',
        health: 'Health & Fitness',
        movies: 'Movies & Shows',
        sports: 'Sports',
        technology: 'Technology',
        games: 'Games & Gaming',
        education: 'Education',
        personalgrowth: 'Personal Growth',
        fashion: 'Fashion & Beauty',
        humor: 'Humor & Memes',
      };
      const type = this.category;

      return titleMap[type] || type;
    },
  },
  apollo: {
    videos: {
      query: ListCategoryVideos,
      variables() {
        return {
          category: this.category,
        };
      },
    },
  },
};
</script>
