<template>
  <div class="">
    <div
      class="ch-meeting-about-tab__description"
      v-if="meeting.description"
      v-html="linkedDescription"
    ></div>

    <div v-if="!meeting.description">
      <cs-empty-state>
        <div slot="title" class="cs-textstyle-item-heading">No description</div>
        <div slot="button">
          <cs-button @click="edit" size="small" fill="outline" v-if="isAdmin"
            >Edit</cs-button
          >
        </div>
      </cs-empty-state>
    </div>
    <app-edit-meeting-modal
      v-if="editableMeeting && showEditModal"
      :originalMeeting="editableMeeting"
      :show="showEditModal"
      @close="showEditModal = false"
    />
  </div>
</template>
<script>
import linkifyStr from 'linkifyjs/string';

import AppEditMeetingModal from '@/components/meetings/EditMeetingModal.vue';

export default {
  components: {
    AppEditMeetingModal,
  },
  props: {
    meeting: {
      type: Object,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    linkedDescription() {
      return (
        this.meeting.description &&
        linkifyStr(this.meeting.description, {
          target: {
            url: '_blank',
          },
        })
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
    edit() {
      this.editableMeeting = { ...this.meeting };
      this.showEditModal = true;
    },
  },
};
</script>

<style scoped>
.ch-meeting-about-tab__description {
  white-space: pre-line;
}
.ch-meeting-about-tab__description >>> a {
  color: var(--cs-primary-base) !important;
}
</style>
