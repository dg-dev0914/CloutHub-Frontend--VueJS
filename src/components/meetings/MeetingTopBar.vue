<template>
  <div class="meeting-top-bar">
    <div class="meeting-top-bar__logo-wrap">
      <img
        src="@/assets/images/clouthub-logo.png"
        class="meeting-top-bar__logo"
        alt="CloutHub Logo"
      />
      <span class="meeting-top-bar__brand">MEETINGS</span>
    </div>
    <i v-if="isModerator" class="meeting-top-bar__info cs-icons-info info-icon"></i>
  </div>
</template>
<script>
export default {
  props: {
    isModerator: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
<style scoped>
.meeting-top-bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 10px;
  padding: 10px;
  background-color: white;
  border-bottom: solid 1px var(--cs-gray-02);
}
.meeting-top-bar__logo-wrap {
  display: flex;
  align-items: center;
  gap: 5px;
}
.meeting-top-bar__logo {
  width: 109px;
}
.meeting-top-bar__brand {
  font-family: var(--cs-font-primary);
  font-weight: bold;
  font-size: 16px;
  color: var(--cs-gray-05);
  letter-spacing: 1px;
}

.meeting-top-bar__info {
  position: absolute;
  right: 10px;
  font-size: 26px;
  color: #979797;
}
</style>
