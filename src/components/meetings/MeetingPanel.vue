<template>
  <div class="meeting-panel">
    <div class="meeting-panel-title">{{ label }}</div>
    <div class="meeting-panel-body">
      <slot></slot>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    label: {
      type: String,
      required: true,
    },
  },
};
</script>
<style scoped>
.meeting-panel {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  background: var(--cs-gray-00);
}
.meeting-panel-title {
  position: relative;
  padding: 10px;
  font-family: var(--cs-font-primary);
  font-weight: bold;
  text-align: center;
  color: #4a5359;
  background-color: white;
  border-bottom: solid 1px var(--cs-gray-02);
}
.meeting-panel-body {
  flex: 1;
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin-top: 45px;
  overflow-y: scroll;
  overflow-x: hidden;
}
</style>
