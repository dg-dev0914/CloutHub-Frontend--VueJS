<template>
  <b-row>
    <b-col cols="8">
      <div class="mb-2 cs-textstyle-item-heading">
        Video Results: {{ query }}
      </div>
      <app-video-list :videos="posts" item-class="col-md-6"></app-video-list>
    </b-col>
    <b-col cols="4">
      <div class="mb-2 cs-textstyle-item-heading">
        Channels Results: {{ query }}
      </div>
      <cs-spinner v-if="!users" />
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
      <div v-if="users && !users.length">No matching channels</div>
    </b-col>
  </b-row>
</template>
<script>
import PostSearchByType from '@/gql/search/PostSearchByType.gql';
import ChannelSearch from '@/gql/search/ChannelSearch.gql';
import AppVideoList from '@/components/video/VideoList.vue';
import AppVideoChannelItem from '@/components/video/VideoChannelItem.vue';

export default {
  components: {
    AppVideoList,
    AppVideoChannelItem,
  },
  props: {
    query: {
      type: String,
      required: true,
    },
  },
  apollo: {
    posts: {
      query: PostSearchByType,
      variables() {
        return {
          type: 'video',
          query: this.query,
        };
      },
    },
    users: {
      query: ChannelSearch,
      variables() {
        return {
          query: this.query,
        };
      },
    },
  },
};
</script>
