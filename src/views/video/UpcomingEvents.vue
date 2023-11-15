<template>
  <div>
    <div class="mb-2 cs-textstyle-item-heading">
      <span>Upcoming Events</span>
      <div class="buttons-container">
        <button :class="getFilterButtonClass('all')" @click="setFilter('all')">All</button>
        <button v-if="isLoggedIn" :class="getFilterButtonClass('mine')" @click="setFilter('mine')">My Upcoming</button>
      </div>
    </div>
    <div
      v-if="filteredScheduledStreams.length"
      class="stream-grid"
    >
      <div
        v-for="stream in filteredScheduledStreams"
        :key="stream.cssid"
        class="scheduled-stream-item"
      >
        <div>
          <router-link :to="linkValue(stream)">
            <div class="stream-item">
              <div class="stream-item__image">
                <img
                  :src="stream.stream_image || defaultPicture"
                  alt="Stream Image"
                />
              </div>
              <div class="stream-item__info">
                <h3 class="single-line">{{ stream.stream_title }}</h3>
                <p class="single-line">
                  Start: {{ convertToEST(stream.stream_datetime) }}
                </p>
                <p v-if="stream.stream_datetime_end" class="single-line">
                  End: {{ convertToEST(stream.stream_datetime_end) }}
                </p>

                <p class="single-line">
                  {{ stream.username }}
                </p>
                <p class="single-line">
                  {{ stream.stream_description.slice(0, 500) }}
                </p>
              </div>
            </div>
          </router-link>
          <div class="stream-item__option" v-if="isStreamOwnedByUser(stream)">
            <app-context-menu>
              <app-context-menu-item @click="deleteStream(stream.cssid)">
                Delete Stream
              </app-context-menu-item>
            </app-context-menu>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import $auth from '@/services/auth';
import getScheduledStreams from '@/gql/posts/ScheduleGetSchedule.gql';
import DeleteScheduledStream from '@/gql/posts/ScheduleDeleteSchedule.gql';
import AppAvatar from '@/components/general/Avatar.vue';
import AppContextMenu from '@/components/general/ContextMenu.vue';
import AppContextMenuItem from '@/components/general/ContextMenuItem.vue';
import AppChannelSubscribeButton from '@/components/general/ChannelSubscribeButton.vue';


export default {
  components: {
    AppAvatar,
    AppContextMenu,
    AppContextMenuItem,
    AppChannelSubscribeButton,
  },
  data() {
    return {
      scheduledStreams: [],
      streamUsers: {},
      defaultPicture: require('@/assets/images/placeholders/event_defaultimg.png'),
      currentUserId: null, // Nulled until Mounted hook (Facilitate public view)
      currentFilter: 'all',
      isLoggedIn: false,
    };
  },
  computed: {
    linkValue() {
      return function(stream) {
        return { name: 'VideoProfile', params: { id: stream.uid } };
      };
    },
    sortedScheduledStreams() {
      return [...this.scheduledStreams].sort(
        (a, b) => new Date(a.stream_datetime) - new Date(b.stream_datetime)
      );
    },
    filteredScheduledStreams() {
      let now = new Date();

      if (this.currentFilter === 'all') {
        return this.sortedScheduledStreams.filter((stream) => {
          let streamEnd = new Date(stream.stream_datetime_end);
          streamEnd.setHours(streamEnd.getHours() + 1); // add 1 hour to the end time

          return streamEnd >= now;
        });
      }

      if (this.currentFilter === 'mine') {
        return this.sortedScheduledStreams.filter((stream) => {
          return this.isStreamOwnedByUser(stream);
        });
      }
    },
  },
  apollo: {
    scheduledStreams: {
      query: getScheduledStreams,
    },
  },
  mounted() {
    if(this.$route.query.filter) {
      this.currentFilter = this.$route.query.filter;
    }
  },
  methods: {
    async deleteStream(cssid) {
      if (confirm('Are you sure you want to delete this?')) {
        await this.$apollo.mutate({
          mutation: DeleteScheduledStream,
          variables: { cssid },
        });
        this.scheduledStreams = this.scheduledStreams.filter(
          (stream) => stream.cssid !== cssid
        );
        alert('Stream deleted successfully!');
      }
    },
    isStreamOwnedByUser(stream) {
      return this.currentUserId === stream.uid;
    },
    setFilter(filter) {
      this.currentFilter = filter;
    },
    convertToEST(datetime) {
      if (datetime === null) {
        return null;
      }
      let date = new Date(datetime);
      return date.toLocaleString('en-US', { timeZone: 'America/New_York' });
    },
    getFilterButtonClass(filter) {
      if(this.currentFilter === filter){
        return 'tab-button active'
      }
      return 'tab-button'
    },
  },
  async created() {    // Check if the user is logged in when the component is created
    this.isLoggedIn = await $auth.isLoggedInAsUser();

    if (this.isLoggedIn) {
      this.currentUserId = $auth.getUserId();
    }
  },
};
</script>

<style scoped>
.stream-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.scheduled-stream-item {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  padding: 14px;
  border-radius: 10px;
  flex-basis: calc(50% - 10px);
  box-sizing: border-box;
  max-width: 49%;
}

.stream-item {
  display: flex;
  align-items: flex-start; /* make the image and the text independent of each other's height */
}

.stream-item__image {
  width: 150px; /* specify a bigger fixed width for the image container */
  height: 150px; /* specify a bigger fixed height for the image container */
  overflow: hidden; /* prevent the image from overflowing its container */
  flex-shrink: 0; /* prevent the image block from shrinking */
}

.stream-item__image img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* ensures the aspect ratio of the image is maintained */
}
.stream-item__info {
  padding-left: 20px; /* add some space between the image and the text */
  flex: 1; /* makes the text block take up the remaining space */
  overflow: auto;
}

.stream-item__info h3 {
  margin-bottom: 10px;
}

.stream-item__info p {
  margin-bottom: 10px;
}

.stream-item__info p:last-child {
  margin-bottom: 0;
}

.scheduled-stream-item h3 {
  margin-bottom: 10px;
  overflow-wrap: break-word;
  word-wrap: break-word;
  -ms-word-break: break-all;
  word-break: break-word; /* Use for Internet Explorer */
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
.stream-item__option {
  color: var(--cs-gray-04);
  cursor: pointer;
}
.single-line {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
button.tab-button {
  border: none;
  background: transparent;
  font-weight: 300;
  font-size: 16px;
  padding: 2px 20px;
}
button.tab-button.active {
  border-bottom: 2px solid #f38367 !important;
  color: #f38367;
}
.mb-2.cs-textstyle-item-heading {
    display: inline-flex;
}
.buttons-container {
  margin-left: 40px;
}
</style>
