// TODO: Check if it's used anywhere. If not DELETE it
<template>
  <div>
    <cs-spinner v-if="!users" />
    <div v-if="users && users.length" class="row">
      <app-video-channel-item
        v-for="user in users"
        :key="user.id"
        :user="user"
        item-class="col-md-12"
        @refresh-recommendation="refreshRecommendedChannels"
      />
    </div>
  </div>
</template>
<script>
import AppVideoChannelItem from '@/components/video/new/VideoChannelItemNew.vue';

export default {
  components: {
    AppVideoChannelItem,
  },
  props: {
    users: {
      type: Array,
      required: true,
    },
  },

  methods: {
    async refreshRecommendedChannels() {
      this.$apollo.queries.users.refetch();
    },
  },
};
</script>
