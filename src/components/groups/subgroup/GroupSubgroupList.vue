<template>
  <b-row sm="12">
    <app-group-subgroup-item
      v-for="group in groups"
      :key="group.id"
      :group="group"
      :item-class="itemClass"
    />
  </b-row>
</template>

<script>
import AppGroupSubgroupItem from '@/components/groups/subgroup/GroupSubgroupItem.vue';

export default {
  components: {
    AppGroupSubgroupItem,
  },
  props: {
    groups: {
      type: Array,
      required: true,
    },
    itemClass: {
      type: String,
      required: false,
      default: null,
    },
  },
};
</script>
