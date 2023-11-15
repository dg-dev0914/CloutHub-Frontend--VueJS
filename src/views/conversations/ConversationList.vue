<template>
  <b-container fluid="xl">
    <b-row>
      <b-col lg="9">
        <b-container fluid="xl" class="ch-conversations">
          <app-conversation-list
            :show-other-messages="showOtherMessages"
            @toggleAllowOtherMessages="toggleAllowOtherMessages"
          />
          <router-view v-if="showConversations" class="router-view" />
        </b-container>
      </b-col>
      <b-col md="3">
        <!-- <app-ad-slot widget-id="224558" height="620" /> -->
        <app-download-card />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import AppConversationList from '@/components/conversations/ConversationList.vue';
import AppDownloadCard from '@/components/sidebar/AppDownloadCard.vue';
// import AppAdSlot from '@/components/sidebar/AdSlot.vue';

import AllowOtherMessages from '@/gql/general/AllowOtherMessages.gql';
import GetProfile from '@/gql/general/GetProfile.gql';
import $auth from '@/services/auth';

export default {
  components: {
    AppConversationList,
    AppDownloadCard,
    // AppAdSlot,
  },
  apollo: {
    user: {
      query: GetProfile,
      variables() {
        return {
          id: $auth.getUserId(),
        };
      },
    },
  },
  data() {
    return {
      listType: this.$route.params.type,
      showOtherMessages: false,
    };
  },
  computed: {
    showConversations() {
      return this.listType === 'friend' || this.showOtherMessages;
    },
  },
  watch: {
    user() {
      this.showOtherMessages = this.user.allowUnsolicitedMessages;
    },
  },
  methods: {
    async toggleAllowOtherMessages() {
      await this.$apollo.mutate({
        mutation: AllowOtherMessages,
        variables: {
          allowUnsolicitedMessages: !this.showOtherMessages,
        },
      });
    },
  },
};
</script>

<style scoped>
.router-view {
  flex: 1;
  display: flex;
}
.ch-conversations {
  display: flex;
  background: white;
  height: calc(100vh - 100px);
  padding: 0px;
}
</style>
