<template>
  <div class="">
    <div class="mb-2 cs-textstyle-item-heading">{{title}}</div>
    <cs-spinner v-if="!users" />
    <div v-if="users && users.length" class="row">
      <app-video-channel-item v-for="user in displayChannels" :key="user.id" :user="user" item-class="col-md-12" />
    </div>
  </div>
</template>

<script>
import AppVideoChannelItem from '@/components/video/VideoChannelItem.vue';

export default {
  props: {
    title: {
      type: String,
      required: true,
      default: 'Untitled Segment',
    },
    query: {
      type: Object,
      required: true,
    },
    count: {
      type: Number,
      required: false,
      default: 6,
    },
  },
  components: {
    AppVideoChannelItem,
  },
  apollo: {
    users: {
      query() {
        return this.query;
      },
    },
  },
  computed: {
    displayChannels() {
      return this.users && this.users.slice(0, this.count);
    },
  },
};

</script>
