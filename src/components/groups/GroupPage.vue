<template>
  <div class="group-page">
    <div class="group-page-header">
      <div class="group-header">
        <img
          class="group-header-image"
          src="@/assets/images/clouthub-logo.png"
          alt="CloutHub"
        />
        <span class="group-header-title">GROUPS</span>
      </div>
    </div>

    <div class="group-page-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.group-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.group-header-image {
  width: 95px;
  margin: 0 5px;
}

.group-header-title {
  font-family: Lato, serif;
  font-size: 14px;
  font-weight: bold;
  color: #000;
}

.group-page {
  background-color: #fff;
}

.group-page-header {
  padding: 5px;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.15);
}
</style>
