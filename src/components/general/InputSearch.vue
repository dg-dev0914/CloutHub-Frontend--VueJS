<template>
  <div class="input-search__search-holder">
    <i
      v-if="model.length > 0"
      class="cs-icons-close input-search__close-icon"
      @click="clean"
    ></i>
    <i v-else class="cs-icons-search input-search__close-icon"></i>
    <input
      v-model="model"
      type="text"
      class="input-search__input"
      :placeholder="placeholder"
      @input="$emit('input', model)"
    />
  </div>
</template>

<script>
export default {
  emits: ['input'],
  props: {
    placeholder: {
      type: String,
      required: false,
      default: '',
    },
  },
  data() {
    return {
      model: '',
    };
  },
  methods: {
    clean() {
      this.model = '';
      this.$emit('input', this.model);
    },
  },
};
</script>

<style scoped>
.input-search__input {
  width: 100%;
  border: 1px solid var(--cs-gray-02);
  border-radius: 5px;
  color: var(--cs-gray-06);
  padding-left: 1rem;
}
input.input-search__input:focus {
  border: 1px solid var(--cs-gray-03);
  outline: none;
}
.input-search__close-icon {
  float: right;
  position: relative;
  top: 0;
  margin-left: -3rem;
  margin-right: 0.5rem;
  margin-top: 0.1rem;
  border: none;
  background: none;
  line-height: 2.2rem;
  color: #666;
  cursor: pointer;
}
</style>
