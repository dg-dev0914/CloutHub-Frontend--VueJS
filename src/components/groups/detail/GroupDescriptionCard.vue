<template lang="html">
  <div class="sidebar-card">
    <div class="card-header cs-textstyle-paragraph-bold">Group Description</div>
    <div
      v-if="group.description"
      class="card-content group-description-card__description"
    >
      {{ groupDescription }}
    </div>
    <div v-else class="card-content">No description available</div>
  </div>
</template>

<script>
export default {
  props: {
    group: {
      type: Object,
      required: true,
    },
  },
  computed: {
    // Strips HTML from legacy group descriptions
    groupDescription() {
      if (!this.group || !this.group.description) return '';
      const doc = new DOMParser().parseFromString(
        this.group.description,
        'text/html'
      );
      return doc.body.textContent || '';
    },
  },
};
</script>

<style lang="css" scoped>
.sidebar-card {
  margin-bottom: 20px;
  border-radius: 5px;
  box-shadow: 0px 3px 6px #0000000d;
}
.sidebar-card .card-header {
  display: flex;
  padding: 15px 20px;
  justify-content: space-between;
  background-color: var(--cs-gray-00);
  color: var(--cs-gray-06);
}
.group-description-card__description {
  white-space: pre-line;
  overflow-wrap: break-word;
}
</style>
