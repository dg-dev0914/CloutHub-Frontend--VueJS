<template>
  <div>
    <app-spinner v-if="!meetings"></app-spinner>
    <div v-if="meetings" class="row">
      <div
        class="meeting-card-wrapper"
        :class="itemClass"
        v-for="meeting in filteredMeetings"
        :key="meeting.id"
      >
        <app-meeting-item
          @editMeeting="editMeeting(meeting)"
          :meeting="meeting"
        ></app-meeting-item>
      </div>
      <cs-empty-state
        :title="placeholder"
        v-if="!filteredMeetings.length"
        class="empty-state-border"
      >
      </cs-empty-state>
      <!-- Edit Event participants  -->
      <app-edit-meeting-modal
        v-if="showEditModal"
        :original-meeting="editableMeeting"
        :show="showEditModal"
        @close="showEditModal = false"
      />
    </div>
  </div>
</template>

<script>
import AppSpinner from '@/components/general/Spinner.vue';
import AppMeetingItem from '@/components/meetings/MeetingItem.vue';
import AppEditMeetingModal from '@/components/meetings/EditMeetingModal.vue';

export default {
  components: {
    AppSpinner,
    AppMeetingItem,
    AppEditMeetingModal,
  },
  props: {
    meetings: {
      type: Array,
    },
    itemClass: {
      type: String,
      default: 'col-md-6',
    },
    placeholder: {
      type: String,
      default: 'No matching meetings',
    },
  },
  computed: {
    filteredMeetings() {
      return this.meetings.filter(
        (meeting) =>
          meeting.privacy === 'public' ||
          (meeting.privacy === 'private' && meeting.myMembership)
      );
    },
  },
  data() {
    return {
      editableMeeting: null,
      showEditModal: false,
    };
  },
  methods: {
    editMeeting(meeting) {
      this.editableMeeting = meeting;
      this.showEditModal = true;
    },
  },
};
</script>

<style scoped>
.meeting-card-wrapper {
  padding: 10px;
  padding-top: 0px;
  padding-bottom: 20px;
}
.empty-state-border {
  border: dashed 1px var(--cs-gray-02);
  border-radius: 10px;
}
</style>
