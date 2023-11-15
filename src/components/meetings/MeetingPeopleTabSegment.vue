<template>
  <div class="ch-meeting-people-tab-segment" v-if="memberCount > 0">
    <div class="ch-meeting-people-tab-segment__header">
      <div
        v-if="title"
        class="ch-meeting-people-tab-segment__title cs-textstyle-paragraph-bold"
      >
        {{ title }}
      </div>
    </div>
    <div class="ch-meeting-people-tab-segment__members">
      <app-meeting-member
        v-for="(member, $index) in members"
        :key="$index + '-' + member.id"
        :member="member"
        :meeting="meeting"
        :show-role="type === 'leaders'"
        class="meeting-member"
      />
      <!-- <cs-empty-state v-if="memberCount === 0" description="No people here yet"/> -->
    </div>
    <app-meeting-people-modal
      :show="showAll"
      :title="title"
      :members="members"
      :meeting="meeting"
      @close="showAll = false"
    />
  </div>
</template>

<script>
import AppMeetingMember from '@/components/meetings/MeetingMember.vue';
import AppMeetingPeopleModal from '@/components/meetings/MeetingPeopleModal.vue';

export default {
  components: {
    AppMeetingMember,
    AppMeetingPeopleModal,
  },
  props: {
    title: {
      type: String,
    },
    type: {
      type: String,
    },
    members: {
      type: Array,
    },
    meeting: {
      type: Object,
      required: true,
    },
    noLine: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    memberCount() {
      return (this.members && this.members.length) || 0;
    },
  },
  data() {
    return {
      showAll: false,
    };
  },
};
</script>

<style scoped>
.ch-meeting-people-tab-segment {
  padding: 0 10px 15px;
  border-bottom: solid 1px var(--cs-gray-02);
}
.ch-meeting-people-tab-segment__header {
  display: flex;
  align-items: center;
  gap: 15px;
}
.ch-meeting-people-tab-segment__title {
  flex: 1;
}
.ch-meeting-people-tab-segment__view-all {
  color: var(--cs-primary-base);
  cursor: pointer;
}
.ch-meeting-people-tab-segment__view-all i {
  margin-left: 10px;
}
.meeting-member {
  display: inline-block;
  margin: 15px 0 0;
}
</style>
