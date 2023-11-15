<template>
  <div class="group-share-button">
    <cs-button
      size="small"
      variant="secondary"
      fill="clear"
      @click="$emit('click')"
    >
      <i class="ch-icons-announcement group-share-button__icon"></i>
      <span class="cs-textstyle-paragraph-small-bold">Notification</span>
    </cs-button>
  </div>
</template>

<style scoped>
.group-share-button {
  color: var(--cs-gray-06);
}
.group-share-button__icon {
  color: var(--cs-gray-04);
}
</style>
