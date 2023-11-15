<template>
  <div
    class="cs-toggle"
    :class="{ 'cs-toggle--disabled': disabled }"
    :valid="!$v.inputValue.$error && (!required || $v.inputValue.required)"
  >
    <label class="cs-toggle__label" role="checkbox">
      <input
        type="checkbox"
        v-model="$v.inputValue.$model"
        :required="required"
        :checked="value"
        :disabled="disabled"
        tabindex="-1"
        @change.stop="toggle"
        class="cs-toggle__input"
        :class="{ 'cs-toggle__input--error': $v.inputValue.$error }"
      />
      <span
        class="cs-textstyle-label-text cs-toggle__label-text"
        v-if="inputValue && (labelChecked || $slots['label-checked'])"
      >
        <slot name="label-checked">{{ labelChecked }}</slot>
        <span v-show="required"> *</span>
      </span>
      <span
        class="cs-textstyle-label-text cs-toggle__label-text"
        v-if="!inputValue && (labelUnchecked || $slots['label-unchecked'])"
      >
        <slot name="label-unchecked">{{ labelUnchecked }}</slot>
        <span v-show="required"> *</span>
      </span>
    </label>
    <div class="cs-textstyle-label-text cs-toggle__error">
      <span v-if="$v.inputValue.$error">
        <span v-if="!$v.inputValue.required">* Required</span>
      </span>
    </div>
  </div>
</template>
  
  <script>
import { validationMixin } from 'vuelidate';

export default {
  mixins: [validationMixin],
  name: 'Toggle',
  props: {
    value: {
      type: Boolean,
    },
    required: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    labelChecked: {
      type: String,
    },
    labelUnchecked: {
      type: String,
    },
  },
  data() {
    return {
      inputValue: this.value,
    };
  },
  validations() {
    return {
      inputValue: {
        required: (val) => (this.required ? !!val : true),
      },
    };
  },
  methods: {
    toggle(event) {
      this.$emit('input', event.target.checked);
      this.$emit('change', {
        value: event.target.checked,
        srcEvent: event,
      });
    },
  },
};
</script>
  
  <style scoped>
.cs-toggle {
  --cs-toggle-color: var(--cs-primary-base);
}
.cs-toggle--disabled {
  pointer-events: none;
}

.cs-toggle__label {
  display: inline-flex;
  cursor: pointer;
  user-select: none;
  outline: none;
  padding: 6px 0;
  min-height: 22px;
}

.cs-toggle__input[type='checkbox'] {
  display: inline-block;
  -moz-appearance: initial;
  outline: none;
  position: relative;
  width: 0;
  height: 0;
  margin: 0;
}

/* Toggle */
/* Background */
.cs-toggle__input[type='checkbox']::before {
  content: ' ';
  cursor: pointer;
  position: relative;
  display: inline-block;
  width: 48px;
  height: 22px;
  box-sizing: border-box;
  background-color: var(--cs-gray-00);
  border: solid 1px var(--cs-gray-02);
  border-radius: 11px;
  transition: background-color 0.3s;
}
/* Round Button */
.cs-toggle__input[type='checkbox']::after {
  content: ' ';
  cursor: pointer;
  display: block;
  height: 22px;
  width: 22px;
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: -1px;
  overflow: hidden;
  border-radius: 50%;
  z-index: 2;
  background-color: var(--cs-gray-01);
  border: 1px solid var(--cs-gray-02);
  box-shadow: 0px 1px 3px #0000001a;
  transition: transform 0.2s;
}
.cs-toggle__input[type='checkbox']:checked::before {
  background-color: var(--cs-toggle-color);
}
.cs-toggle__input[type='checkbox']:checked::after {
  /* width - height + 2 */
  transform: translateX(calc(49px - 22px + 2px));
}

/* Label */
.cs-toggle__label-text {
  color: var(--cs-gray-05);
  margin-left: calc(49px + 12px);
}

.cs-toggle__input:disabled::before {
  background-color: var(--cs-gray-02);
}

.cs-toggle__input--error::before {
  border-color: var(--cs-danger-base);
}
.cs-toggle__error {
  color: var(--cs-danger-base);
}
.cs-form .cs-toggle__error::before {
  content: '\200b'; /* Used to create a min-height of an empty div */
}
</style>
  