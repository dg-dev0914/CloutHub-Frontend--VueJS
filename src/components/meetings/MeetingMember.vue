<template>
  <div>
    <div class="meeting-member">
      <div v-if="member.online" class="ch-user-online"></div>
      <app-avatar
        :name="member.user.displayname"
        :picture="member.user.profilePhotoURL"
        ref="menuButton"
        class="meeting-member-avatar"
        :class="{
          speaking: audioLevel > 3,
          'meeting-member-avatar--has-menu': hasMenu,
          speaker: member.role === 'SPEAKER',
          moderator: member.role === 'MODERATOR',
          presenter:
            member.role === 'ADMIN' ||
            member.role === 'PRESENTER' ||
            member.role === 'PRESENTER_QUEUE',
          leader: [
            'ADMIN',
            'MODERATOR',
            'PRESENTER',
            'PRESENTER_QUEUE',
          ].includes(member.role),
        }"
        tabindex="-1"
        size="small"
      />
      <div class="meeting-member-info">
        <!-- <div class="cs-textstyle-paragraph-bold">{{member.user.displayname}}</div> -->
        <div
          class="cs-textstyle-paragraph-small meeting-member-info"
          :class="{
            offline: !member.online,
          }"
        >
          {{ shownUserName }}
        </div>
        <div v-if="showRole" class="meeting-member__role">
          {{ leaderRole }}
        </div>
      </div>
    </div>
    <b-popover
      :target="$refs.menuButton"
      placement="left"
      triggers="click blur"
      ref="menuPopover"
      fallback-placement="counterclockwise"
      custom-class="role-menu"
      v-if="$refs.menuButton"
      @show.bs.popover="handleShow"
    >
      <div @click="$refs.menuPopover && $refs.menuPopover.$emit('close')">
        <div class="meeting-member-profile" @click="viewProfile()">
          <app-meeting-member-info :user="member.user" />
          <div class="cs-textstyle-paragraph-small">
            <table class="user-attribute-table">
              <tr>
                <td>Status</td>
                <td class="user-attribute-value">
                  <span v-if="online">ONLINE</span>
                  <span v-if="!online">OFFLINE</span>
                </td>
              </tr>
              <tr v-if="online">
                <td>Camera</td>
                <td class="user-attribute-value">
                  {{ cameraStatus }}
                </td>
              </tr>
              <tr v-if="online">
                <td>Mic</td>
                <td class="user-attribute-value">
                  {{ micStatus }}
                </td>
              </tr>
              <tr v-if="online">
                <td>Device</td>
                <td class="user-attribute-value">
                  {{ device }}
                </td>
              </tr>
            </table>
          </div>
        </div>
        <div v-if="hasMenu" class="meeting-member-menu">
          <app-context-menu-item
            @click="setRole(role.value)"
            v-for="(role, index) in menuOptions"
            :key="role.label + index"
            class="role-item"
          >
            <div class="cs-textstyle-paragraph-small-bold">
              {{ role.label }}
            </div>
          </app-context-menu-item>
        </div>
      </div>
    </b-popover>
  </div>
</template>
<script>
import $auth from '@/services/auth';
import $meetingsApi from '@/api/meetings';
import $socket from '@/services/socket';
import $meetingusers from './meetingusers';

import AppAvatar from '@/components/general/Avatar.vue';
import AppContextMenuItem from '@/components/general/ContextMenuItem.vue';
import AppMeetingMemberInfo from '@/components/meetings/MeetingMemberInfo.vue';

const leader_roles = {
  ADMIN: 'Host',
  PRESENTER: 'Presenter',
  PRESENTER_QUEUE: 'Presenter Queue',
  MODERATOR: 'Moderator',
};
const roles = {
  admin: {
    label: 'Make Host',
    description:
      'Can speak, share camera, share screen, and manage participants',
    value: 'ADMIN',
  },
  presenter: {
    label: 'Make Presenter',
    description: 'Can speak, share camera, share screen',
    value: 'PRESENTER',
  },
  presenterQueue: {
    label: 'Make Presenter Queue',
    description: 'Can prepare mic or camera',
    value: 'PRESENTER_QUEUE',
  },
  speaker: {
    label: 'Make Speaker',
    description: 'Can speak',
    value: 'SPEAKER',
  },
  moderator: {
    label: 'Make Moderator',
    description:
      'Can speak, share camera, share screen, and manage participants',
    value: 'MODERATOR',
  },
  audience: {
    label: 'Make Audience',
    description: 'Watch / listen only',
    value: 'VIEWER',
  },
  cancelQueue: {
    label: 'Cancel Request',
    description: 'Cancel the request to speak',
    value: 'VIEWER',
  },
  banned: {
    label: 'Ban from Event',
    description: 'Ban the user from the meeting',
    value: 'BANNED',
  },
};

