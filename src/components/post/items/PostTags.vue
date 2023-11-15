<template>
  <div class="ch-posts-tags">
    <cs-tag
      v-for="tag in tags"
      :key="tag"
      v-router-link="{ name: 'Tag', params: { tag: tag } }"
      class="ch-posts-tags__tag cursor-pointer"
    >
      #{{ tag }}
    </cs-tag>
  </div>
</template>

<script>
export default {
  props: {
    tags: {
      type: Array,
      required: true,
    },
  },
};
</script>
<style scoped>
.ch-posts-tags__tag {
  margin-right: 5px;
}
</style>
