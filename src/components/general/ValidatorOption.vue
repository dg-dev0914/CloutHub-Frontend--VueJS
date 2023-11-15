<template>
  <div class="ch-validator-option" :class="validClass">
    <i :class="valid ? 'cs-icons-check-success' : 'cs-icons-check-success'" />
    <span class="ch-validator-option__label cs-textstyle-paragraph">{{ label }}</span>
  </div>

</template>

<script>
export default {
  props: {
    valid: {
      type: Boolean,
    },
    label: {
      type: String,
    },
  },
  computed: {
    validClass() {
      return this.valid ? 'ch-validator-option--valid' : 'ch-validator-option--invalid';
    },
  },
};
</script>

<style scoped>
.ch-validator-option {
  color: var(--cs-gray-04);
  margin-bottom: 3px;
  transition: color 0.2s;
}
.ch-validator-option--valid {
  color: var(--cs-success-base);
}
.ch-validator-option--invalid {
  /* color: var(--cs-danger-base); */
  color: var(--cs-gray-04);
}
.ch-validator-option i {
  margin-right: 4px;
  font-size: 16px;
}
</style>
