<template>
  <b-row sm="12">
    <app-group-card
      v-for="group in groups"
      :key="group.id"
      :group="group"
      :item-class="itemClass"
    />
  </b-row>
</template>

<script>
// Group common components
import AppGroupCard from '@/components/groups/GroupCard.vue';

export default {
  components: {
    AppGroupCard,
  },
  props: {
    groups: {
      type: Array,
      required: true,
    },
    itemClass: {
      type: String,
      required: false,
      default: undefined,
    },
  },
};
</script>
