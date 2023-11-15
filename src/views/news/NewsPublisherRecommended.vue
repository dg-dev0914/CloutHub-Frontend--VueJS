<template>
  <div class="">
    <div class="mb-4 cs-textstyle-item-heading">Recommended Sources</div>
    <div v-if="users" class="row">
      <app-news-publisher-item
        v-for="user in users"
        :key="user.id"
        :user="user"
        class="mb-2"
      />
    </div>
  </div>
</template>

<script>
import ListFeaturedPublishers from '@/gql/news/ListFeaturedPublishers.gql';
import AppNewsPublisherItem from '@/components/news/NewsPublisherItem.vue';

export default {
  components: {
    AppNewsPublisherItem,
  },
  apollo: {
    users: ListFeaturedPublishers,
  },
};
</script>
