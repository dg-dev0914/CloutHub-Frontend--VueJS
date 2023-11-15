<template>
  <b-col class="ch-profile-tab-posts">
    <div class="ch-profile__card ch-connection-box">
      <div class="title cs-textstyle-paragraph-bold">Mutual Interests</div>
      <div class="ch-mutual-list-box">
        <div class="interest">
          Local Interests:
          <span v-if="noCommonLocalInterests" class="cs-gray-04">
            Nothing in common
          </span>
          <cs-tag
            v-for="(interest, $index) in user.mutual_local_interests"
            v-else
            :key="interest + $index"
          >
            <span>{{ interest }}</span>
          </cs-tag>
        </div>
        <div class="interest">
          National Interests:
          <span v-if="noCommonNationalInterests" class="cs-gray-04">
            Nothing in common
          </span>
          <cs-tag
            v-for="(interest, $index) in user.mutual_national_interests"
            v-else
            :key="interest + $index"
          >
            <span>{{ interest }}</span>
          </cs-tag>
        </div>
      </div>
    </div>
    <div class="ch-profile__card ch-connection-box">
      <div class="title cs-textstyle-paragraph-bold">You both follow</div>
      <div class="ch-mutual-list-box">
        <app-user-list :users="user.mutual_followers"></app-user-list>
      </div>
    </div>

    <div class="ch-profile__card">
      <div class="title cs-textstyle-paragraph-bold">Follows you both</div>
      <div class="ch-mutual-list-box">
        <app-user-list :users="user.mutual_following"></app-user-list>
      </div>
    </div>

    <div class="ch-profile__card ch-connection-box">
      <div class="title cs-textstyle-paragraph-bold">Mutual Friends</div>
      <div class="ch-mutual-list-box">
        <app-user-list :users="user.mutual_friends"></app-user-list>
      </div>
    </div>
  </b-col>
</template>

<script>
import AppUserList from '@/components/general/UserList.vue';

export default {
  components: {
    AppUserList,
  },
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  computed: {
    noCommonLocalInterests() {
      return (
        this.user.mutual_local_interests ||
        this.user.mutual_local_interests.length < 1
      );
    },
    noCommonNationalInterests() {
      return (
        this.user.mutual_national_interests ||
        this.user.mutual_national_interests.length < 1
      );
    },
  },
};
</script>

<style scoped>
.title {
  text-align: center;
  padding-top: 11px;
}
.ch-mutual-list-box {
  max-height: 400px;
  min-height: 50px;
}
.interest {
  padding: 30px;
}
</style>
