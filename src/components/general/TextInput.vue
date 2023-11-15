<template>
  <div class="text-input">
    <div class="text-input-addon">
      <i class="ch-icons-search text-input-icon" />
    </div>
    <input
      :value="value"
      class="text-input-field"
      type="text"
      autofocus
      :placeholder="placeholder"
      @input="onInputChange"
      @keyup.enter="$emit('onEnter')"
    />
    <div class="text-input-addon">
      <button class="button-clear" @click="reset">
        <i class="cs-icons-close-filled button-clear-icon" />
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    placeholder: {
      type: String,
      required: false,
      default: '',
    },
    value: {
      type: String,
      required: true,
      default: '',
    },
  },
  methods: {
    reset() {
      this.$emit('input', '');
    },
    onInputChange($event) {
      this.$emit('input', $event.target.value);
    },
  },
};
</script>

<style scoped>
.text-input {
  display: flex;
  justify-content: stretch;
  align-items: center;
  flex-wrap: nowrap;
  padding: 4px 6px;
  border-radius: 14px;
  border: solid 1px #ddd;
  background-color: rgba(155, 155, 155, 0.15);
  font-size: 16px;
}

.text-input-icon {
  color: #999999;
}

.text-input-field {
  display: block;
  flex: 1 1 100%;
  padding: 0;
  border: 0;
  background: none;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  color: #747576;
}

.text-input-field::placeholder {
  opacity: 1;
}

.text-input-field:focus {
  outline: 0;
}

.text-input-addon {
  flex: 0 0 18px;
  height: 18px;
  line-height: 18px;
}

.button-clear {
  display: block;
  height: 18px;
  width: 18px;
  padding: 5px;
  border: 0;
  border-radius: 18px;
  background-color: #a1a1a1;
  font-size: 8px;
  line-height: 9px;
}

.button-clear-icon {
  color: #ffffff;
}
</style>
