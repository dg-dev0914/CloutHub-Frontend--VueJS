<template>
  <span class="popup-manager">
    <!-- By using a v-if on this wrapper we can remove the parent of the popups -->
    <!-- Popups are based on Modal which gets removed from DOM when parent is destroyed -->
    <span v-if="!allPopupsClosed">
      <app-popup
        v-for="popup in popups"
        :key="popup.popupId"
        v-bind="popup"
        :show="popup.show"
        @ok="alertSuccess($event, popup)"
        @close="alertCancel($event, popup)"
      />
    </span>
  </span>
</template>

<script>
import $bus from '@/services/bus';

import AppPopup from '@/components/general/Popup.vue';

export default {
  components: {
    AppPopup,
  },
  data() {
    return {
      popups: [],
    };
  },
  computed: {
    allPopupsClosed() {
      const closedPopups = this.popups.filter((p) => p.closed);
      return this.popups.length === closedPopups.length;
    },
  },
  async mounted() {
    $bus.$on('show-popup', this.openPopup);
  },
  methods: {
    async openPopup(popup) {
      // added an extra filter here.  Soft refreshes seem to result in this getting called more than once
      // Although only one popup would ever open, this seems like it might be safer
      if (this.popups.filter((p) => p.popupId === popup.popupId).length === 0) {
        this.popups.push(popup);
        await this.$nextTick();
        this.$set(popup, 'show', true);
      }
    },
    alertSuccess($event, popup) {
      const value = popup.type === 'prompt' ? $event : true;
      $bus.$emit(popup.popupId, value);
    },
    alertCancel($event, popup) {
      setTimeout(() => {
        this.$set(popup, 'closed', true);
      }, 300); // set closed after animation completed so it can be removed
      this.$set(popup, 'show', false);
      $bus.$emit(popup.popupId);
    },
  },
};
</script>

<style scoped></style>
