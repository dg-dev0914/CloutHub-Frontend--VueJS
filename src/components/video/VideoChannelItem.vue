<template>
  <div class="channel-item-wrapper" :class="itemClass">
    <router-link :to="linkValue">
      <div class="channel-item cursor-pointer">
        <div class="cs-channel-item-possition">
          <app-avatar
            :name="user.channelName"
            :picture="displayPicture"
            size="medium"
          />
        </div>

        <div>
          <div class="cs-textstyle-paragraph-bold subscribe-button-container">
            <span v-if="user.channelNumber">{{ user.channelNumber }} | </span>
            <span class="ch-display-name"> {{ displayName }}</span>
            <div v-if="view === 'recommended'">
              <app-channel-subscribe-button :target="user" size="small" />
            </div>
          </div>
          <app-username :user="user" />
          <div class="cs-textstyle-paragraph-small channel-item-description">
            {{ user.channelDescription }}
          </div>
          <div class="cs-textstyle-paragraph-small text-light">
            <span
              >{{ user.subscribersCount }}
              {{
                user.subscribersCount == 1 ? 'subscriber' : 'subscribers'
              }}</span
            >
          </div>
        </div>
      </div>
    </router-link>
  </div>
</template>

<script>
import $relationshipsApi from '@/api/connections';
import AppAvatar from '@/components/general/Avatar.vue';
import AppUsername from '@/components/general/Username.vue';
import AppChannelSubscribeButton from '@/components/general/ChannelSubscribeButton.vue';

const defaultPicture = require('@/assets/images/placeholders/group-picture.png');
const defaultAvatar = require('@/assets/images/just_the_news_logo.png');

export default {
  components: {
    AppAvatar,
    AppUsername,
    AppChannelSubscribeButton,
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
    view: {
      type: String,
      required: false,
      default: '',
    },
  },
  data() {
    return {
      defaultPicture,
      defaultAvatar,
    };
  },
  computed: {
    displayPicture() {
      return this.user.username === '@JustTheNewsChannel'
        ? this.defaultAvatar
        : this.user.channelPicture ||
            this.user.profilePhotoURL ||
            this.defaultPicture;
    },
    displayName() {
      return this.user.channelName || `${this.user.displayname}'s Channel`;
    },
    linkValue() {
      return this.user.username === '@JustTheNewsChannel'
        ? { name: 'JustTheNewsVideoProfile' }
        : { name: 'VideoProfile', params: this.user };
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
  flex-direction: row;
  gap: 10px;
  cursor: pointer;
  height: 120px;
}
.channel-item-description {
  white-space: nowrap;
  width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.subscribe-button-container {
  /* margin-top: 10px; */
  display: flex;
  gap: 6px;
  width: 420px;
}
/* .subscribe-button-container >>> .cs-button {
  color: var(--cs-gray-05);
  border: 1px solid var(--cs-gray-04);
} */
.cs-channel-item-possition {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.ch-display-name {
  width: 306px;
}
</style>
