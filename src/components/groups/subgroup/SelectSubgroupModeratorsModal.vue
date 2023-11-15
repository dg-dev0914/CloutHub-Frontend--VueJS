<template lang="html">
  <app-form-modal
    :show="show"
    title="Update Subgroup"
    :saving="saving"
    @close="close"
  >
    <app-successfully-created-card :group-name="group.name" />
    <app-group-user-select
      ref="adminList"
      v-model="chosenAdmins"
      label="Add Admin(s). You're already an admin of this group"
      :users="users"
      :disabled-items="chosenModerators"
      disabled-label="(moderator)"
      @opening="$refs.moderatorList.closeList()"
    />
    <br />
    <app-group-user-select
      ref="moderatorList"
      v-model="chosenModerators"
      label="Add Moderators"
      :users="users"
      :disabled-items="chosenAdmins"
      disabled-label="(admin)"
      @opening="$refs.adminList.closeList()"
    />
    <br />
    <div slot="footer" class="group-editor-modal__button-holder">
      <cs-button size="small" @click="updateMods"> Update </cs-button>
    </div>
  </app-form-modal>
</template>

<script>
import $auth from '@/services/auth';
import $popups from '@/services/popups';

// GQL
import SetGroupAdmins from '@/gql/groups/SetGroupAdmins.gql';
import ListGroupMembers from '@/gql/groups/ListGroupMembers.gql';
import ListFriends from '@/gql/connections/ListFriends.gql';
import ListFollowing from '@/gql/connections/ListFollowing.gql';
import ListFollowers from '@/gql/connections/ListFollowers.gql';

// General components
import AppFormModal from '@/components/general/FormModal.vue';

// Group general components
import AppGroupUserSelect from '@/components/groups/GroupUserSelect.vue';

// Group subgroup components
import AppSuccessfullyCreatedCard from '@/components/groups/subgroup/SuccessfullyCreatedCard.vue';

export default {
  components: {
    AppFormModal,
    AppSuccessfullyCreatedCard,
    AppGroupUserSelect,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    group: {
      type: Object,
      default() {
        return { privacy: 'public' };
      },
    },
    parentGroupId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      saving: false,
      chosenAdmins: [],
      chosenModerators: [],
      admins: [],
      moderators: [],
      members: [],
      friends: [],
      following: [],
      followers: [],
    };
  },
  computed: {
    users() {
      const users = [
        ...new Set([
          ...this.admins,
          ...this.moderators,
          ...this.members,
          ...this.friends,
          ...this.following,
          ...this.followers,
        ]),
      ];
      return users.filter((user) => user.id !== this.id);
    },
    id() {
      return $auth.getUserId();
    },
  },
  watch: {
    show() {
      this.chosenAdmins = [];
      this.chosenModerators = [];
    },
  },
  apollo: {
    admins: {
      query: ListGroupMembers,
      variables() {
        return {
          id: this.group.id,
          role: 'admin',
        };
      },
      skip() {
        return !this.group.id;
      },
      update: (data) => data.members.map((member) => member.user),
    },
    moderators: {
      query: ListGroupMembers,
      variables() {
        return {
          id: this.group.id,
          role: 'moderators',
        };
      },
      skip() {
        return !this.group.id;
      },
      update: (data) => data.members.map((member) => member.user),
    },
    members: {
      query: ListGroupMembers,
      variables() {
        return {
          id: this.group.id,
          role: 'members',
        };
      },
      skip() {
        return !this.group.id;
      },
      update: (data) => data.members.map((member) => member.user),
    },
    friends: {
      query: ListFriends,
      update: (data) => data.people,
    },
    following: {
      query: ListFollowing,
      update: (data) => data.people,
    },
    followers: {
      query: ListFollowers,
      update: (data) => data.people,
    },
  },
  methods: {
    updateMods() {
      if (
        this.chosenAdmins.length === 0 &&
        this.chosenModerators.length === 0
      ) {
        this.close();
        return;
      }
      const variables = {
        admins: this.chosenAdmins.map((user) => user.id),
        moderators: this.chosenModerators.map((user) => user.id),
        groupId: this.group.id,
      };
      const memberCount =
        variables.admins.length + variables.moderators.length + 1;
      this.$apollo
        .mutate({
          mutation: SetGroupAdmins,
          variables,
          update: async (cache) => {
            cache.modify({
              id: cache.identify(this.group),
              fields: {
                memberCount: () => memberCount,
              },
            });

            const adminVars = {
              id: variables.groupId,
              role: 'admin',
            };
            const queryCache = cache.readQuery({
              query: ListGroupMembers,
              variables: adminVars,
            });
            if (queryCache && queryCache.members) {
              cache.writeQuery({
                query: ListGroupMembers,
                variables: adminVars,
                data: {
                  members: queryCache.members.concat(...this.chosenAdmins),
                },
              });
            }
          },
        })
        .then(() => this.close())
        .then(() => {
          this.$toast.open({
            message: 'Group succesfully updated',
            type: 'success',
            duration: 1000,
            dismissible: true,
            position: 'top',
          });
        })
        .catch((err) => {
          $popups.alert(err.message);
        });
      this.close();
    },
    close() {
      this.$emit('close');
    },
  },
};
</script>

<style lang="css" scoped>
.group-editor-modal__button-holder {
  text-align: right;
}
</style>
