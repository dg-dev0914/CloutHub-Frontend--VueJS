<template>
  <div class="meeting-card">
    <app-img
      v-router-link="{ name: 'MeetingDetail', params: meeting }"
      class="meeting-item-thumbnail cursor-pointer"
      :src="meeting.picture"
      auto-optimize
    ></app-img>
    <app-context-menu v-if="!canModerate && isSuperAdmin" class="admin-menu">
      <app-context-menu-item @click="deleteMeeting">
        [SA]{{ deleteOrCancel }}
      </app-context-menu-item>
    </app-context-menu>
    <app-context-menu v-if="canModerate" class="admin-menu">
      <app-context-menu-item
        v-if="!isScheduled && canModerate && meeting.recordingUrlMp4 !== null"
        @click="downloadMeeting"
      >
        Download Meeting
      </app-context-menu-item>
      <app-context-menu-item @click="$emit('editMeeting')">
        Edit Meeting
      </app-context-menu-item>
      <app-context-menu-item @click="deleteMeeting">
        {{ deleteOrCancel }}
      </app-context-menu-item>
    </app-context-menu>
    <div
      v-router-link="{ name: 'MeetingDetail', params: meeting }"
      class="meeting-item-body"
    >
      <div class="meeting-info">
        <div
          v-if="meeting.category"
          v-router-link="{ name: 'MeetingDetail', params: meeting }"
          class="meeting-cat cs-textstyle-paragraph-small"
        >
          {{ category }}
        </div>
        <div class="meeting-header">
          <div
            v-router-link="{ name: 'MeetingDetail', params: meeting }"
            class="cs-textstyle-paragraph-bold meeting-title"
          >
            <i
              v-if="meeting.privacy === 'private'"
              class="cs-textstyle-paragraph cs-icons-lock meeting-private-icon"
            />
            {{ meeting.name }}
          </div>
        </div>
        <div v-router-link="{ name: 'MeetingDetail', params: meeting }">
          <div v-if="meeting.status == 'LIVE'" class="ch-live">Live Now</div>
          <div v-else>{{ displayTime }}</div>
          <div class="cs-textstyle-paragraph-small-bold">
            Hosted by
            <span
              v-router-link="{
                name: 'UProfile',
                params: { username: meeting.host.username.replace('@', '') },
              }"
              class="ch-user-mention"
            >
              {{
                (meeting.host.displayname.length
                  ? meeting.host.displayname
                  : meeting.host.username
                ).replace('@', '')
              }}
            </span>
          </div>
          <div
            v-if="meeting.description"
            v-router-link="{ name: 'MeetingDetail', params: meeting }"
            class="meeting-description cs-textstyle-paragraph-small text-light"
          >
            {{ meeting.description }}
          </div>
        </div>
      </div>
      <div
        v-router-link="{ name: 'MeetingDetail', params: meeting }"
        class="meeting-meta"
      >
        <div class="meeting-meta-info">
          <div class="meeting-meta-info-left">
            <div
              class="cs-textstyle-paragraph-small text-light"
              @click="onMeetingParticipantsModalOpen"
            >
              {{ meeting.membersCount }}
              {{ meeting.membersCount == 1 ? 'Attendee' : 'Attendees' }}
            </div>
          </div>
          <div
            v-if="
              meeting.status !== 'ENDED' && meeting.status !== 'TRANSCODING'
            "
            class="meeting-button-class"
          >
            <cs-button
              v-if="!isScheduled"
              v-router-link="{ name: 'MeetingDetail', params: meeting }"
              size="small"
              >Join</cs-button
            >
            <cs-button v-if="isScheduled && !meeting.myMembership" size="small"
              >Attend</cs-button
            >
            <cs-button
              v-if="isScheduled && meeting.myMembership"
              fill="outline"
              size="small"
              >Attending</cs-button
            >
          </div>
          <div v-else class="meeting-button-class">
            <cs-button
              v-router-link="{ name: 'MeetingDetail', params: meeting }"
              size="small"
              >Watch Replay</cs-button
            >
            <cs-button
              v-if="!isScheduled && canModerate && meeting.recordingUrlMp4 !== null"
              @click="downloadMeeting"
              size="small"
            >
              Download
            </cs-button>
          </div>
        </div>
      </div>
    </div>
    <!-- Event participants modal  -->
    <app-meeting-participants-modal
      :id="meeting.id"
      :show="showMeetingParticipantsModal"
      @close="onMeetingParticipantsModalClose()"
    />
  </div>
</template>

<script>
import $auth from '@/services/auth';

import AppImg from '@/components/general/Img.vue';
import AppMeetingParticipantsModal from '@/components/meetings/MeetingParticipantsModal.vue';
import AppContextMenu from '@/components/general/ContextMenu.vue';
import AppContextMenuItem from '@/components/general/ContextMenuItem.vue';

// gql
import $popups from '@/services/popups';
import $meetingsApi from '@/api/meetings';
import DeleteMeeting from '@/gql/meetings/DeleteMeeting.gql';
import $socket from '@/services/socket';

