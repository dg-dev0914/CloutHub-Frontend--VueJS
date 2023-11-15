<template>
  <cs-card class="subscribe-card">
    <div slot="header" class="subscribe-header cs-textstyle-paragraph-bold" v-if="channels">
        Channels You've Subscribed To
    </div>
    <div slot="body">
      <app-spinner v-if="!channels"></app-spinner>
      <div class="subscribe-card__bodyClass" v-if="channels">
        <div v-for="(channel,$index) in channels" :key="$index" class="subscribe-card__itemClass">
          <div class="subscribe-card__separateItems cursor-pointer" v-router-link="{name:'ChannelDetail', params:channel}">
            <div class="subscribe-card__itemRow">
              <app-avatar
                :picture="channel.picture"
                :name="channel.name"
                variant="primary"
                size="small"
              ></app-avatar>
              <div class="subscribe-card__itemCol">
                <span class="cs-textstyle-paragraph-small-bold" style="margin-left: 5px">
                  {{ channel.name.split('|')[1] }}
                </span>
                <span class="cs-textstyle-paragraph-extra-small" style="margin-left: 5px">
                  {{channel.videoCount}} videos
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <cs-empty-state
      v-if="visible"
      >
        <div slot="title" class="empty-state__title">You haven’t subscribed to any channels yet.</div>
        <cs-button
          variant="primary"
          size="small"
          @click="goToChannels"
        >
          <i class="cs-icons-map"></i> <span>Explore Channels</span>
        </cs-button>
      </cs-empty-state>
    </div>
  </cs-card>
</template>

<script>
import AppAvatar from '@/components/general/Avatar.vue';
import ListSubscribedChannels from '@/gql/channels/ListSubscribedChannels.gql';
import AppSpinner from '@/components/general/Spinner.vue';

export default {
  components: {
    AppAvatar,
    AppSpinner,
  },
  apollo: {
    channels: {
      query: ListSubscribedChannels,
    },
  },
  computed: {
    visible() {
      if (this.channels && this.channels.length === 0) {
        return true;
      }
      return false;
    },
  },
  methods: {
    goToChannels() {
      this.$router.push({ name: 'ChannelList' });
    },
  },
};
</script>
<style scoped>
.subscribe-header {
  padding: 15px 20px;
  border-bottom: 1px solid var(--cs-gray-02);
}

.subscribe-card .cs-card__body {
    margin: 0 !important;
}
.subscribe-card__bodyClass{
  padding: 5px 20px;
}
.subscribe-card__itemClass{
  border-top: 1.7px solid #f0f2f6;
  padding: 10px 0px;
}
.subscribe-card__itemClass:first-child{
  border-top: none;
}
.subscribe-card__itemClass:last-child{
  margin-bottom: -4px;
}
.subscribe-card__separateItems{
  display:flex;
  justify-content: space-between
}
.subscribe-card__itemRow{
  display: flex;
  flex-direction: row;
}
.subscribe-card__itemCol{
  display: flex;
  flex-direction: column;
  margin-left: 4px;
}
.subscribe-card__promoted{
  color: #aebed6;
  font-size: 10px;
}
.subscribe-card{
  width: 100%;
  object-fit: contain;
  margin-left: 0px !important;
  margin-top: 0px !important;
}
.subscribe-card__unsubscribe{
  padding: 5px !important ;
  font-size: 12px !important;
}
.subscribe-card .cs-card__info{
  padding: 0px !important;
}

.subscribe-card .empty-state {
    min-height: 150px;
    padding: 20px;
}

.empty-state__title{
  color: var(--cs-gray-04);
  font-size: 18px;
  margin-bottom: 10px;
}
</style>
