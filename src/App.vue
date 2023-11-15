<template>
  <div class="app">
    <router-view :key="$route.fullPath" />
    <!-- <app-feedback/> -->
    <app-popup-manager />
    <portal-target name="modals" multiple />
  </div>
</template>
<script>
import AppPopupManager from '@/components/popupManager/Index.vue';
export default {
  components: {
    AppPopupManager,
  },
};
</script>
<style scoped>
.app {
  display: flex;
  position: fixed;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  background: var(--cs-gray-background);
  overflow: hidden;
}
</style>
