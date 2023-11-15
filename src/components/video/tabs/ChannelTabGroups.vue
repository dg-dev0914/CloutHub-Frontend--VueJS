<template>
  <div class="ch-profile__card">
    <app-spinner v-if="!groups" />
    <app-group-list v-else :users="groups" />
  </div>
</template>

<script>
import ListManagedGroups from '@/gql/groups/ListManagedGroups.gql';
import AppGroupList from '@/components/video/tabs/ChannelGroupList.vue';
import AppSpinner from '@/components/general/Spinner.vue';

export default {
  components: {
    AppGroupList,
    AppSpinner,
  },
  apollo: {
    groups: {
      query: ListManagedGroups,
    },
  },
  data() {
    return {
      mayHaveMore: true,
    };
  },
};
</script>
