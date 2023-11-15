<template>
  <div class="ch-password-input">
    <cs-input
      v-bind="$attrs"
      :type="inputType"
      :placeholder="placeholder"
      :value="value"
      @input="onInput"
      :label="label"
    />
    <i
      :class="[eyeIcon, hasLabel]"
      @click="showPassword = !showPassword"
    />
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
    },
    placeholder: {
      type: String,
      default: 'Enter password',
    },
    label: {
      type: String,
    },
  },
  computed: {
    eyeIcon() {
      return this.showPassword ? 'ch-icons-show-password' : 'ch-icons-hide-password';
    },
    inputType() {
      return this.showPassword ? 'text' : 'password';
    },
    hasLabel() {
      return !this.label ? 'ch-password-input__icon--no-label' : 'test';
    },
  },
  data() {
    return {
      showPassword: false,
    };
  },
  methods: {
    onInput($event) {
      this.$emit('input', $event);
    },
  },
};
</script>

<style lang="css" scoped>
.ch-password-input {
  position: relative;
}
.ch-password-input .cs-input {
  width: 100%;
}
.ch-password-input i {
  font-size: 18px;
  position: absolute;
  top: 40px;
  right: 15px;
  color: var(--cs-gray-04);
}
.ch-password-input i.ch-password-input__icon--no-label {
  top: 10px;
}
</style>
