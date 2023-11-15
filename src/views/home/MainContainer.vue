<template>
  <div>
  <template v-if="isNavBarVisible">
    <b-container fluid="xl" class="no-padding">
      <b-row class="no-gutters">
        <b-col md="3" class="left-sidebar">
          <div>
            <app-profile-card v-if="isLoggedIn" />
            <div class="search-bar" v-if="isLoggedIn">
              <i class="cs-icons-search" @click="selectSearch()"></i>
              <input
                ref="input"
                v-model="query"
                type="search"
                placeholder="Search CloutHub"
                @keyup.enter="search()"
              />
            </div>
            <div class="sticky-ads">
              <app-ad-slot zoneName="ZZNEW1" invocationCode="40" width="250" height="300" />
            </div>
          </div>
        </b-col>
        <b-col md="6" class="main-content">
          <router-view class="router-view" />
        </b-col>
        <b-col md="3" class="right-sidebar">
          <app-follow-recommendations-card v-if="isLoggedIn" />
          <app-download-card />
          <app-site-links-card />
          <!-- <app-ad-slot v-if="!isLoggedIn" zoneName="ZNLC6" invocationCode="37" width="300" height="250" /> -->
          <app-ad-slot zoneName="ZNLC6" invocationCode="37" width="300" height="250" />
          <app-ad-slot zoneName="ZC7" invocationCode="36" width="300" height="250" />
          <app-ad-slot zoneName="ZC8" invocationCode="38" width="300" height="250" />
        </b-col>
      </b-row>
    </b-container>
  </template>
  <template v-else>
    <b-container fluid="xl" class="no-padding">
      <b-row class="no-gutters">
        <b-col md="12" class="main-content-full">
          <router-view class="router-view" />
        </b-col>
      </b-row>
    </b-container>
  </template>
</div>
</template>

<script>
import $auth from '@/services/auth';
import AppProfileCard from '@/components/sidebar/ProfileCard.vue';
import AppDownloadCard from '@/components/sidebar/AppDownloadCard.vue';
import AppFollowRecommendationsCard from '@/components/sidebar/FollowRecommendationsCard.vue';
import AppSiteLinksCard from '@/components/sidebar/SiteLinks.vue';
import AppAdSlot from '@/components/sidebar/AdSlot.vue';

export default {
  components: {
    AppProfileCard,
    AppDownloadCard,
    AppFollowRecommendationsCard,
    AppSiteLinksCard,
    AppAdSlot,
  },
  data() {
    const query = '';
    return {
      isLoggedIn: false,
      isNavBarVisible:true,
      query
    }
  },
  created() {
    this.updateLoginStatus();
  },
  mounted() {
    const routeName = this.$route.name;
    if(routeName==='PostEmbedDetail') {
      this.isNavBarVisible = false;  
    }
  },
  methods: {
    async updateLoginStatus() {
      this.isLoggedIn = await $auth.isLoggedInAsUser();
    },
    selectSearch() {
      this.$refs.input.focus();
    },
    search() {
      this.$router.push({
        name: 'UniversalSearch',
        query: {
          q: this.query,
        },
      });
    },
  },
};
</script>

<style scoped>
.no-padding {
  padding: 0px;
}
.ch-main-container {
  display: flex;
}

.search-bar {
  flex: 1;
  margin: 0 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: solid 1px var(--cs-gray-02);
  border-radius: 4px;
  padding-left: 10px;
  overflow: hidden;
}

.search-bar i {
  cursor: pointer;
}
.search-bar input {
  width: 100%;
  border: none;
  height: 38px;
  padding: 10px;
  outline-width: 0;
}
.ad {
  width: 310px;
  margin-top: 20px;
}
@media (min-width: 1200px) {
  .right-sidebar {
    width: 310px !important;
    box-sizing: content-box;
  }
}
.sticky-ads {
  position: sticky;
  position: -webkit-sticky;
  top: 0;
}
</style>
