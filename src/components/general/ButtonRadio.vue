<template>
  <span :class="{ 'button-radio': true, 'button-radio-active': active }"></span>
</template>

<script>
export default {
  props: {
    active: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
};
</script>

<style scoped>
.button-radio {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin: 11px 0 9px 26px;
  border: solid 2px #4a5359;
  border-radius: 18px;
}

.button-radio-active:before {
  content: '';
  width: 10px;
  height: 10px;
  border-radius: 10px;
  background-color: #e2896e;
}
</style>
