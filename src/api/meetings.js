import $apollo from '@/services/apollo';

import SetLeaders from '@/gql/meetings/SetLeaders.gql';
import SetMeetingMemberRole from '@/gql/meetings/SetMeetingMemberRole.gql';
import Signup from '@/gql/meetings/Signup.gql';
import UnSignup from '@/gql/meetings/UnSignup.gql';
import DeleteMeetingReferralCode from '@/gql/meetings/DeleteMeetingReferralCode.gql';

const setLeaders = (meetingId, { presenters, moderators, admins }) =>
  $apollo.mutate({
    mutation: SetLeaders,
    variables: {
      meetingId,
      presenters,
      moderators,
      admins,
    },
    optimisticResponse: {
      set_leaders: true,
    },
    // TODO update cache lists?
  });

const setRole = (meetingId, userId, role) =>
  $apollo.mutate({
    mutation: SetMeetingMemberRole,
    variables: {
      meetingId,
      userId,
      role,
    },
  });

const signup = async (meeting) => {
  const result = await $apollo.mutate({
    mutation: Signup,
    variables: {
      meetingId: meeting.id,
    },
    optimisticResponse: {
      meeting_signup: {
        id: `temp.${Date.now()}`,
        __typename: 'MeetingMember',
        role: 'ATTENDING',
      },
    },
    update: (cache, mutationResponse) => {
      cache.modify({
        id: cache.identify(meeting),
        fields: {
          myMembership(existingFieldData, { toReference }) {
            return toReference(
              cache.identify(mutationResponse.data.meeting_signup)
            );
          },
        },
      });
    },
  });
  return result;
};

const unsignup = async (meeting) => {
  const result = await $apollo.mutate({
    mutation: UnSignup,
    variables: {
      meetingId: meeting.id,
    },
    optimisticResponse: {
      meeting_unsignup: true,
    },
    update: (cache, mutationResponse) => {
      cache.modify({
        id: cache.identify(meeting),
        fields: {
          myMembership() {
            return null;
          },
        },
      });
    },
  });
  return result;
};

const deleteReferralCode = async (id, meeting) =>
  $apollo.mutate({
    mutation: DeleteMeetingReferralCode,
    variables: {
      id,
    },
    update: (cache) => {
      cache.modify({
        id: cache.identify(meeting),
        fields: {
          referralCodes: (existingFieldData) =>
            existingFieldData.filter(({ __ref }) => __ref.split(':')[1] !== id),
        },
      });
    },
  });

export default {
  setLeaders,
  setRole,
  signup,
  unsignup,
  deleteReferralCode,
};
