// TODO: Check if it's used anywhere. If not DELETE it
<template>
  <div class="channel-item-wrapper" :class="itemClass">
    <div
      v-router-link="{ name: 'VideoProfile', params: user }"
      class="channel-item cursor-pointer"
    >
      <app-avatar
        :name="user.channelName"
        :picture="displayPicture"
        size="medium"
      />
      <div>
        <div class="cs-textstyle-paragraph-bold subscribe-button-container">
          <span v-if="user.channelNumber">{{ user.channelNumber }} | </span>
          {{ displayName }}
        </div>
      </div>
      <div class="cs-channel-item-possition">
        <cs-button
          size="small"
          fill="outline"
          variant="default"
          class="subscribe-btn"
          @click="subscribe"
          >Subscribe</cs-button
        >
      </div>
    </div>
  </div>
</template>

<script>
import $relationshipsApi from '@/api/connections';
import AppAvatar from '@/components/general/Avatar.vue';

const defaultPicture = require('@/assets/images/placeholders/group-picture.png');

export default {
  components: {
    AppAvatar,
  },
  props: {
    user: {
      required: true,
      type: Object,
    },
    itemClass: {
      type: String,
      default: 'col-md-6',
    },
  },
  data() {
    return {
      defaultPicture,
    };
  },
  computed: {
    displayPicture() {
      return (
        this.user.channelPicture ||
        this.user.profilePhotoURL ||
        this.defaultPicture
      );
    },
    displayName() {
      return this.user.channelName || `${this.user.displayname}'s Channel`;
    },
  },
  methods: {
    async subscribe() {
      await $relationshipsApi.subscribeChannel(this.user);
      this.$emit('refresh-recommendation');
    },
  },
};
</script>
<style scoped>
.channel-item-wrapper {
  padding: 10px;
  padding-top: 0px;
}
.channel-item {
  background-color: white;
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 5px;
  flex-direction: column;
  text-align: center;
  gap: 10px;
  cursor: pointer;
  height: 120px;
}
.channel-item-description {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.subscribe-button-container {
  /* margin-top: 10px; */
  /* display: flex;
  flex-direction: row;
  align-items: flex-end; */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.subscribe-button-container >>> .cs-button {
  color: var(--cs-gray-05);
  border: 1px solid var(--cs-gray-04);
}
.cs-channel-item-possition {
  position: inherit;
  /* right: 512px; */
}
.subscribe-btn {
  --cs-button-color: var(--cs-gray-04) !important;
}
</style>
