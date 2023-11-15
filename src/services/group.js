import $popups from '@/services/popups';
import $groupsApi from '@/api/groups';
import $apollo from '@/services/apollo';

import ListGroupMembers from '@/gql/groups/ListGroupMembers.gql';

function getAlertMessage(name) {
  return `You can't leave ${name} with no Admin.  Please make another member Admin before leaving. Or choose to Delete Group instead.`;
}

function getUserGroupRole(group) {
  if (!group || !group.myMembership) return null;
  return group.myMembership.role;
}

function isUserAdminOfGroup(group) {
  return getUserGroupRole(group) === 'admin';
}

async function userCanLeave(group) {
  if (!isUserAdminOfGroup(group)) return true;
  const result = await $apollo.query({
    query: ListGroupMembers,
    variables: {
      id: group.id,
      role: 'admin',
    },
  });

  const admins = result && result.data ? result.data.members : [];

  if (admins.length < 2) {
    $popups.alert(getAlertMessage(group.name));
    return false;
  }

  return true;
}

async function leaveGroup(group) {
  if (await userCanLeave(group)) {
    const confirmLeave = await $popups.confirm({
      title: 'Leave Group',
      message: `Are you sure you want to leave ${group.name}?`,
      variant: 'danger',
      okLabel: 'Leave',
    });
    if (confirmLeave) {
      await $groupsApi.leaveGroup(group);
      return true;
    }
  }

  return false;
}

export default {
  leaveGroup,
  getUserGroupRole,
};
