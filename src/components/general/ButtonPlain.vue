<template>
  <button v-bind="$attrs" class="button-plain">
    <slot />
  </button>
</template>

<style scoped>
.button-plain {
  padding: 0;
  border: 0;
  outline: 0;
  background: none;
}
</style>
