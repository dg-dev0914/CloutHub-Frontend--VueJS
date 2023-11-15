<template>
  <app-modal :show="show" title="Members List" @close="$emit('close')">
    <div class="group-members-list-modal__content">
      <cs-search-bar
        placeholder="Search members"
        @input="getSearchMemberInput"
      />
      <app-group-members-list
        view-all
        :group="group"
        role="member"
        :search-member-input="searchMemberInput"
      />
    </div>
  </app-modal>
</template>

<script>
import AppModal from '@/components/general/Modal.vue';
import AppGroupMembersList from '@/components/groups/detail/GroupMembersList.vue';

export default {
  components: {
    AppModal,
    AppGroupMembersList,
  },
  props: {
    show: {
      type: Boolean,
      required: false,
      default: false,
    },
    group: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      searchMemberInput: '',
    };
  },
  methods: {
    getSearchMemberInput(input) {
      this.searchMemberInput = input;
    },
  },
};
</script>
