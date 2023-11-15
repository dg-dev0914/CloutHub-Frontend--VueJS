<template>
  <div
    v-if="!user.myRelationship || !user.myRelationship.isBlocked"
    class="request-item"
    @click="viewProfile()"
  >
    <div class="request-item-avatar">
      <app-avatar
        :picture="user.profilePhotoURL"
        :name="user.username"
        class="request-item-avatar"
        size="small"
        @click="viewProfile()"
      ></app-avatar>
    </div>
    <div
      v-if="
        user.myRelationship &&
        (user.myRelationship.friendStatus == 'rsvp' ||
          !user.myRelationship.friendStatus)
      "
      class="cs-textstyle-paragraph-small ml-2"
    >
      <div>
        <span class="cs-textstyle-paragraph-small-bold">
          {{ user.username }}
        </span>
        <span> requested to be friends with you.</span>
      </div>
      <div>
        {{ user.myRelationship.updatedAt | moment('from') }}
      </div>
      <div class="buttons">
        <cs-button size="small" @click.stop="acceptRequest()">Accept</cs-button>
        <cs-button
          fill="outline"
          class="ml-1"
          size="small"
          @click.stop="rejectRequest()"
          >Decline</cs-button
        >
      </div>
    </div>
    <div
      v-if="user.myRelationship && user.myRelationship.friendStatus == 'accept'"
      class="cs-textstyle-paragraph-small ml-2"
    >
      <div>
        <span class="cs-textstyle-paragraph-small-bold">
          {{ user.username }}
        </span>
        <span>is now friends with you.</span>
      </div>
    </div>
    <div
      v-if="!user.myRelationship || user.myRelationship.friendStatus == 'none'"
      class="cs-textstyle-paragraph-small ml-2"
    >
      <div>
        <span class="cs-textstyle-paragraph-small-bold">
          {{ user.username }}
        </span>
        <span> - you declined.</span>
      </div>
    </div>
  </div>
</template>

<script>
import $auth from '@/services/auth';
import AcceptFriendRequest from '@/gql/connections/AcceptFriendRequest.gql';
import CancelFriend from '@/gql/connections/CancelFriend.gql';

import AppAvatar from '@/components/general/Avatar.vue';

export default {
  components: {
    AppAvatar,
  },
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  methods: {
    viewProfile() {
      this.$router.push({ name: 'Profile', params: this.user });
    },
    async acceptRequest() {
      await this.$apollo.mutate({
        mutation: AcceptFriendRequest,
        variables: {
          userId: this.user.id,
        },
        optimisticResponse: {
          accept_friend: {
            id: Date.now(),
            friendStatus: 'accept',
            isFriend: true,
            __typename: 'Relationship',
          },
        },
        update: (cache, mutationResponse) => {
          cache.modify({
            id: cache.identify(this.user),
            fields: {
              myRelationship(existingFieldData, { toReference }) {
                return toReference(
                  cache.identify(mutationResponse.data.accept_friend)
                );
              },
            },
          });

          // Update my connections
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
      this.$toast.open({
        message: 'Friend request accepted',
        type: 'success',
        duration: 1000,
        dismissible: true,
        position: 'top',
      });
    },
    async rejectRequest() {
      await this.$apollo.mutate({
        mutation: CancelFriend,
        variables: {
          userId: this.user.id,
        },
        update: (cache, mutationResponse) => {
          cache.modify({
            id: cache.identify(this.user),
            fields: {
              myRelationship(existingFieldData, { toReference }) {
                return toReference(
                  cache.identify(mutationResponse.data.cancel_friend)
                );
              },
            },
          });
        },
      });
      this.$toast.open({
        message: 'Friend request rejected',
        type: 'error',
        duration: 1000,
        dismissible: true,
        position: 'top',
      });
    },
  },
};
</script>

<style scoped>
.request-item-avatar {
  margin-right: 5px;
}
.request-item {
  display: flex;
  padding: 10px;
  padding-top: 15px;
  padding-bottom: 15px;
  border-bottom: solid 1px var(--cs-gray-01);
}
.buttons {
  display: flex;
  flex-direction: row;
}
.buttons >>> .cs-button:first-child {
  margin-right: 3px;
}
</style>
