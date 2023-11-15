<template>
  <div class="group-share-button">
    <cs-button size="small" variant="secondary" fill="clear" @click="share">
      <i class="ch-icons-share group-share-button__icon"></i>
      <span class="cs-textstyle-paragraph-small-bold"> Share </span>
    </cs-button>
  </div>
</template>

<script>
import $bus from '@/services/bus';

export default {
  props: {
    group: {
      type: Object,
      required: true,
    },
  },
  methods: {
    share() {
      const link = `/g/${this.group.slug || this.group.id}`;
      const params = {
        link,
        title: 'Share Group',
      };
      $bus.$emit('show-share-other', params);
    },
  },
};
</script>

<style scoped>
.group-share-button {
  color: var(--cs-gray-06);
}
.group-share-button__icon {
  color: var(--cs-gray-04);
}
</style>
