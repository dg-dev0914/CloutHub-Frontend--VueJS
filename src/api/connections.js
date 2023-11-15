import $apollo from '@/services/apollo';
import $auth from '@/services/auth';
import $videosApi from '@/api/videos';
import $newsApi from '@/api/news';

import BlockUser from '@/gql/connections/BlockUser.gql';
import UnblockUser from '@/gql/connections/UnblockUser.gql';
import ListBlockedUsers from '@/gql/connections/ListBlockedUsers.gql';

import FollowUser from '@/gql/connections/FollowUser.gql';
import UnfollowUser from '@/gql/connections/UnfollowUser.gql';
import ListFollowers from '@/gql/connections/ListFollowers.gql';
import ListFollowing from '@/gql/connections/ListFollowing.gql';

import ListFollowingVideos from '@/gql/videos/ListFollowingVideos.gql';
import ListNewsFollowing from '@/gql/news/ListNewsFollowing.gql';

import SubscribeChannel from '@/gql/connections/SubscribeChannel.gql';
import UnsubscribeChannel from '@/gql/connections/UnsubscribeChannel.gql';

import GetProfile from '@/gql/general/GetProfile.gql';
import GetChannelByUserName from '@/gql/videos/GetChannelByUserName.gql';
import GetChannel from '@/gql/videos/GetChannel.gql';


async function subscribeChannel(user) {
  await $apollo.mutate({
    mutation: SubscribeChannel,
    variables: {
      channelId: user.id,
    },
    refetchQueries: [
      {
        query: GetChannelByUserName,
        variables: { username: user.username },
      },
      {
        query: GetChannel,
        variables: { id: user.id },
      },
    ],
    update: (cache) => {
      cache.modify({
        id: cache.identify(user),
        fields: {
          subscribedToChannel() {
            return true;
          },
        },
      });
    },
  });
}

async function unsubscribeChannel(user) {
  await $apollo.mutate({
    mutation: UnsubscribeChannel,
    variables: {
      channelId: user.id,
    },
    refetchQueries: [
      {
        query: GetChannelByUserName,
        variables: { username: user.username },
      },
      {
        query: GetChannel,
        variables: { id: user.id },
      },
    ],
    update: (cache) => {
      cache.modify({
        id: cache.identify(user),
        fields: {
          subscribedToChannel() {
            return false;
          },
        },
      });
    },
  });
}

async function blockUser(user) {
  await $apollo.mutate({
    mutation: BlockUser,
    variables: {
      userId: user.id,
    },
    update: (cache, mutationResponse) => {
      const query = ListBlockedUsers;
      const queryCache = cache.readQuery({
        query,
      });
      if (queryCache && queryCache.people) {
        cache.writeQuery({
          query,
          data: {
            people: [user, ...queryCache.people],
          },
        });
      }
      cache.modify({
        id: cache.identify(user),
        fields: {
          myRelationship(existingFieldData, { toReference }) {
            return toReference(
              cache.identify(mutationResponse.data.block_user)
            );
          },
        },
      });
    },
  });
}

async function unblockUser(user) {
  await $apollo.mutate({
    mutation: UnblockUser,
    variables: {
      userId: user.id,
    },
    update: (cache, mutationResponse) => {
      const query = ListBlockedUsers;
      const queryCache = cache.readQuery({
        query,
      });
      if (queryCache && queryCache.people) {
        cache.writeQuery({
          query,
          data: {
            people: queryCache.people.filter((p) => p.id !== user.id),
          },
        });
      }
      cache.modify({
        id: cache.identify(user),
        fields: {
          myRelationship(existingFieldData, { toReference }) {
            return toReference(
              cache.identify(mutationResponse.data.unblock_user)
            );
          },
        },
      });
    },
  });
}

const followUser = async (target) => {
  const me = await $auth.getUser();
  $apollo.mutate({
    mutation: FollowUser,
    variables: {
      userId: target.id,
    },
    refetchQueries: [
      { query: ListFollowingVideos },
      { query: ListNewsFollowing },
      {
        query: GetProfile,
        variables: {
          id: me.id,
        },
      },
      { query: ListFollowers },
    ],
    optimisticResponse: {
      follow_user: {
        id: `temp.${Date.now()}`,
        __typename: 'Relationship',
        isFollower: true,
        isFollowing: true,
        isFriend: target.myRelationship.isFriend,
        isBlocked: target.myRelationship.isBlocked,
        friendStatus: target.myRelationship.friendStatus,
        updatedAt: new Date(),
      },
    },
    update: async (cache, mutationResponse) => {
      // Update relationship
      const currentRelationship = { ...target.myRelationship };
      cache.modify({
        id: cache.identify(target),
        fields: {
          myRelationship(existingFieldData, { toReference }) {
            if (currentRelationship) {
              currentRelationship.isFollower = true;
              return currentRelationship;
            }
            return toReference(
              cache.identify(mutationResponse.data.follow_user)
            );
          },
        },
      });

      $videosApi.followChannelCacheUpdate(target, cache, mutationResponse);
      $newsApi.followNewsCacheUpdate(target, cache, mutationResponse);
    },
  });
};

const unfollowUser = async (target) =>
  $apollo.mutate({
    mutation: UnfollowUser,
    variables: {
      userId: target.id,
    },
    refetchQueries: [
      { query: ListFollowingVideos },
      { query: ListNewsFollowing },
      { query: ListFollowers },
      { query: ListFollowing },
    ],
    optimisticResponse: {
      unfollow_user: true,
    },
    update: async (cache, mutationResponse) => {
      // Update the relationship
      const currentRelationship = { ...target.myRelationship };
      cache.modify({
        id: cache.identify(target),
        fields: {
          myRelationship() {
            currentRelationship.isFollower = false;
            return currentRelationship;
          },
        },
      });
      $videosApi.unfollowChannelCacheUpdate(target, cache, mutationResponse);
      $newsApi.unfollowNewsCacheUpdate(target, cache, mutationResponse);
    },
  });

export default {
  blockUser,
  unblockUser,
  followUser,
  unfollowUser,
  subscribeChannel,
  unsubscribeChannel,
};
