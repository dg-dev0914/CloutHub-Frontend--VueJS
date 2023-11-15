<template>
  <div>
    <app-context-menu
      class="icons"
      placement="left"
      :icon="isSettingIcon ? 'cs-icons-settings' : 'cs-icons-options'"
    >
      <app-context-menu-item @click="deleteMeeting">
        {{ deleteOrCancel }}
      </app-context-menu-item>
      <app-context-menu-item @click="edit">Edit Event</app-context-menu-item>
      <app-context-menu-item
        v-if="meeting.ticketPrice"
        @click="showTicketSales()"
        >Ticket Sales</app-context-menu-item
      >
    </app-context-menu>
    <app-edit-meeting-modal
      v-if="editableMeeting && showEditModal"
      :original-meeting="editableMeeting"
      :show="showEditModal"
      @close="showEditModal = false"
    />
    <app-meeting-tickets-modal
      v-if="meeting.ticketPrice"
      :show="showTicketsModal"
      :meeting="meeting"
      @close="showTicketsModal = false"
    />
  </div>
</template>
<script>
import AppEditMeetingModal from '@/components/meetings/EditMeetingModal.vue';
import AppMeetingTicketsModal from '@/components/meetings/MeetingTicketsModal.vue';
import AppContextMenu from '@/components/general/ContextMenu.vue';
import AppContextMenuItem from '@/components/general/ContextMenuItem.vue';
import DeleteMeeting from '@/gql/meetings/DeleteMeeting.gql';
import $popups from '@/services/popups';
import $socket from '@/services/socket';

export default {
  components: {
    AppEditMeetingModal,
    AppContextMenu,
    AppContextMenuItem,
    AppMeetingTicketsModal,
  },
  props: {
    meeting: {
      type: Object,
      required: true,
    },
    isSettingIcon: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      editableMeeting: null,
      showEditModal: false,
      showTicketsModal: false,
    };
  },
  computed: {
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
    showTicketSales() {
      this.showTicketsModal = true;
    },
    // Edit Event
    edit() {
      this.editableMeeting = { ...this.meeting };
      this.showEditModal = true;
    },
    // Delete meeting
    async deleteMeeting() {
      const confirmDelete = await $popups.confirmDelete({
        title: 'Delete Event',
        message:
          "Are you sure you wish to delete this event? This can't be undone.",
      });
      if (!confirmDelete) return;
      await this.$apollo.mutate({
        mutation: DeleteMeeting,
        variables: {
          id: this.meeting.id,
        },
        update: (cache, mutationResponse) => {
          const normalizedId = cache.identify(this.meeting);
          if (normalizedId) {
            cache.evict({ id: normalizedId });
            cache.gc();
            this.$router.push({ name: 'MeetingContainer' });
          }
        },
      });
      $socket.sendRoom('meeting', this.draftMeeting.id, 'meeting-deleted');
      this.$router.push({ name: 'MeetingContainer' });
    },
  },
};
</script>

<style scoped>
.icons >>> .context-menu-button {
  font-size: 25px;
  transform: scale(1.5);
}
</style>
