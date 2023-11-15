<template>
  <div class="app-checkbox">
    <input
      type="checkbox"
      :checked="value"
      class="app-checkbox__input"
      @click="clicked"
    />
    <label class="app-checkbox__label" @click="clicked">{{ label }}</label>
  </div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: Boolean,
      required: false,
      default: null,
    },
  },
  methods: {
    clicked() {
      this.$emit('clicked');
    },
  },
};
</script>

<style scoped>
.app-checkbox {
  display: flex;
  /* width: 100%; */
  cursor: pointer;
  --cs-checkbox-color: var(--cs-primary-base);
  padding: 6px 0;
  min-height: 22px;
}
.app-checkbox__label {
  cursor: pointer;
  color: var(--cs-gray-05);
  position: relative;
}
.app-checkbox__input {
  border: 1px solid var(--cs-gray-02);
  background: var(--cs-gray-00);
  -webkit-appearance: none;
  -o-appearance: none;
  -moz-appearance: none;
  appearance: none;
  height: 22px;
  width: 22px;
  cursor: pointer;
  margin: 0;
  border-radius: var(--cs-input-border-radius);
  outline: none;
  margin-right: 0.5rem;
}
.app-checkbox__input:checked {
  border-color: var(--cs-checkbox-color);
}
.app-checkbox__input:checked::after {
  border-right: 3px solid var(--cs-checkbox-color);
  border-bottom: 3px solid var(--cs-checkbox-color);
  height: 16px;
  width: 7px;
  content: '';
  display: block;
  position: relative;
  margin-left: 0.6rem;
  margin-top: 0.6rem;
  transform: translate(-50%, -50%) rotateZ(45deg) scale(0.75);
}
</style>
