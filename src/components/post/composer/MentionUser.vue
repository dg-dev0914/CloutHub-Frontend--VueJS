<template>
  <div class="ch-list-container">
    <div class="autocomplete-results" :class="isComment ? 'transform' : ''">
      <div class="autocomplete-results-title">
        <div class="cs-textstyle-detail-heading">Mention User</div>
      </div>
      <div v-if="notBlockedUsers" class="autocomplete-results-list">
        <div
          v-for="user in userList"
          :key="user.id"
          class="autocomplete-result"
          @click="$emit('mention-user', user)"
        >
          <app-avatar
            :picture="user.profilePhotoURL"
            :name="user.displayname"
            class="member-item-avatar"
            size="small"
          />
          <div>
            <div class="cs-textstyle-paragraph-bold">
              <app-username :user="user" type="displayname" />
            </div>
            <div class="ch-textstyle-paragraph-extra-small">
              {{ user.username }}
            </div>
          </div>
        </div>
      </div>
      <cs-empty-state v-else description="No Matching user" />
    </div>
  </div>
</template>

<script>
import AppUsername from '@/components/general/Username.vue';
import AppAvatar from '@/components/general/Avatar.vue';

export default {
  components: {
    AppUsername,
    AppAvatar,
  },
  props: {
    userList: Array,
    isComment: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    notBlockedUsers() {
      return this.userList && this.userList.length;
    },
  },
};
</script>
<style scoped>
.transform {
  transform: translate(0%, -100%);
}
.autocomplete-results {
  position: relative;
  top: 0;
  background: var(--cs-gray-00);
  padding-top: 45px;
  border-radius: 5px;
  box-shadow: 0 3px 9px rgba(0, 0, 0, 0.1);
  min-width: 100px;
  z-index: 1;
  width: content-width;
}
.autocomplete-results-title {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 10px;
  border-bottom: 1px solid var(--cs-gray-02);
}
.autocomplete-results-list {
  padding: 10px;
  max-height: 300px;
  overflow-y: auto;
}
.ch-list-container {
  width: max-content;
  height: 16px;
  background: transparent;
  position: absolute;
}
</style>
