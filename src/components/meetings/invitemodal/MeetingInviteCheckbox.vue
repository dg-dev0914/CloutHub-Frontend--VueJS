<template>
  <input v-bind="$attrs" type="checkbox" class="ch-meeting-invite-checkbox" />
</template>

<script>
export default {

}
</script>

<style scoped>
input.ch-meeting-invite-checkbox[type='checkbox'] {
  pointer-events: none;
  margin-right: 5px;
  margin-left: 10px;
  width: 20px;
  height: 20px;
  border-radius: 5px;
  border: 1px solid var(--cs-gray-03);
  box-sizing: border-box;
  position: relative;
  -moz-appearance: none;
  -webkit-appearance: none;
  appearance: none;
  background: var(--cs-gray-00);
}
input.ch-meeting-invite-checkbox[type='checkbox']:checked {
  background: var(--cs-gray-00);
  border: 1px solid var(--cs-primary-base);
}
input.ch-meeting-invite-checkbox[type='checkbox']:checked:after {
  content: '';
  position: absolute;
  width: 12px;
  height: 6px;
  background: rgba(0, 0, 0, 0);
  top: 4px;
  left: 3px;
  border: 2px solid var(--cs-primary-base);
  border-top: none;
  border-right: none;
  -webkit-transform: rotate(-45deg);
  -moz-transform: rotate(-45deg);
  -o-transform: rotate(-45deg);
  -ms-transform: rotate(-45deg);
  transform: rotate(-45deg);
}
</style>
