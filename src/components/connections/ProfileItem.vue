<template>
  <div>
    <div v-if="user" class="separateItems">
      <div>
        <app-avatar
          :picture="user.profilePhotoURL"
          :name="name"
          variant="primary"
          size="small"
        ></app-avatar>
      </div>
      <div class="ml-2 pb-2">
        <div class="cs-textstyle-paragraph-bold">{{ name }}</div>
        <div class="usernameText">
          <app-username :user="user" type="username" />
        </div>
      </div>
    </div>
    <div class="bodyClass">
      <app-spinner v-if="!user"></app-spinner>
      <div v-else class="separateItems">
        <div class="itemCol">
          <div
            v-router-link="{ name: 'Profile', params: { id: user.id } }"
            class="itemRow grayText cursor-pointer"
          >
            <i class="ch-icons-user mr-2"></i>
            View Profile
          </div>
          <div
            v-router-link="{ name: 'settings' }"
            class="itemRow grayText mt-2 cursor-pointer"
          >
            <i class="cs-icons-settings mr-2"></i>
            Settings
          </div>
          <div class="itemRow grayText mt-2 mb-2" @click="logout">
            <i class="ch-icons-logout mr-2"></i>
            Sign Out
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import $auth from '@/services/auth';
import AppAvatar from '@/components/general/Avatar.vue';
import AppSpinner from '@/components/general/Spinner.vue';
import AppUsername from '@/components/general/Username.vue';

export default {
  components: {
    AppAvatar,
    AppSpinner,
    AppUsername,
  },
  data() {
    return {
      user: null,
    };
  },
  computed: {
    name() {
      return `${this.user.firstname} ${this.user.lastname}`;
    },
  },
  async mounted() {
    this.user = await $auth.getUser();
  },
  methods: {
    logout() {
      $auth.logout();
      this.$router.push({ name: 'Login' });
    },
  },
};
</script>

<style scoped>
.bodyClass {
  border-top: 1px solid #f7faff;
  padding: 0 12px;
  margin: 0 -12px;
  padding-top: 5px;
}
.separateItems {
  display: flex;
  justify-content: space-between;
}
.itemRow {
  display: flex;
  flex-direction: row;
}
.itemRow:hover {
  color: #000;
  font-weight: 500;
}
.itemCol {
  display: flex;
  flex-direction: column;
  margin-left: 4px;
}
.usernameText {
  color: #47535a;
  font-size: 14px;
  margin-top: -5px;
}
.grayText {
  color: #47535a;
  cursor: pointer;
}
</style>
