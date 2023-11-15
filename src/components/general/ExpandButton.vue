<template>
  <span class="app-expand-btn">
    <span class="app-expand-btn__corner" :class="{ open: isOpen }"></span>
  </span>
</template>

<script>
export default {
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
  },
  setup() {},
};
</script>

<style>
.app-expand-btn {
  display: inline-block;
  position: relative;
  top: 3px;
  width: 1.5rem;
  height: 1.5rem;
  background: var(--cs-gray-03);
  border-radius: 50%;
  text-align: center;
  margin-left: 1rem;
}
span.app-expand-btn__corner {
  display: inline-block;
  position: relative;
  width: 0.5rem;
  height: 0.5rem;
  border-top: 0.2rem solid #fff;
  border-right: 0.2rem solid #fff;
  transform: rotate(132.5deg);
  top: -2px;
  transition: transform 0.2s, top 0.2s;
}
span.app-expand-btn__corner.open {
  transform: rotate(312.5deg);
  top: 1px;
}
</style>
