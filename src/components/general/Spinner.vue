<template>
  <cs-spinner :class="size"></cs-spinner>
</template>
<script>
export default {
  name: 'Spinner',
  props: {
    size: {
      type: String,
      default: '',
    },
  },
  data() {
    return {};
  },
};
</script>
<style scoped>
.cs-spinner {
  min-height: 45px;
}
.cs-spinner >>> .cs-spinner__dots {
  margin: 0px auto !important;
}
.small {
  --cs-font-size-10: 8px;
}
.medium {
  --cs-font-size-10: 12px;
}
.large {
  --cs-font-size-10: 20px;
}
</style>
