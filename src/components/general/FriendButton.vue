<template>
  <div class="friend-button">
    <cs-button
      v-if="status == 'accept'"
      v-b-tooltip.hover.right
      :size="size"
      variant="secondary"
      fill="outline"
      :title="unfriendTip"
      @click="unfriend()"
      >Unfriend</cs-button
    >
    <cs-button
      v-if="status == 'none' || status == 'rejected'"
      v-b-tooltip.hover.right.ds100
      :size="size"
      :title="requestTip"
      @click="requestFriend()"
      >Add Friend</cs-button
    >
    <cs-button
      v-if="status == 'pending'"
      id="sent-tooltip"
      ref="pendingButton"
      v-b-tooltip.hover.right.ds101
      :size="size"
      variant="secondary"
      fill="outline"
      :title="pendingTip"
      @click="hideSentToolTip"
      >Sent</cs-button
    >
    <cs-button
      v-if="status == 'rsvp'"
      id="rsvp-tooltip"
      ref="rsvpButton"
      v-b-tooltip.hover
      :size="size"
      variant="secondary"
      fill="outline"
      :title="'Respond to ' + target.username + `'s friend request`"
      @click="hideToolTip"
      >RSVP</cs-button
    >
    <b-popover
      v-if="$refs.pendingButton"
      ref="pendingMenu"
      :target="$refs.pendingButton"
      placement="bottomright"
      triggers="click blur"
    >
      <app-context-menu-item
        @click="
          cancelFriend();
          $refs.pendingMenu.$emit('close');
        "
        >Cancel Request</app-context-menu-item
      >
    </b-popover>
    <b-popover
      v-if="$refs.rsvpButton"
      ref="rsvpMenu"
      :target="$refs.rsvpButton"
      placement="bottomright"
      triggers="click blur"
    >
      <div>
        <app-context-menu-item
          @click="
            acceptFriend();
            $refs.rsvpMenu.$emit('close');
          "
          >Accept Request</app-context-menu-item
        >
        <app-context-menu-item
          @click="
            cancelFriend();
            $refs.rsvpMenu.$emit('close');
          "
          >Reject Request</app-context-menu-item
        >
      </div>
    </b-popover>
  </div>
</template>
<script>
import $auth from '@/services/auth';
import $popups from '@/services/popups';
import $bus from '@/services/bus';
import InsertFriendRequest from '@/gql/connections/InsertFriendRequest.gql';
import AcceptFriendRequest from '@/gql/connections/AcceptFriendRequest.gql';
import Unfriend from '@/gql/connections/Unfriend.gql';
import CancelFriend from '@/gql/connections/CancelFriend.gql';
import AppContextMenuItem from '@/components/general/ContextMenuItem.vue';
import GetProfile from '@/gql/general/GetProfile.gql';

