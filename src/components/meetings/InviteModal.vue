<template>
  <div>
    <app-tab-modal
      class="ch-meeting-invite-modal"
      :show="show"
      :tabs="tabs"
      title="Invite People"
      @input="selectTab"
      @close="closeInviteModal"
    >
      <div slot="body" class="ch-meeting-invite-modal__body">
        <app-meeting-tab-friends
          v-if="selectedView == 'friends'"
          :meeting="meeting"
          :selected-users="selectedUsers"
          @selected-users="onSelected"
        />
        <app-meeting-tab-followers
          v-if="selectedView == 'followers'"
          :meeting="meeting"
          :selected-users="selectedUsers"
          @selected-users="onSelected"
        />
        <app-meeting-tab-groups
          v-if="selectedView == 'groups'"
          :meeting="meeting"
          :selected-groups="selectedGroups"
          @selected-groups="onSelectedGroups"
        />
        <app-meeting-tab-all-users
          v-if="selectedView == 'all-users'"
          :meeting="meeting"
          :selected-users="selectedUsers"
          @selected-users="onSelected"
        />
        <!-- <app-meeting-tab-email v-if="selectedView == 'email'" :meeting="meeting" /> -->
        <div
          class="ch-meetings-invite-modal__buttons"
          :class="isPaidMeeting ? 'ch-paid-meeting' : ''"
        >
          <cs-checkbox
            v-if="isPaidMeeting"
            v-model="grantFreeTicket"
            label="Grant Free Ticket"
          />
          <cs-button :disabled="selectedTotal < 1" @click="sendInvites">
            Send Invites ({{ selectedTotal }})
          </cs-button>
        </div>
      </div>
    </app-tab-modal>
  </div>
</template>

<script>
import $socket from '@/services/socket';
import SendInvite from '@/gql/meetings/SendInvite.gql';

import AppTabModal from '@/components/general/TabModal.vue';
import AppMeetingTabFriends from '@/components/meetings/invitemodal/MeetingTabFriends.vue';
import AppMeetingTabFollowers from '@/components/meetings/invitemodal/MeetingTabFollowers.vue';
import AppMeetingTabGroups from '@/components/meetings/invitemodal/MeetingTabGroups.vue';
import AppMeetingTabAllUsers from '@/components/meetings/invitemodal/MeetingTabAllUsers.vue';

export default {
  components: {
    AppTabModal,
    AppMeetingTabFriends,
    AppMeetingTabFollowers,
    AppMeetingTabGroups,
    AppMeetingTabAllUsers,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    meeting: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      selectedView: 'friends',
      grantFreeTicket: false,
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
        {
          label: 'All users',
          key: 'all-users',
          view: 'All users',
        },
        // {
        //   label: 'Email',
        //   key: 'email',
        //   view: 'Email',
        // },
      ],
      selectedUsers: {},
      selectedGroups: {},
    };
  },
  computed: {
    isPaidMeeting() {
      return !!(this.meeting.ticketPrice && this.meeting.ticketPrice > 0);
    },
    selectedTab() {
      return this.tabs.indexOf(
        this.tabs.find((tab) => tab.key === this.selectedView)
      );
    },
    selectedTotal() {
      const userCount = Object.keys(this.selectedUsers).length;
      let groupCount = 0;
      Object.keys(this.selectedGroups).forEach((key) => {
        const group = this.selectedGroups[key];
        groupCount += (group && group.memberCount) || 0;
      });
      return userCount + groupCount;
    },
  },
  methods: {
    reset() {
      this.selectedUsers = {};
      this.selectedGroups = {};
      this.selectedView = 'friends';
    },
    closeInviteModal() {
      this.reset();
      this.$emit('close');
    },
    selectTab(index) {
      const tab = this.tabs[index];
      this.selectedView = tab.key;
    },
    onSelected($event) {
      const selectedSet = { ...this.selectedUsers };
      const selectedFromTab = Object.keys($event);
      selectedFromTab.forEach((key) => {
        const isSelected = $event[key];
        isSelected ? (selectedSet[key] = true) : delete selectedSet[key];
      });
      this.selectedUsers = selectedSet;
    },
    onSelectedGroups($event) {
      const selectedSet = { ...this.selectedGroups };
      const selectedFromTab = Object.keys($event);
      selectedFromTab.forEach((key) => {
        const group = $event[key];
        group ? (selectedSet[key] = group) : delete selectedSet[key];
      });
      this.selectedGroups = selectedSet;
    },
    async sendInvites() {
      const users = Object.keys(this.selectedUsers).join(',');
      const groups = Object.keys(this.selectedGroups)
        .map((id) => `'${id.trim()}'`)
        .join(',');
      console.log('users', users);
      console.log('groups', groups);
      const mutationVar = {
        meetingId: this.meeting.id,
        users,
        groups,
      };
      if (this.isPaidMeeting)
        mutationVar.grantFreeTicket = this.grantFreeTicket;
      await this.$apollo.mutate({
        mutation: SendInvite,
        variables: mutationVar,
      });
      $socket.sendRoom('meeting', this.meeting.id, 'meeting-members-modified');
      this.$toast.open({
        message: 'Sent',
        type: 'success',
        duration: 2000,
        dismissible: true,
        position: 'top',
      });
      this.closeInviteModal();
    },
  },
};
</script>

<style scoped>
* >>> .ch-modal__body {
  padding: 0px 0px !important;
}
.ch-meeting-invite-modal__body {
  margin-bottom: 100px;
}
.ch-paid-meeting {
  display: flex;
  justify-content: space-between;
}
.ch-meetings-invite-modal__buttons {
  position: absolute;
  bottom: 0;
  right: 0;
  text-align: right;
  padding: 10px;
  background-color: var(--cs-gray-00);
  left: 0;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  border-top: solid 1px var(--cs-gray-02);
  box-sizing: border-box;
}
</style>
