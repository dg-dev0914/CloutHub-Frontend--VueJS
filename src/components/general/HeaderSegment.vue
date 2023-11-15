<template>
    <div class="ch-segment__header cursor-pointer" @click="$emit('action')">
      <div class="mb-2 cs-textstyle-item-heading">{{title}}</div>
      <cs-button size="small" fill="clear" class="ch-segment__header--btn">{{button}} <i class="cs-icons-next-arrow ch-icons" /></cs-button>
    </div>
</template>
<script>
export default {
  name: 'HeaderSegment',
  props: {
    title: {
      type: String,
      required: true,
      default: 'Untitled Segment',
    },
    button: String,
  },
  data() {
    return {

    };
  },
};
</script>
<style scoped>
.ch-segment__header{
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.ch-segment__header--btn{
  --cs-button-padding: 1px !important;
}
.ch-icons{
  margin-left: 5px;
}
</style>
