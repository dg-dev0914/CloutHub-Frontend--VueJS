<template>
  <div class="ch-profile__card">
    <app-spinner v-if="!groups" />
    <app-group-list
      v-else
      :users="groups"
      :selected-groups="selectedGroups"
      :meeting="meeting"
      @selected-groups="$emit('selected-groups', $event)"
    />
    <app-infinite-offset :query="$apollo.queries.groups" />
  </div>
</template>

<script>
import ListManagedGroups from '@/gql/groups/ListManagedGroups.gql';
import AppGroupList from '@/components/meetings/invitemodal/MeetingGroupList.vue';
import AppSpinner from '@/components/general/Spinner.vue';
import AppInfiniteOffset from '@/components/general/InfiniteOffset.vue';

export default {
  components: {
    AppGroupList,
    AppSpinner,
    AppInfiniteOffset,
  },
  props: {
    selectedGroups: {
      type: Object,
      required: true,
    },
    meeting: {
      type: Object,
      required: true,
    },
  },
  apollo: {
    groups: {
      query: ListManagedGroups,
    },
  },
};
</script>
