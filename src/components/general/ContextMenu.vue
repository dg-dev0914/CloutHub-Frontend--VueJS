<template>
  <div class="context-menu">
    <div ref="menuButton" tabindex="-1">
      <i v-if="isIcon" :class="icon" class="text-light context-menu-button"></i>
      <span>{{ title }}</span>
    </div>
    <b-popover
      v-if="enableMenu"
      ref="menuPopover"
      :target="$refs.menuButton"
      :placement="placement"
      :triggers="trigger"
      fallback-placement="counterclockwise"
    >
      <div @click="$refs.menuPopover && $refs.menuPopover.$emit('close')">
        <slot></slot>
      </div>
    </b-popover>
  </div>
</template>
<script>
export default {
  props: {
    icon: {
      type: String,
      default: 'cs-icons-options',
    },
    title: String,
    trigger: {
      type: String,
      default: 'click blur',
    },
    placement: {
      type: String,
      default: 'bottomright',
    },
    isIcon: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      enableMenu: false,
    };
  },
  mounted() {
    this.enableMenu = true; // Quirk for using b-popover with refs
  },
};
</script>
<style scoped>
.context-menu {
  display: flex;
  align-items: center;
}
.context-menu-button {
  cursor: pointer;
  font-size: 22px;
}
</style>
