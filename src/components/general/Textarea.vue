<template>
  <cs-textarea ref="textarea" v-bind="$attrs" :value="value" @input="onInput" resize="none"/>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
    },
  },
  data() {
    return {
      textarea: null,
      padding: 0,
    };
  },
  mounted() {
    this.textarea = this.$refs.textarea.$el.querySelector('textarea');
    this.resize();
  },
  methods: {
    onInput($event) {
      this.$emit('input', $event);
      this.resize();
    },
    resize() {
      this.textarea.style.height = 'auto';
      const minHeight = 57; // 1 row
      const newHeight = this.textarea.scrollHeight + 2;
      const finalHeight = minHeight > newHeight ? minHeight : newHeight;

      // scrollHeight + 2 px for the border
      this.textarea.style.height = `${finalHeight}px`;
    },
  },
};
</script>

<style scoped>
</style>
