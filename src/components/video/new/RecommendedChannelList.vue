<template>
  <div class="channel-item-wrapper" :class="itemClass">
    <div class="channel-item cursor-pointer">
      <div class="cs-channel-item-position">
        <app-avatar
          v-router-link="{ name: 'VideoProfile', params: user }"
          :name="user.channelName"
          :picture="displayPicture"
          size="medium"
        />

        <div>
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

      <div v-router-link="{ name: 'VideoProfile', params: user }">
        <div class="cs-textstyle-paragraph-bold subscribe-button-container">
          <span v-if="user.channelNumber">{{ user.channelNumber }} | </span>
          {{ displayName }}
        </div>
        <div class="cs-textstyle-paragraph-small channel-item-description">
          {{ user.channelDescription }}
        </div>
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
  padding: 15px;
  border-radius: 5px;
  flex-direction: row;
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
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}
.subscribe-button-container >>> .cs-button {
  color: var(--cs-gray-05);
  border: 1px solid var(--cs-gray-04);
}
.cs-channel-item-position {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
}
.cs-btn-position {
  margin-top: 10px;
}
.subscribe-btn {
  --cs-button-color: var(--cs-gray-04) !important;
}
</style>
