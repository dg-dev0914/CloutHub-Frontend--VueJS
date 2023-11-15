<template>
  <app-modal :show="show" @close="$emit('close')" title="People">
    <div class="users" v-if="members && members.length > 0">
      <div v-for="user in members" :key="user.id">
        <app-avatar
          class="cursor-pointer"
          :name="user.user.displayname"
          size="large"
          :picture="user.user.profilePhotoURL"
          v-router-link="{ name: 'Profile', params: user.user }"
        ></app-avatar>
        <div class="cs-textstyle-paragraph-extra-small user-name">
          <app-username
            :user="user.user"
            type="displayname"
            v-router-link="{ name: 'Profile', params: user.user }"
          />
        </div>
      </div>
    </div>
    <div v-else-if="members && members.length < 1">
      <cs-empty-state title="No Attendee in this event" />
    </div>
  </app-modal>
</template>

<script>
import AppModal from '@/components/general/Modal.vue';
import AppAvatar from '@/components/general/Avatar.vue';
import AppUsername from '@/components/general/Username.vue';
import ListMeetingMembers from '@/gql/meetings/ListMeetingMembers.gql';
export default {
  components: {
    AppModal,
    AppAvatar,
    AppUsername,
  },
  apollo: {
    members: {
      query: ListMeetingMembers,
      variables() {
        return {
          meetingId: this.id,
        };
      },
      skip() {
        return !this.show;
      },
    },
  },
  data() {
    return {
      members: [],
    };
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    id: {
      type: String,
    },
  },
};
</script>

<style scoped>
.users {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 10px;
  text-align: center;
  justify-content: space-between;
}
.users::after {
  content: '';
  flex: auto;
}
.user-name {
  font-weight: 500;
  color: var(--cs-gray-06);
  cursor: pointer;
}
</style>