export default {
  components: {
    AppContextMenuItem,
  },
  props: {
    size: {
      type: String,
      default: 'medium',
    },
    target: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {};
  },
  computed: {
    status() {
      return (
        (this.target.myRelationship &&
          this.target.myRelationship.friendStatus) ||
        'none'
      );
    },
    unfriendTip() {
      return `Unfriend ${this.target.username} to stop sharing private content`;
    },
    requestTip() {
      return `Friend ${this.target.username} to share private content`;
    },
    pendingTip() {
      return `Your friendship request with ${this.target.username} is pending`;
    },
  },
  methods: {
    hideToolTip() {
      this.$root.$emit('bv::hide::tooltip', 'rsvp-tooltip');
    },
    hideSentToolTip() {
      this.$root.$emit('bv::hide::tooltip', 'sent-tooltip');
    },
    // Used to terminate an existing friendship
    async unfriend() {
      const confirmUnfriend = await $popups.confirm({
        title: 'Please Confirm',
        message: `Are you sure you wish to unfriend ${this.target.username}?`,
        okLabel: 'Unfriend',
        variant: 'danger',
      });
      if (!confirmUnfriend) return;
      await this.$apollo.mutate({
        mutation: Unfriend,
        variables: {
          userId: this.target.id,
        },
        optimisticResponse: {
          end_friend: {
            id: `temp.${Date.now()}`,
            __typename: 'Relationship',
            isFriend: false,
            friendStatus: 'none',
          },
        },
        update: async (cache, mutationResponse) => {
          // Update relationship
          const currentRelationship = { ...this.target.myRelationship };
          cache.modify({
            id: cache.identify(this.target),
            fields: {
              myRelationship(existingFieldData, { toReference }) {
                if (currentRelationship) {
                  currentRelationship.isFriend = false;
                  currentRelationship.friendStatus = 'none';
                  return currentRelationship;
                }
                return toReference(
                  cache.identify(mutationResponse.data.end_friend)
                );
              },
            },
          });

          // Update user's connections
          cache.modify({
            id: cache.identify({ __typename: 'User', id: $auth.getUserId() }),
            fields: {
              friendCount(existingFieldData = 1) {
                return existingFieldData - 1;
              },
            },
          });
          const me = await $auth.getUser();
          cache.writeQuery({
            query: GetProfile,
            variables: {
              id: me.id,
            },
            data: {
              user: { ...me, friendCount: me.friendCount - 1 },
            },
          });
        },
      });
      this.$emit('changed-friend');
      $bus.$emit('friendcount-refresh');
    },
    async requestFriend() {
      await this.$apollo.mutate({
        mutation: InsertFriendRequest,
        variables: {
          userId: this.target.id,
        },
        optimisticResponse: {
          request_friend: {
            id: `temp.${Date.now()}`,
            __typename: 'Relationship',
            isFriend: false,
            friendStatus: 'pending',
          },
        },
        update: (cache, mutationResponse) => {
          const currentRelationship = { ...this.target.myRelationship };
          cache.modify({
            id: cache.identify(this.target),
            fields: {
              myRelationship(existingFieldData, { toReference }) {
                if (currentRelationship) {
                  currentRelationship.friendStatus = 'pending';
                  return currentRelationship;
                }
                return toReference(
                  cache.identify(mutationResponse.data.request_friend)
                );
              },
            },
          });
        },
      });
      this.$emit('changed-friend');
    },
    async acceptFriend() {
      await this.$apollo.mutate({
        mutation: AcceptFriendRequest,
        variables: {
          userId: this.target.id,
        },
        optimisticResponse: {
          accept_friend: {
            id: `temp.${Date.now()}`,
            __typename: 'Relationship',
            isFriend: true,
            friendStatus: 'accept',
          },
        },
        update: (cache, mutationResponse) => {
          // Update friendship
          const currentRelationship = { ...this.target.myRelationship };
          cache.modify({
            id: cache.identify(this.target),
            fields: {
              myRelationship(existingFieldData, { toReference }) {
                if (currentRelationship) {
                  currentRelationship.isFriend = true;
                  currentRelationship.friendStatus = 'accept';
                  return currentRelationship;
                }
                return toReference(
                  cache.identify(mutationResponse.data.accept_friend)
                );
              },
            },
          });

          // Update user connections
          cache.modify({
            id: cache.identify({ __typename: 'User', id: $auth.getUserId() }),
            fields: {
              friendCount(existingFieldData = 1) {
                return existingFieldData + 1;
              },
            },
          });
        },
      });
    },
    async cancelFriend() {
      const confirmCancel = await $popups.confirm({
        title: 'Please Confirm',
        message:
          'Are you sure you wish to reject/withdraw this friend request?',
        okLabel: 'Yes',
        variant: 'danger',
      });
      if (!confirmCancel) return;
      await this.$apollo.mutate({
        mutation: CancelFriend,
        variables: {
          userId: this.target.id,
        },
        optimisticResponse: {
          end_friend: {
            id: `temp.${Date.now()}`,
            __typename: 'Relationship',
            isFriend: false,
            friendStatus: 'none',
          },
        },
        update: (cache, mutationResponse) => {
          // Update relationship
          const currentRelationship = { ...this.target.myRelationship };
          cache.modify({
            id: cache.identify(this.target),
            fields: {
              myRelationship(existingFieldData, { toReference }) {
                if (currentRelationship) {
                  currentRelationship.isFriend = false;
                  currentRelationship.friendStatus = 'none';
                  return currentRelationship;
                }
                return toReference(
                  cache.identify(mutationResponse.data.end_friend)
                );
              },
            },
          });
          // No need to update user's connections since it wasn't a relationship to start with
        },
      });
      this.$emit('changed-friend');
    },
  },
};
</script>
<style scoped>
.friend-button .cs-button {
  margin-left: 10px;
}
</style>
