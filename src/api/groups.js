// All these functions help to clean up and standardize some mutations used
// And then update the caches of items

import $apollo from '@/services/apollo';

import CreateGroup from '@/gql/groups/CreateGroup.gql';
import UpdateGroup from '@/gql/groups/UpdateGroup.gql';
import DeleteGroup from '@/gql/groups/DeleteGroup.gql';
import GroupBannerFragment from '@/gql/fragments/GroupBanner.gql';

import ListMyGroups from '@/gql/groups/ListMyGroups.gql';
import ListJoinedGroups from '@/gql/groups/ListJoinedGroups.gql';
import ListManagedGroups from '@/gql/groups/ListManagedGroups.gql';

import JoinGroup from '@/gql/groups/JoinGroup.gql';
import LeaveGroup from '@/gql/groups/LeaveGroup.gql';

import ListGroupMembers from '@/gql/groups/ListGroupMembers.gql';

import UpdateGroupMember from '@/gql/groups/UpdateGroupMember.gql';
import RemoveGroupMember from '@/gql/groups/RemoveGroupMember.gql';
import ListSubgroupsByGroupId from '@/gql/groups/ListSubgroupsByGroupId.gql';

import ListMyGroupsPosts from '@/gql/posts/ListMyGroupsPosts.gql';

import { uuidv4 } from '@/services/utils';

const createGroup = async (group) =>
  $apollo.mutate({
    mutation: CreateGroup,
    variables: {
      ...group,
    },
    optimisticResponse: {
      create_group: {
        id: 'temp',
        ...group,
        parentGroupId: 'temp',
        myMembership: {
          id: 'tempmember',
          role: 'admin',
          notificationsType: 'FRIENDS_AND_FOLLOWERS',
          createdAt: new Date().toISOString(),
        },
        __typename: 'Group',
      },
    },
    update: (cache, mutationResponse) => {
      const updateLists = [ListMyGroups, ListManagedGroups];
      updateLists.forEach((query) => {
        const variables = {};
        const queryCache = cache.readQuery({
          query,
          variables,
        });
        if (queryCache && queryCache.groups) {
          cache.writeQuery({
            query,
            variables,
            data: {
              groups: [
                mutationResponse.data.create_group,
                ...queryCache.groups,
              ],
            },
          });
        }
      });
      const newGroup = mutationResponse.data.create_group;
      const parentId = newGroup.parentGroupId;
      if (parentId) {
        const res = cache.readQuery({
          query: ListSubgroupsByGroupId,
          variables: {
            // Provide any required variables here
            parentGroupId: parentId,
          },
        });
        cache.writeQuery({
          query: ListSubgroupsByGroupId,
          variables: {
            parentGroupId: parentId,
          },
          data: {
            groups: [
              ...res.groups,
              { ...newGroup, myMembership: { id: 'xx', role: 'admin' } },
            ],
          },
        });
      }
    },
  });

const updateGroup = async (id, group) =>
  $apollo.mutate({
    mutation: UpdateGroup,
    variables: {
      id,
      ...group,
    },
    optimisticResponse: {
      update_group: {
        __typename: 'Group',
        id,
        ...group,
      },
    },
    update: (cache) => {
      cache.writeFragment({
        id: cache.identify(group),
        fragment: GroupBannerFragment,
        data: {
          banner: group.banner,
        },
      });
    },
  });

const deleteGroup = async (group) =>
  $apollo.mutate({
    mutation: DeleteGroup,
    variables: {
      id: group.id,
    },
    update: (cache) => {
      const normalizedId = cache.identify(group);
      if (normalizedId) {
        cache.evict({ id: normalizedId });
        cache.gc();
      }
    },
  });

const joinGroup = async (group) =>
  $apollo.mutate({
    mutation: JoinGroup,
    variables: {
      groupId: group.id,
    },
    optimisticResponse: {
      join_group: {
        id: uuidv4(),
        role: group.privacy === 'public' ? 'member' : 'pending-member',
        notificationsType: 'FRIENDS_AND_FOLLOWERS',
        createdAt: new Date().toISOString(),
        __typename: 'GroupMembership',
      },
    },
    refetchQueries: [{ query: ListMyGroupsPosts }],
    update: (cache, mutationResponse) => {
      cache.modify({
        id: cache.identify(group),
        fields: {
          myMembership(existingFieldData, { toReference }) {
            return toReference(
              cache.identify(mutationResponse.data.join_group)
            );
          },
          memberCount(existingFieldData) {
            return existingFieldData + 1;
          },
        },
      });
    },
  });

const leaveGroup = async (group) =>
  $apollo.mutate({
    mutation: LeaveGroup,
    variables: {
      groupId: group.id,
    },
    optimisticResponse: {
      leave_group: true,
    },
    refetchQueries: [
      { query: ListJoinedGroups },
      { query: ListMyGroups },
      { query: ListMyGroupsPosts },
    ],
    update: (cache) => {
      cache.modify({
        id: cache.identify(group),
        fields: {
          myMembership() {
            return null;
          },
          memberCount(existingFieldData) {
            return existingFieldData - 1;
          },
        },
      });
    },
  });

const _removeMemberFromCache = (group, member, cache) => {
  const variables = {
    id: group.id,
    role: member.role,
  };
  const queryCache = cache.readQuery({
    query: ListGroupMembers,
    variables,
  });
  if (queryCache && queryCache.members) {
    cache.writeQuery({
      query: ListGroupMembers,
      variables,
      data: {
        members: queryCache.members.filter((m) => m.user.id !== member.user.id),
      },
    });
  }
};

const updateMember = async (group, member, role) =>
  $apollo.mutate({
    mutation: UpdateGroupMember,
    variables: {
      groupId: group.id,
      userId: member.user.id,
      role,
    },
    optimisticResponse: {
      update_group_member_role: {
        id: '123412341234',
        role,
        __typename: 'GroupMembership',
      },
    },
    update: (cache, mutationResponse) => {
      // Update old member list (remove member)
      _removeMemberFromCache(group, member, cache);
      // Update new member list (add member)
      const variables = {
        id: group.id,
        role,
      };
      const queryCache = cache.readQuery({
        query: ListGroupMembers,
        variables,
      });
      if (queryCache && queryCache.members) {
        cache.writeQuery({
          query: ListGroupMembers,
          variables,
          data: {
            members: [
              mutationResponse.data.update_group_member_role,
              ...queryCache.members,
            ],
          },
        });
      }
    },
  });

const removeMember = async (group, member) =>
  $apollo.mutate({
    mutation: RemoveGroupMember,
    variables: {
      groupId: group.id,
      userId: member.user.id,
    },
    update: (cache) => {
      // Update old member list (remove member)
      _removeMemberFromCache(group, member, cache);
    },
  });

export default {
  createGroup,
  updateGroup,
  deleteGroup,
  joinGroup,
  leaveGroup,
  updateMember,
  removeMember,
};
