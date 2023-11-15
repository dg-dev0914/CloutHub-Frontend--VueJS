<template>
  <div class="forum" v-if="isLoggedIn">
    <div>
      <app-post-prompt
        :room="selectedTab"
        :has-share="hasShare"
        :link="link"
        :shared-text="text"
        @save="pinPost = true"
      />
      <cs-page-tabs
        v-model="selectedTab"
        align="justify"
        class="forum-tabs cs-page-tabs--no-border"
        :tabs="tabs"
      >
      </cs-page-tabs>
      <app-following-post-list v-if="selectedTab === 0" />
      <app-everyone-post-list
        v-if="selectedTab === 1"
        :pin-post="pinPost"
        @refreshing="removePinnedPost"
      />
    </div>
  </div>

  <div class="forum" v-else>
    <div> 
      <app-everyone-post-list />
    </div>
  </div>

</template>

<script>
import $bus from '@/services/bus';
import $auth from '@/services/auth';
import AppPostPrompt from '@/components/post/PostPrompt.vue';
import AppEveryonePostList from '@/components/post/lists/EveryonePostList.vue';
import AppFollowingPostList from '@/components/post/lists/FollowingPostList.vue';

export default {
  components: {
    AppPostPrompt,
    AppEveryonePostList,
    AppFollowingPostList,
  },
  data() {
    return {
      tabs: [
        { label: 'Following', value: 'following' },
        { label: 'Everyone', value: 'everyone' },
      ],
      selectedTab: (localStorage.forumSelectedTab || 0) * 1,
      feedbackLink: null,
      pinPost: false,
      hasShare: false,
      link: null,
      text: null,
      isLoggedIn: false,
    };
  },
  computed: {
    showFeedbackLink() {
      return !localStorage.hide_feedback && this.feedbackLink;
    },
  },
  watch: {
    selectedTab() {
      localStorage.forumSelectedTab = this.selectedTab;
      this.removePinnedPost();
    },
  },
  async mounted() {
    const user = await $auth.getUser();
    this.feedbackLink = `/feedback.html?uid=${user.id}&email=${user.email}&device=web`;
    if (this.$route.query.url || this.$route.query.title) {
      this.hasShare = true;
      this.link = this.$route.query.url;
      this.text = this.$route.query.title;
    }
    $bus.$on('remove-share', () => {
      if (this.hasShare) {
        this.$router.push({ name: 'Home' });
        this.hasShare = false;
      }
    });
  },
  created() {
    this.updateLoginStatus();
  },
  methods: {
    async updateLoginStatus() {
      this.isLoggedIn = await $auth.isLoggedInAsUser();
    },
    activeTab(val) {
      this.selectedTab = this.tabs[val].value;
    },
    hideFeedback() {
      this.feedbackLink = null;
      localStorage.hide_feedback = '1';
    },
    removePinnedPost() {
      this.pinPost = false;
    },
  },
};
</script>

<style scoped>
.cs-page-tabs {
  background: white;
  /* padding: 15px 20px; */
}
.forum-tabs .cs-page-tabs__tab-label {
  /* padding: 15px 20px !important; */
}
.forum-tabs {
  margin-bottom: 10px;
}
</style>
