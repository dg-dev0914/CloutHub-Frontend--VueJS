<template>
  <div class="ch-toggle">
    <div class="ch-toggle__wrapper" :class="'ch-toggle__wrapper--' + align">
      <div class="ch-toggle__label cs-textstyle-paragraph-bold" @click="toggle">
        {{ label }}
      </div>
      <app-toggle ref="toggle" v-model="toggleValue" @input="toggleChanged" />
    </div>
  </div>
</template>

<script>
import AppToggle from '@/components/general/CsToggle.vue';

export default {
  components: {
    AppToggle,
  },
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    align: {
      type: String,
      default: 'right',
      validator(x) {
        return ['left', 'right'].indexOf(x) > -1;
      },
    },
    label: {
      type: String,
    },
  },
  data() {
    return {
      toggleValue: !!this.value,
    };
  },
  methods: {
    toggle() {
      const toggle = this.$refs.toggle && this.$refs.toggle.$el;
      const input = toggle && toggle.querySelector('input');
      if (input) {
        const checked = input.checked;
        input.checked = !checked;
        this.toggleChanged(!checked);
      }
    },
    toggleChanged($event) {
      this.$emit('input', $event);
    },
  },
};
</script>

<style lang="css" scoped>
.ch-toggle__wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 5px 0;
  cursor: pointer;
}
.ch-toggle__wrapper--right {
  flex-direction: row;
}
.ch-toggle__wrapper--left {
  flex-direction: row-reverse;
}
.ch-toggle__label {
  color: var(--cs-gray-06);
  flex: 1;
  margin-right: 10px;
}
.ch-toggle__wrapper--left .ch-toggle__label {
  margin-left: 10px;
}
.ch-toggle .cs-toggle {
  width: 50px;
}
</style>
