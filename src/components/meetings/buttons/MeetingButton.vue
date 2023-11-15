<template>
  <button class="meeting-button">
    <slot />
  </button>
</template>
<style>
.meeting-button {
  font-family: var(--cs-font-primary);
  font-size: 16px;
  color: #4a5359;
  background: none;
  border: none;
  outline: none;
}

.meeting-button:hover {
  color: #1b1e21;
}
</style>
