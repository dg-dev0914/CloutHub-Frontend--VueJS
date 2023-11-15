<template>
  <div class="">
    <div class="mb-2 cs-textstyle-item-heading">{{ title }}</div>
    <div v-if="users" class="row">
      <app-news-publisher-item
        v-for="user in displayUsers"
        :key="user.id"
        :user="user"
        class="mb-2"
        item-class="col-md-12"
      />
    </div>
  </div>
</template>

<script>
import AppNewsPublisherItem from '@/components/news/NewsPublisherItem.vue';

export default {
  components: {
    AppNewsPublisherItem,
  },
  props: {
    title: {
      type: String,
      default: 'Untitled Card',
    },
    query: {
      type: Object,
      required: true,
    },
    count: {
      type: Number,
      default: 6,
    },
  },
  apollo: {
    users: {
      query() {
        return this.query;
      },
    },
  },
  computed: {
    displayUsers() {
      return this.users && this.users.slice(0, this.count);
    },
  },
};
</script>
