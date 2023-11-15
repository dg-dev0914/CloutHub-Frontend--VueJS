<template>
  <app-spinner
    v-if="!finished || paused"
    v-observe-visibility="options"
  ></app-spinner>
</template>

<script>
import AppSpinner from '@/components/general/Spinner.vue';

export default {
  components: {
    AppSpinner,
  },
  props: {
    paused: {
      type: Boolean,
      default: false,
    },
    finished: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      visible: false,
      options: {
        callback: this.visibilityChanged,
      },
    };
  },
  watch: {
    paused() {
      if (!this.paused && this.visible) {
        this.$emit('more');
      }
    },
  },
  methods: {
    visibilityChanged(isVisible) {
      this.visible = isVisible;
      if (!this.paused && isVisible) {
        this.$emit('more');
      }
    },
  },
};
</script>
