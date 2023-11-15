// TODO: Channel Invite functional but not similar to design
<template>
  <div>
    <div class="channel-invite">
      <div class="video-information-modal">
        <div class="cs-textstyle-item-heading main-title">
          Invite Subscribers!
        </div>
        <div class="cs-textstyle-paragraph details">
          Tell your friends, followers and groups about your channel by sending
          them a Subscribe invite. This will help grow viewership to your
          channel
        </div>
      </div>
      <div class="invite-container">
        <cs-page-tabs
          :key="'personal-conenctions-' + Math.random()"
          align="justify"
          :tabs="tabs"
          :value="selectedTab"
          @input="selectTab"
        >
        </cs-page-tabs>
        <app-meeting-tab-friends v-if="selectedView == 'friends'" />
        <app-meeting-tab-followers v-if="selectedView == 'followers'" />
        <app-meeting-tab-groups v-if="selectedView == 'groups'" />
      </div>
    </div>
  </div>
</template>

<script>
import AppMeetingTabFriends from '@/components/video/tabs/ChannelTabFriends.vue';
import AppMeetingTabFollowers from '@/components/video/tabs/ChannelTabFollowers.vue';
import AppMeetingTabGroups from '@/components/video/tabs/ChannelTabGroups.vue';

export default {
  components: {
    AppMeetingTabFriends,
    AppMeetingTabFollowers,
    AppMeetingTabGroups,
  },
  data() {
    return {
      selectedView: 'friends',
      tabs: [
        {
          label: 'Friends',
          key: 'friends',
          view: 'ProfileFriends',
        },
        {
          label: 'Followers',
          key: 'followers',
          view: 'ProfileFollowers',
        },
        {
          label: 'My Groups',
          key: 'groups',
          view: 'Groups',
        },
      ],
    };
  },
  computed: {
    selectedTab() {
      return this.tabs.indexOf(
        this.tabs.find((tab) => tab.key === this.selectedView)
      );
    },
  },
  methods: {
    closeInviteModal() {
      this.$emit('close');
    },
    selectTab(index) {
      const tab = this.tabs[index];
      this.selectedView = tab.key;
    },
  },
};
</script>

<style scoped>
.video-information-modal {
  text-align: center;
  color: var(--cs-gray-05);
  background: var(--cs-gray-00);
  margin-bottom: 15px;
  padding: 10px 25px;
}
* >>> .cs-page-tabs {
  margin-top: -10px;
}

.details {
  width: 90%;
  text-align: center;
  margin: 5px auto;
  font-size: 14px;
}
</style>
