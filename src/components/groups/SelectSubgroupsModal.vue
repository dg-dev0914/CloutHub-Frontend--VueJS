<template lang="html">
  <div>
    <!-- Used when creating a post in a parent group to share it to the subgroups -->
    <app-form-modal
      :show="show"
      title="Select Subgroups to Share"
      @close="close"
    >
      <div class="subgroups-list-containter">
        <app-check-box
          label="All"
          :value="isAllSelected"
          @clicked="toggleAll()"
        />
      </div>
      <div
        v-for="subgroup in subgroups"
        :key="subgroup.id"
        class="subgroups-list-containter"
      >
        <app-check-box
          :label="subgroup.name"
          :value="isChecked(subgroup.id)"
          @clicked="toggleSubgroup(subgroup.id)"
        />
      </div>
      <div slot="footer" class="select-subgroups-modal__button-holder">
        <cs-button size="small" @click="close">Close</cs-button>
      </div>
    </app-form-modal>
  </div>
</template>

<script>
// GQL
import ListSubgroupsByGroupId from '@/gql/groups/ListSubgroupsByGroupId.gql';

// General components
import AppFormModal from '@/components/general/FormModal.vue';
import AppCheckBox from '@/components/general/CheckBox.vue';

import { sortByName } from '@/services/utils';

export default {
  components: {
    AppFormModal,
    AppCheckBox,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    groupId: {
      type: String,
      required: true,
    },
    selectedSubgroups: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      subgroups: [],
    };
  },
  apollo: {
    subgroups: {
      query: ListSubgroupsByGroupId,
      variables() {
        return {
          parentGroupId: this.groupId,
        };
      },
      update: (data) => data.groups.slice().sort(sortByName),
    },
  },
  computed: {
    isAllSelected() {
      return (
        this.subgroups.length > 0 &&
        this.selectedSubgroups.length === this.subgroups.length &&
        this.subgroups.every(({ id }) => this.isChecked(id))
      );
    },
  },
  methods: {
    close() {
      this.$emit('close');
    },
    toggleSubgroup(id) {
      this.$emit('toggleSubgroup', id);
    },
    isChecked(id) {
      return this.selectedSubgroups.includes(id);
    },
    toggleAll() {
      const selectAll = !this.isAllSelected;

      this.subgroups.forEach(({ id }) => {
        const isChecked = this.isChecked(id);
        const shouldToggleSubgroupState =
          (selectAll && !isChecked) || (!selectAll && isChecked);

        if (shouldToggleSubgroupState) {
          this.toggleSubgroup(id);
        }
      });
    },
  },
};
</script>

<style lang="css" scoped>
.select-subgroups-modal__button-holder {
  text-align: right;
}
</style>
