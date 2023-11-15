<template>
  <div class="">
    <div class="mb-2 cs-textstyle-item-heading capitalize">{{ title }}</div>
    <app-meeting-list :meetings="meetings"></app-meeting-list>
    <app-infinite-offset :query="$apollo.queries.meetings" />
  </div>
</template>

<script>
import AppMeetingList from '@/components/meetings/MeetingList.vue';
import AppInfiniteOffset from '@/components/general/InfiniteOffset.vue';
import ListCategoryMeetings from '@/gql/meetings/ListCategoryMeetings.gql';

export default {
  components: {
    AppMeetingList,
    AppInfiniteOffset,
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
    meetings: {
      query: ListCategoryMeetings,
      variables() {
        return {
          category: this.category,
        };
      },
      fetchPolicy: 'network-only',
    },
  },
};
</script>

<style scoped></style>
