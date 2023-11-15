<template>
  <div v-if="users" class="user-list">
    <template v-for="person in users">
      <div
        v-if="!person.myRelationship.isBlocked"
        :key="person.id"
        class="user-list-person"
      >
        <app-avatar
          class="user-list-person-avatar"
          size="small"
          :picture="
            person.user ? person.user.profilePhotoURL : person.profilePhotoURL
          "
          :name="person.user ? person.user.displayname : person.displayname"
          @click="viewUser(person)"
        />
        <div class="user-list-person-names" @click="viewUser(person)">
          <div class="cs-textstyle-paragraph-bold">
            <app-username :user="personInfo(person)" type="displayname" />
          </div>
          <div class="cs-textstyle-paragraph-small">
            {{ person.user ? person.user.username : person.username }}
          </div>
        </div>
        <app-follow-button
          v-if="loggedUserId !== person.id"
          :target="person"
          size="small"
        />
        <app-friend-button
          v-if="loggedUserId !== person.id"
          :target="person"
          size="small"
        />
      </div>
    </template>
    <cs-empty-state v-if="users.length === 0" description="No Matching Users" />
  </div>
</template>
<script>
import $auth from '@/services/auth';
import AppFollowButton from '@/components/general/FollowButton.vue';
import AppFriendButton from '@/components/general/FriendButton.vue';
import AppAvatar from '@/components/general/Avatar.vue';
import AppUsername from '@/components/general/Username.vue';

export default {
  components: {
    AppFollowButton,
    AppFriendButton,
    AppAvatar,
    AppUsername,
  },
  props: {
    users: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      query: '',
      loggedUserId: $auth.getUserId(),
    };
  },
  methods: {
    viewUser(person) {
      this.$router.push({
        name: 'Profile',
        params: { id: person.id, tab: 'posts' },
      });
      this.$emit('onClose');
    },
    follow(person, index) {
      person.isFollower = true;
      this.friends.splice(index, 1, person);
    },
    unfollow(person, index) {
      person.isFollower = false;
      this.friends.splice(index, 1, person);
    },
    async unfriend(person, index) {
      person.friendStatus = 'none';
      this.friends.splice(index, 1);
    },
    personInfo(person) {
      if (person.user) {
        return person.user;
      }
      return person;
    },
  },
};
</script>

<style lang="css" scoped>
.user-list {
  padding: 15px;
}
.user-list-search-bar {
  margin-bottom: 10px;
}
.user-list-person {
  display: flex;
  align-items: center;
  padding: 10px 0;
}
.user-list-person-avatar,
.user-list-person-names {
  cursor: pointer;
}
.user-list-person-names {
  flex: 1;
  margin-left: 10px;
  margin-right: 10px;
}
</style>
