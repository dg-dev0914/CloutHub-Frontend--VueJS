<template>
  <div class="logged-in-container">
    <app-nav-bar v-if="isNavBarVisible"></app-nav-bar>
    <app-notification-header v-if="isNavBarVisible"></app-notification-header>
    <div class="logged-in-view" v-on:scroll="handleScroll">
      <div class="container-fluid-xl">
        <router-view :key="$route.fullPath"/>
      </div>
    </div>
    <app-modal-manager></app-modal-manager>
    <div
        class="scroll-top-wrapper"
        title="To top of page"
        @click="scrollToTop()"
        v-if="scrolled"
    >
      <i class="cs-icons-last-angle"></i>
    </div>
  </div>
</template>
<script>
import AppNavBar from '@/components/navbar/NavBar.vue';
import AppNotificationHeader from '@/components/notifications/NotificationHeader.vue';
import AppModalManager from '@/components/modalManager/Index.vue';
import $window from '@/services/window';

export default {
  name: 'Home',
  components: {
    AppNavBar,
    AppModalManager,
    AppNotificationHeader,
  },
  data() {
    return {
      scrolled: false,
      isNavBarVisible:true,
    };
  },
  mounted() {
    const routeName = this.$route.name;
    if(routeName==='PostEmbedDetail') {
      this.isNavBarVisible = false;  
    }
  },
  methods: {
    handleScroll(e) {
      this.scrolled = e.target.scrollTop > 100;
    },
    scrollToTop() {
      $window.scrollToTop();
    },
  },
};
</script>
<style scoped>
.logged-in-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.logged-in-view {
  flex: 1;
  overflow-y: scroll;
  padding: 20px;
}

.scroll-top-wrapper {
  position: fixed;
  top: 80px;
  right: 30px;
  font-size: 20px;
  color: var(--cs-gray-05);
  border: solid 1px var(--cs-gray-03);
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  padding: 10px;
  cursor: pointer;
  transform: rotate(-90deg); /* Equal to rotateZ(45deg) */
}
</style>
