<template>
  <div v-if="isVisible" class="meeting-links-bar">
    <div v-for="button in meeting.buttons" :key="button.link">
      <cs-button
        v-if="button.label && button.link"
        class="meeting-links-bar__button"
        :href="button.link"
        target="_blank"
        size="medium"
      >
        {{ button.label }}
      </cs-button>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    meeting: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    isVisible() {
      return this.meeting.buttons && this.meeting.buttons.length > 0;
    },
  },
};
</script>
<style scoped>
.meeting-links-bar {
  display: flex;
  padding: 10px 15px;
  align-items: center;
  justify-content: center;
  gap: 25px;
  background: var(--cs-gray-00);
}
</style>
