<template>
  <div>
    <div class="mb-2 cs-textstyle-item-heading">{{ currentView.title ? currentView.title : '' }}</div>
    <cs-spinner v-if="!users && !scheduledStreams" />
    <div v-if="users && users.length" class="row">
      <app-video-channel-item
        v-for="user in users"
        :key="user.id"
        :user="user"
        :view="$route.params.view"
        @refresh-recommendation="refreshRecommendedChannels"
      />
    </div> 
  </div>
</template>

<script>
import $auth from '@/services/auth';

// Components
import AppVideoChannelItem from '@/components/video/VideoChannelItem.vue';
import AppAvatar from '@/components/general/Avatar.vue';
import AppContextMenu from '@/components/general/ContextMenu.vue';
import AppContextMenuItem from '@/components/general/ContextMenuItem.vue';


// GQL
import ListFeaturedChannels from '@/gql/videos/ListFeaturedChannels.gql';
import ListSubscribedChannels from '@/gql/videos/ListSubscribedChannels.gql';
import ListAllChannels from '@/gql/videos/ListAllChannels.gql';
import getScheduledStreams from '@/gql/posts/ScheduleGetSchedule.gql';

const viewSettings = {
  all: {
    title: 'All Channels',
    query: ListAllChannels,
  },
  recommended: {
    title: 'Recommended Channels',
    query: ListFeaturedChannels,
  },
  subscribed: {
    title: 'Subscribed Channels',
    query: ListSubscribedChannels,
  },
  scheduled: {
    title: 'Upcoming',
    query: getScheduledStreams,
  },
};

export default {
  components: {
    AppVideoChannelItem,
    AppAvatar,
    AppContextMenu,
    AppContextMenuItem,
  },
  data() {
    return {
      scheduledStreams: [],
      streamUsers: {},
      allStreamUsersLoaded: false,
      defaultPicture: require('@/assets/images/placeholders/group-picture.png'),
      currentUserId: null,
    };
  },
  props: {
    view: {
      type: String,
      required: true,
    },
  },
  async created() {
    this.currentUserId = await $auth.getUserId();
  },

  computed: {
    linkValue() {
      return function(stream) {
        return { name: 'VideoProfile', params: { id: this.streamUsers[stream.cssid].user.id } };
      };
    },
    currentView() {
      return viewSettings[this.$route.params.view];
    },
  },
  mounted() {
    if(this.$route.params.view != 'scheduled') {
      this.$apollo.queries.users.refetch();
    }
  },
  apollo: {
    users: {
      query() {
        return this.currentView.query;
      },
    },
  },
  methods: {
    async refreshRecommendedChannels() {
      this.$apollo.queries.users.refetch();
    },
    async deleteStream(cssid) {
      await this.$apollo.mutate({
        mutation: DeleteScheduledStream,
        variables: { cssid },
      });
      this.scheduledStreams = this.scheduledStreams.filter(
        (stream) => stream.cssid !== cssid
      );
      // Show popup that deletion was successful
      alert("Stream deleted successfully!");
    },
    isStreamOwnedByUser(stream) {
      return this.currentUserId === stream.uid;
    },
  },
};
</script>

<style scoped>
.stream-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.scheduled-stream-item {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  margin-bottom: 20px;
  padding: 20px;
  border-radius: 10px;
  flex-basis: calc(50% - 10px); /* 50% for 2 columns, -10px for the margin-right */
  box-sizing: border-box;
}

.channel-item {
    display: flex;
    align-items: flex-start; /* make the image and the text independent of each other's height */
}

.channel-item__image {
    width: 100px; /* specify a fixed width for the image container */
    height: 100px; /* specify a fixed height for the image container */
    overflow: hidden; /* prevent the image from overflowing its container */
    flex-shrink: 0; /* prevent the image block from shrinking */
}

.channel-item__image img {
    width: 100%; 
    height: 100%;
    object-fit: cover; /* ensures the aspect ratio of the image is maintained */
}

.channel-item__info {
    padding-left: 20px; /* add some space between the image and the text */
    flex-grow: 1; /* makes the text block take up the remaining space */
}

  .channel-item__info h3 {
    margin-bottom: 10px;
  }

  .channel-item__info p {
    margin-bottom: 10px;
  }

  .channel-item__info p:last-child {
    margin-bottom: 0;
  }


.scheduled-stream-item h3 {
  margin-bottom: 10px;
}

.scheduled-stream-item p {
  margin-bottom: 10px;
}

.scheduled-stream-item p:last-child {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .scheduled-stream-item {
    flex-basis: 100%;
  }
}
.channel-item__option {
  color: var(--cs-gray-04);
  cursor: pointer;
}

</style>
