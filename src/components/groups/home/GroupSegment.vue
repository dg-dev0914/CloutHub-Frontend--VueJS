<template>
  <div class="">
    <app-header-segment :title="title" button="View More" @action="viewAll" />
    <cs-spinner v-if="!groups" />
    <template v-if="groups">
      <group-grid :groups="sortedGroups" item-class="col-md-3" />
    </template>
    <cs-empty-state
      v-if="groups && !groups.length"
      :title="placeholderGroups"
    ></cs-empty-state>
  </div>
</template>

<script>
import GroupGrid from '@/components/groups/GroupGrid.vue';
import AppHeaderSegment from '@/components/general/HeaderSegment.vue';

const titles = {
  'Recommended Groups': 'There are currently no recommended groups for you',
  'My Groups': "You haven't joined any groups yet",
  'Managed Groups': "You don't lead any groups",
};

export default {
  components: {
    GroupGrid,
    AppHeaderSegment,
  },
  props: {
    title: {
      type: String,
      required: true,
      default: 'Untitled Segment',
    },
    query: {
      type: Object,
      required: true,
    },
    count: {
      type: Number,
      required: false,
      default: 8,
    },
    to: {
      type: Object,
      required: true,
    },
    sort: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  apollo: {
    groups: {
      query() {
        return this.query;
      },
    },
  },
  computed: {
    sortedGroups() {
      if (!this.sort) return this.displayGroups;
      return this.displayGroups
        .slice()
        .sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1));
    },
    // Filter out subgroups
    displayGroups() {
      const groups = this.groups.filter((group) => !group.parentGroupId);
      return groups.slice(0, this.count);
    },
    placeholderGroups() {
      return titles[this.title] || 'No matching groups';
    },
  },
  methods: {
    viewAll() {
      this.$router.push(this.to);
    },
  },
};
</script>