export default {
  components: {
    AppAvatar,
    AppContextMenuItem,
    AppMeetingMemberInfo,
  },
  props: {
    member: {
      type: Object,
      required: true,
    },
    meeting: {
      type: Object,
      required: true,
    },
    showRole: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      mounted: false,
      audioLevel: 0,
      online: false,
      cameraStatus: 'UNKNOWN',
      micStatus: 'UNKNOWN',
      device: 'UNKNOWN',
      user: null,
    };
  },
  computed: {
    shownUserName() {
      let result;
      if (this.member.user.username === this.user.username) {
        result = this.user.displayname.length
          ? this.user.displayname
          : this.user.username.replace('@', '');
      } else {
        result = this.member.user.displayname.length
          ? this.member.user.displayname
          : this.member.user.username.replace('@', '');
      }
      return result;
    },
    isLoggedInUser() {
      return this.member.user.id === $auth.getUserId();
    },
    leaderRole() {
      return leader_roles[this.member.role];
    },
    myRole() {
      return (
        this.meeting &&
        this.meeting.myMembership &&
        this.meeting.myMembership.role
      );
    },
    hasMenu() {
      return (
        this.mounted &&
        ['ADMIN', 'MODERATOR'].includes(this.myRole) &&
        !this.isLoggedInUser &&
        this.meeting.status !== 'TRANSCODING' &&
        this.meeting.status !== 'ENDED'
      );
    },
    menuOptions() {
      const role = this.member.role;
      if (role === 'ADMIN') {
        return [
          roles.presenter,
          roles.presenterQueue,
          roles.speaker,
          roles.moderator,
          roles.audience,
        ];
      }
      if (role === 'MODERATOR') {
        return [
          roles.admin,
          roles.presenter,
          roles.presenterQueue,
          roles.speaker,
          roles.audience,
          roles.banned,
        ];
      }
      if (role === 'PRESENTER') {
        return [
          roles.admin,
          roles.presenterQueue,
          roles.speaker,
          roles.moderator,
          roles.audience,
          roles.banned,
        ];
      }
      if (role === 'PRESENTER_QUEUE') {
        return [
          roles.admin,
          roles.presenter,
          roles.speaker,
          roles.moderator,
          roles.audience,
          roles.banned,
        ];
      }
      if (role === 'SPEAKER') {
        return [
          roles.admin,
          roles.moderator,
          roles.presenter,
          roles.presenterQueue,
          roles.audience,
          roles.banned,
        ];
      }
      if (role === 'QUEUE') {
        return [
          roles.admin,
          roles.presenter,
          roles.presenterQueue,
          roles.speaker,
          roles.moderator,
          roles.cancelQueue,
          roles.banned,
        ];
      }
      if (role === 'VIEWER') {
        return [
          roles.admin,
          roles.presenter,
          roles.presenterQueue,
          roles.speaker,
          roles.moderator,
          roles.banned,
        ];
      }
      return [];
    },
  },
  async created() {
    this.user = await $auth.getUser();
  },
  methods: {
    async setRole(role) {
      await $meetingsApi.setRole(this.meeting.id, this.member.userId, role);
      $socket.sendRoom('meeting', this.meeting.id, 'meeting-members-modified');
    },
    viewProfile() {
      window.open(`/#/users/id/${this.member.user.id}`);
    },
    async handleShow() {
      try {
        const attributes = await $socket.getUserAttributes(this.member.user.id);
        this.online = true;
        this.cameraStatus = attributes.camera || 'OFFLINE';
        this.micStatus = attributes.mic || 'OFFLINE';
        this.device = attributes.device || 'UNKNOWN';
        console.log(attributes);
      } catch (err) {
        this.online = false;
        this.cameraStatus = 'UNKNOWN';
        this.micStatus = 'UNKNOWN';
      }
    },
  },
  mounted() {
    this.mounted = true;
    setInterval(() => {
      const numericUserId =
        this.member.user.id.match(/\d/g).join('').substring(0, 8) * 1;
      const al = $meetingusers.getAudioLevel(numericUserId) * 10;
      $meetingusers.register(numericUserId, this.member.user);
      this.audioLevel = al > 0.1 ? 5 : 3;
    }, 300);
  },
};
</script>
<style scoped>
.meeting-member {
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: center;
  width: 88px;
  position: relative;
}
.speaking {
  box-shadow: 0 0 2px 2px #aaa !important;
}
.meeting-member-info {
  text-align: center;
  width: 90px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.meeting-member-avatar {
  --ch-avatar-size: 50px;
  box-sizing: content-box;
  transition: box-shadow 0.3s linear;
  display: block;
}
.meeting-member-avatar.speaker {
  border: solid 3px green;
  border-radius: 50%;
}
.meeting-member-avatar.moderator {
  border: solid 3px red;
  border-radius: 50%;
}
.meeting-member-avatar.presenter {
  border: solid 3px #dada27;
  border-radius: 50%;
}

.meeting-member-avatar.leader {
  --ch-avatar-size: 50px;
}
.meeting-member-avatar--has-menu {
  cursor: pointer;
}

.meeting-member__role {
  font-family: var(--cs-font-primary);
  font-size: 11px;
  font-weight: bold;
  line-height: 1;
}

.role-menu {
  padding: 0;
}
.role-item {
  padding: 5px 15px;
  margin: 0 -15px;
}
.role-item:hover {
  color: var(--cs-primary-base);
  background-color: var(--cs-gray-01);
}
.meeting-member-profile {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.meeting-member-menu {
  border-top: solid 1px #ccc;
  margin-top: 10px;
  padding-top: 10px;
}
.meeting-member-info .offline {
  font-style: italic;
}
.user-attribute-table td {
  padding-right: 10px;
}
.user-attribute-value {
  color: var(--cs-gray-08);
}
.user-attribute-table {
  margin-top: 10px;
  color: var(--cs-gray-04);
}
.ch-user-online {
  position: absolute;
  top: 0;
  z-index: 1;
  right: 28px;
  height: 15px;
  width: 15px;
  background-color: green;
  border-radius: 50%;
  display: inline-block;
}
</style>