export default {
  components: {
    AppImg,
    AppMeetingParticipantsModal,
    AppContextMenu,
    AppContextMenuItem,
  },
  props: {
    meeting: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showMeetingParticipantsModal: false,
    };
  },
  computed: {
    isSuperAdmin() {
      return $auth.isAdmin();
    },
    category() {
      const categoryMap = {
        news: 'News',
        faith: 'Faith',
        politics: 'Politics & Civic',
        music: 'Music',
        finance: 'Finance & Investing',
        business: 'Business',
        health: 'Health & Fitness',
        movies: 'Movies & Shows',
        sports: 'Sports',
        technology: 'Technology',
        games: 'Games & Gaming',
        education: 'Education',
        personalgrowth: 'Personal Growth',
        fashion: 'Fashion & Beauty',
        humor: 'Humor & Memes',
      };
      const type = this.meeting.category;

      const category = categoryMap[type] || type;
      return category.toUpperCase();
    },
    isScheduled() {
      return (
        new Date(this.meeting.startTime).getTime() > new Date().getTime() ||
        this.meeting.status === 'NOT_STARTED'
      );
    },
    role() {
      return (
        this.meeting &&
        this.meeting.myMembership &&
        this.meeting.myMembership.role
      );
    },
    isAdmin() {
      return this.role === 'ADMIN';
    },
    canModerate() {
      return this.role === 'ADMIN' || this.role === 'MODERATOR';
    },
    filteredPeople() {
      return (
        this.members && this.members.filter((member) => member.role === 'ADMIN')
      );
    },
    displayTime() {
      const currentUserTimezone = this.$moment.tz.guess();
      return (
        this.meeting &&
        this.$moment
          .utc(this.meeting.startTime)
          .local()
          .tz(currentUserTimezone)
          .format('MMM D [|] h:mmA z')
      );
    },
    deleteOrCancel() {
      if (
        this.meeting.status === 'NOT_STARTED' ||
        this.meeting.status === 'LIVE'
      ) {
        return 'Cancel Event';
      }
      if (
        this.meeting.status === 'TRANSCODING' ||
        this.meeting.status === 'ENDED'
      ) {
        return 'Delete Event';
      }
      return 'Delete Event';
    },
  },
  methods: {
    async deleteMeeting() {
      const confirmDelete = await $popups.confirmDelete({
        title: 'Delete  Event',
        message:
          "Are you sure you wish to delete this meeting? This can't be undone.",
      });
      if (!confirmDelete) return;
      await this.$apollo.mutate({
        mutation: DeleteMeeting,
        variables: {
          id: this.meeting.id,
        },
        update: (cache) => {
          const normalizedId = cache.identify(this.meeting);
          if (normalizedId) {
            cache.evict({ id: normalizedId });
            cache.gc();
          }
        },
      });
      $socket.sendRoom('meeting', this.draftMeeting.id, 'meeting-deleted');
    },
    onMeetingParticipantsModalClose() {
      this.showMeetingParticipantsModal = false;
    },
    onMeetingParticipantsModalOpen() {
      this.showMeetingParticipantsModal = true;
    },
    async signup() {
      await $meetingsApi.signup(this.meeting);
    },
    async unsignup() {
      try {
        await $meetingsApi.unsignup(this.meeting);
      } catch (e) {
        $popups.alert(
          'There was an error saving.  Please try again or contact support.'
        );
        throw e;
      }
    },
    downloadMeeting() {
      const a = document.createElement('a');
      a.href = this.meeting.recordingUrlMp4;
      a.download = true;
      a.click();
    },
  },
};
</script>

<style scoped>
.admin-menu {
  position: absolute;
  right: 15px;
}
.meeting-card {
  background-color: white;
  border-radius: 5px;
  overflow: hidden;
  cursor: pointer;
  border: solid 1px var(--cs-gray-02);
  display: flex;
  flex-direction: row;
  position: relative;
}
.meeting-item-thumbnail {
  width: 185px;
  height: 185px;
  object-fit: cover;
}
.meeting-item-body {
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  max-width: 279px;
}
.meeting-info {
  padding: 2px 10px;
}
.meeting-cat {
  color: var(--cs-primary-base);
}
.meeting-meta {
  padding: 2px 10px;
  display: flex;
  gap: 3px;
}

.meeting-meta-info {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between !important;
  width: 100%;
}

.meeting-color {
  color: var(--cs-gray-05);
}
.cursor-pointer {
  display: flex;
  flex-wrap: wrap;
  word-break: break-all !important;
}
.meeting-avatar {
  margin-top: 15px;
}
.meeting-title {
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.meeting-description {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.meeting-private-icon {
  color: var(--cs-primary-base);
  margin-right: 1px;
}
.ch-live {
  color: red;
}

.meeting-header {
  display: flex;
  justify-content: space-between;
}
.meeting-button-class {
  display: flex;
  flex-direction: column; /* Change back to column for top-to-bottom */
  align-items: flex-end; /* Adjust as needed */
}

.meeting-button-class button {
  margin-top: 10px; /* Add some top margin for spacing between buttons */
  white-space: normal;
  word-wrap: break-word;
}

</style>
