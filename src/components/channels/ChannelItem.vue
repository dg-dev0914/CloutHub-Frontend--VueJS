<template>
  <b-col sm="6" md="6" lg="4" xl="3" class="cursor-pointer" v-router-link="{name:'ChannelDetail', params:channel}">
    <div class="channel-item-card hovercard">
      <app-img v-if="channel.picture" :src="channel.picture" alt=""/>
      <app-img v-if="!channel.picture" :src="defaultPicture"/>
      <div class="channel-card-body">
        <div class="cs-textstyle-paragraph-small-bold channel-title" :title="channelName">
          {{channelName}}
        </div>
        <div class="card-body__channel-videos">
          <!-- <div class="ch-textstyle-paragraph-extra-small card-body__channel-number" v-if="channelChannel">
            {{channelChannel}}
          </div>
          <div class="dot" v-if="channelChannel"></div> -->
          <div class="ch-textstyle-paragraph-extra-small card-body__videos-number" >
            {{channel.videoCount}} videos
          </div>
        </div>
      </div>
    </div>
  </b-col>
</template>
<script>
import AppImg from '@/components/general/Img.vue';

export default {
  components: {
    AppImg,
  },
  props: {
    channel: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      defaultPicture: require('@/assets/images/groups/group-picture.png'),
    };
  },
  computed: {
    channelName() {
      return this.channel.displayname;
    },
    channelChannel() {
      if (this.channel.name.includes('|')) {
        return `Channel ${this.channel.name.split('|')[0]}`;
      }
    },
  },
};
</script>
<style scoped>
  .channel-item-card{
    overflow: hidden;
    border-radius: 5px;
    background-color: var(--cs-gray-01);
    border: 1px solid var(--cs-gray-02);
    margin-bottom: 20px;
  }
  .channel-item-card img
  {
    width: 100%;
    height: 150px;
    object-fit: cover;
  }
  .channel-card-body {
    padding: 15px;
  }
  .card-body__channel-videos{
    display: flex;
    flex-direction: row;
  }
  .card-body__videos-number{
    color: var(--cs-gray-04);
  }
  .card-body__channel-number{
    margin-right: 8px;
    color: var(--cs-gray-04);
  }
  .channel-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .dot {
    height: 5px;
    width: 5px;
    background-color: var(--cs-gray-04);
    border-radius: 50%;
    display: inline-block;
    align-self: center;
    margin-right: 8px;
  }
</style>
