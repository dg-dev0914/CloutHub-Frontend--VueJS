<template>
  <div class="blocked-user-profile">
    <app-avatar
      v-if="!user.myRelationship.blockedIn"
      :picture="user.profilePhotoURL"
      :name="user.displayname"
      variant="primary"
      size="large"
      class="mb-4"
    />
    <template v-if="user.myRelationship.blockedOut">
      <h2>You have blocked <app-username :user="user" /></h2>
      <p>
        You won't see posts, messages, and requests from {{ user.username }}.
      </p>
      <div>
        <cs-button class="unblock-button" @click="unblock()">Unblock</cs-button>
        <cs-button
          v-router-link="{ name: 'Settings' }"
          fill="outline"
          class="cursor-pointer"
          >Manage Settings</cs-button
        >
      </div>
    </template>
    <template v-else>
      <h2>You have blocked <app-username :user="user" /></h2>
      <p>
        You won't see posts, messages, and requests from {{ user.username }}.
      </p>
      <div>
        <cs-button class="unblock-button" @click="unblock()">Unblock</cs-button>
        <cs-button
          v-router-link="{ name: 'Settings' }"
          fill="outline"
          class="cursor-pointer"
          >Manage Settings</cs-button
        >
      </div>
    </template>
  </div>
</template>

<script>
import $relationships from '@/api/connections';
import AppAvatar from '@/components/general/Avatar.vue';
import AppUsername from '@/components/general/Username.vue';

export default {
  components: {
    AppAvatar,
    AppUsername,
  },
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  methods: {
    async unblock() {
      $relationships.unblockUser(this.user);
      this.$emit('unblock');
    },
  },
};
</script>

<style>
.blocked-user-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 65vh;
  --cs-card-margin-x: 0px;
  box-shadow: 0px 3px 6px #0000000d;
  border: none;
  background-color: var(--cs-gray-00);
  border-radius: var(--cs-card-border-radius);
}
.blocked-user-profile h2 {
  font-size: var(--cs-font-size-200);
  color: var(--cs-gray-06);
  font-weight: var(--cs-font-weight-bold);
}
.blocked-user-profile p {
  font-size: var(--cs-font-size-100);
  color: var(--cs-gray-05);
  margin: 10px 0px 20px 0px;
}
.unblock-button {
  margin-right: 20px;
}
</style>
