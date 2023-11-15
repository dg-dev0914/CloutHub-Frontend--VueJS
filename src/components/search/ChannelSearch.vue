<template>
  <div>
    <div class="mb-2 cs-textstyle-item-heading">Channels</div>
    <div v-if="users && users.length">
      <app-video-channel-item
        v-for="user in users"
        :key="user.id"
        class="channel-result"
        :user="user"
        item-class="col-md-12"
      >
      </app-video-channel-item>
    </div>
    <app-spinner v-if="$apollo.queries.users.loading" />
    <cs-empty-state v-if="showEmptyState" title="No matching channels" />
  </div>
</template>
<script>
import ChannelSearch from '@/gql/search/ChannelSearch.gql';
import AppVideoChannelItem from '@/components/video/VideoChannelItem.vue';
import AppSpinner from '@/components/general/Spinner.vue';

export default {
  components: {
    AppVideoChannelItem,
    AppSpinner,
  },
  props: {
    query: {
      type: String,
      required: true,
    },
  },
  apollo: {
    users: {
      query: ChannelSearch,
      variables() {
        return {
          query: this.query,
          limit: 3,
        };
      },
    },
  },
  computed: {
    showEmptyState() {
      if (this.users && this.users.length) return false;
      return true;
    },
  },
};
</script>
