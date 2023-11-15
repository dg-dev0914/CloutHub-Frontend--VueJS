<template>
  <div class="ch-add-leader-button">
    <div
      class="ch-add-leader-button__button cs-textstyle-paragraph-small-bold"
      @click="openAddLeadersModal"
    >
      + Add Leaders
    </div>
    <app-form-modal
      :show="show"
      @close="show = false"
      title="Add Leaders"
      :saving="saving"
    >
      <div class="ch-add-leader-button__content">
        <div class="ch-add-leader-button__info cs-textstyle-paragraph">
          Search and add one or more leaders for the event.
        </div>
        <app-multiselect-user-input
          label="Add Hosts"
          v-model="admins"
          @input="addedAdmin"
          hide-logged-in-user
        />
        <app-multiselect-user-input
          label="Add Presenters"
          v-model="presenters"
          @input="addedPresenter"
          hide-logged-in-user
        />
        <app-multiselect-user-input
          label="Add Moderators"
          v-model="moderators"
          @input="addedModerator"
          hide-logged-in-user
        />
      </div>
      <cs-button
        slot="footer"
        variant="primary"
        size="small"
        class="ch-add-leader-button__save-button"
        @click="save"
      >
        Save
      </cs-button>
    </app-form-modal>
  </div>
</template>

<script>
import $auth from '@/services/auth';
import $socket from '@/services/socket';
import $popups from '@/services/popups';
import $meetingsApi from '@/api/meetings';

import AppFormModal from '@/components/general/FormModal.vue';
import AppMultiselectUserInput from '@/components/general/MultiselectUserInput.vue';

const removeAfromB = (usersA, usersB) =>
  usersB.filter((ub) => {
    let isNotInA = true;
    usersA.forEach((ua) => {
      if (ua.id === ub.id) isNotInA = false;
    });
    return isNotInA;
  });

export default {
  components: {
    AppFormModal,
    AppMultiselectUserInput,
  },
  props: {
    meeting: {
      type: Object,
      required: true,
    },
    members: {
      type: Array,
      required: true,
    },
  },
  computed: {},
  data() {
    return {
      show: false,
      saving: false,
      presenters: [],
      moderators: [],
      admins: [],
    };
  },
  methods: {
    openAddLeadersModal() {
      this.show = true;
      this.presenters = this.members
        .filter((m) => m.role === 'PRESENTER' && m.userId !== $auth.getUserId())
        .map((m) => m.user);
      this.moderators = this.members
        .filter((m) => m.role === 'MODERATOR' && m.userId !== $auth.getUserId())
        .map((m) => m.user);
      this.admins = this.members
        .filter((m) => m.role === 'ADMIN' && m.userId !== $auth.getUserId())
        .map((m) => m.user);
    },
    async save() {
      this.saving = true;
      try {
        await $meetingsApi.setLeaders(this.meeting.id, {
          presenters: this.presenters.map((u) => u.id).join(','),
          moderators: this.moderators.map((u) => u.id).join(','),
          admins: this.admins.map((u) => u.id).join(','),
        });
        $socket.sendRoom(
          'meeting',
          this.meeting.id,
          'meeting-members-modified'
        );
        this.saving = false;
        this.show = false;
      } catch (e) {
        this.saving = false;
        $popups.alert(
          'There was an error saving.  Please try again or contact support.'
        );
        throw e;
      }
    },
    addedPresenter(presenters) {
      this.moderators = removeAfromB(presenters, this.moderators);
      this.admins = removeAfromB(presenters, this.admins);
    },
    addedModerator(moderators) {
      this.presenters = removeAfromB(moderators, this.presenters);
      this.admins = removeAfromB(moderators, this.admins);
    },
    addedAdmin(admins) {
      this.presenters = removeAfromB(admins, this.presenters);
      this.moderators = removeAfromB(admins, this.moderators);
    },
  },
};
</script>

<style scoped>
.ch-add-leader-button__button {
  color: #0091ff;
  cursor: pointer;
}
.ch-add-leader-button__content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ch-add-leader-button__info {
  color: var(--cs-gray-04);
}

.ch-add-leader-button__save-button {
  float: right;
}
</style>
