<template>
  <div class="ch-profile__card">
    <div class="p-3">
      <div class="cs-textstyle-paragraph">
        Enter one or more email addresses to invite:
      </div>
      <cs-input class="email-input" placeholder="e.g. jane@gmail.com" @keydown.native.enter="addEmail()"
        v-model="emailInput"
      ></cs-input>
      <div class="" v-for="email in emails">
        {{email}}
      </div>
    </div>
  </div>
</template>

<script>
import ListMyGroups from '@/gql/groups/ListMyGroups.gql';
import AppGroupList from '@/components/meetings/invitemodal/MeetingGroupList.vue';
import AppSpinner from '@/components/general/Spinner.vue';

export default {
  components: {
    AppGroupList,
    AppSpinner,
  },
  props: {
    meeting: Object,
  },
  apollo: {
    groups: {
      query: ListMyGroups,
    },
  },
  computed: {
    displayGroups() {
      return this.groups && this.groups.filter((g) => {
        return g.myMembership.role == 'admin' || g.myMembership.role == 'moderator';
      });
    },
  },
  methods: {
    addEmail() {
      this.emails.push(this.emailInput);
      this.emailInput = '';
    },
  },
  data() {
    return {
      mayHaveMore: true,
      emailInput: '',
      emails: [],
    };
  },
};
</script>
<style>
  .email-input
  {
    width: 100%;
  }
</style>
