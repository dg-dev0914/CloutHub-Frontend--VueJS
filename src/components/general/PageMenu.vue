<template>
  <div class="page-side-menu">
    <div v-if="title" class="title" :class="{ noBorderClass: noBorder }">
      {{ title }}
    </div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    title: String,
    noBorder: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
};
</script>
<style scoped>
.page-side-menu {
  background-color: white;
  margin-bottom: 20px;
  border-radius: 5px;
  overflow: hidden;
}
.title {
  padding: 10px;
  font-size: var(--cs-font-size-10);
  text-transform: uppercase;
  color: var(--cs-gray-04);
  letter-spacing: 1px;
}
.items {
  cursor: pointer;
  font: normal normal bold 14px/21px Roboto;
}
.noBorderClass {
  border: none !important;
  padding-left: 15px;
  font-weight: 500;
}
.active {
  border-left: solid 3px var(--cs-primary-base) !important;
  background-color: var(--cs-gray-00) !important;
  color: var(--cs-primary-base) !important;
  border-color: inherit !important;
}
.page-side-menu .list-group-item {
  border: none;
}
.title {
  border-bottom: 1.2px solid #e6eaea;
}
.page-side-menu .list-group-item + .list-group-item.active {
  margin-top: 0px;
}
</style>
