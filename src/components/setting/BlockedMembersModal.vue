<template lang="html">
  <app-modal :show="show" @close="$emit('close')" title="Blocked Members">
    <div>
      <div class="ch-blocked-members__title">
        You will not see posts, replies, and receive messages from the members below. They will also not see your posts, replies and receive your messages as well.
      </div>
      <div v-if="people && people.length">
        <div class="ch-blocked-user" v-for="person in people" :key="person.id">
          <div class="ch-blocked-users-info">
            <app-avatar
              :picture="person.profilePhotoURL"
              :name="person.displayname"
              size="small"
            />
            <div class="ch-blocked-users-content">
              <span class="cs-textstyle-informative-paragraph-bold ch-blocked-users-name">
                <app-username :user="person" type="displayname"/>
              </span>
              <span class="ch-blocked-users-status">{{person.username}}</span>
            </div>
          </div>
          <cs-button size="small" fill="outline" @click="unblockUser(person)">Unblock</cs-button>
        </div>
      </div>
      <div v-if="people && !people.length">
        <cs-empty-state description="No-one blocked">
        </cs-empty-state>
      </div>
      <app-spinner v-if="!people"/>
    </div>
  </app-modal>
</template>

<script>
import $relationships from '@/api/connections';
import ListBlockedUsers from '@/gql/connections/ListBlockedUsers.gql';
import AppAvatar from '@/components/general/Avatar.vue';
import AppModal from '@/components/general/Modal.vue';
import AppSpinner from '@/components/general/Spinner.vue';
import AppUsername from '@/components/general/Username.vue';

export default {
  components: {
    AppAvatar,
    AppModal,
    AppSpinner,
    AppUsername,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      updated: false,
    };
  },
  apollo: {
    people: {
      query: ListBlockedUsers,
    },
  },
  watch: {
    async show() {
      await this.$apollo.queries.people.refetch();
    },
  },
  methods: {
    async unblockUser(user) {
      $relationships.unblockUser(user);
    },
  },
};
</script>

<style scoped>
.ch-blocked-user {
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
.ch-blocked-users-info {
  display: flex;
  flex-direction: row;
  gap: 10px;
}
.ch-blocked-users-content {
  display: flex;
  flex-direction: column;
}
.ch-blocked-users-name {
  color: var(--cs-gray-05);
}
.ch-blocked-users-status {
  color: var(--cs-gray-04);
  font-size: 14px;
}
</style>
