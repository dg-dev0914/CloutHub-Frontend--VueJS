<template>
  <div class="group-members-list">
    <div v-for="member in members" :key="member.id" class="member-item">
      <app-avatar
        :picture="member.user.profilePhotoURL"
        :name="member.user.displayname"
        class="member-item__avatar"
        size="small"
        @click="viewMember(member)"
      />
      <div class="member-item__names" @click="viewMember(member)">
        <div class="cs-textstyle-paragraph-bold member-item__name">
          <app-username :user="member.user" type="displayname" />
        </div>
        <div class="ch-textstyle-paragraph-extra-small member-item__username">
          {{ member.user.username }}
        </div>
      </div>
      <app-group-member-menu :group="group" :member="member" />
    </div>
    <app-infinite-offset
      v-if="showInfiniteLoading"
      :query="$apollo.queries.members"
      :limit="10"
    ></app-infinite-offset>
  </div>
</template>

<script>
import ListGroupMembers from '@/gql/groups/ListGroupMembers.gql';
import AppAvatar from '@/components/general/Avatar.vue';
import AppUsername from '@/components/general/Username.vue';
import AppInfiniteOffset from '@/components/general/InfiniteOffset.vue';
import AppGroupMemberMenu from '@/components/groups/detail/GroupMemberMenu.vue';

export default {
  components: {
    AppAvatar,
    AppUsername,
    AppInfiniteOffset,
    AppGroupMemberMenu,
  },
  props: {
    group: {
      type: Object,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    viewAll: {
      type: Boolean,
      default: false,
    },
    searchMemberInput: {
      type: String,
      default: '',
    },
  },
  apollo: {
    members: {
      query: ListGroupMembers,
      variables() {
        return {
          id: this.group.id,
          role: this.role,
          searchMemberInput: this.searchMemberInput,
        };
      },
      result() {
        if (this.members) {
          this.$emit('member-count', this.members.length);
        } else {
          this.$emit('member-count', 0);
        }
      },
      skip() {
        return (
          this.searchMemberInput.length > 0 && this.searchMemberInput.length < 3
        );
      },
    },
  },
  computed: {
    showInfiniteLoading() {
      return this.viewAll && this.searchMemberInput.length === 0;
    },
  },
  methods: {
    viewMember(member) {
      this.$router.push({ name: 'Profile', params: { id: member.user.id } });
    },
  },
};
</script>

<style scoped>
.member-item {
  display: flex;
  align-items: center;
  padding: 10px;
}
.member-item__avatar {
  margin-right: 10px;
  cursor: pointer;
}
.member-item__names {
  flex: 1;
  cursor: pointer;
}
.member-item__name {
  color: var(--cs-gray-06);
}
.member-item__username {
  color: var(--cs-gray-05);
}
</style>
