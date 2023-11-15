<template>
  <div>
    <app-meeting-button @click="share">
      <i class="ch-icons-share" /> Share
    </app-meeting-button>
    <!-- Share Event Modal -->
    <app-share-meeting-modal
      v-if="showModal"
      :show-modal="showModal"
      :shared-info="sharedInfo"
      @close-modal="closeShareModal"
    />
  </div>
</template>

<script>
import AppMeetingButton from '@/components/meetings/buttons/MeetingButton.vue';
import AppShareMeetingModal from '@/components/meetings/ShareMeetingModal.vue';

export default {
  components: {
    AppMeetingButton,
    AppShareMeetingModal,
  },
  props: {
    meeting: {
      type: Object,
    },
    size: {
      type: String,
      default: 'medium',
    },
  },
  data() {
    return {
      showModal: false,
      sharedInfo: null,
    };
  },
  methods: {
    share() {
      const params = {
        title: 'Share Event',
        itemType: 'meeting',
        itemId: this.meeting.id,
        itemSlug: this.meeting.slug,
        itemTitle: this.meeting.name,
        itemDescription: this.meeting.description,
        itemPicture: this.meeting.picture,
      };
      this.sharedInfo = params;
      this.showModal = true;
    },
    closeShareModal() {
      this.showModal = false;
    },
  },
};
</script>
