<template>
  <div
    class="cs-select-search"
    :class="{ 'cs-select-search--open': !!open }"
    tabindex="-1"
    @keyup.esc="close"
    @focusin="onFocus"
    @focusout="onBlur"
  >
    <label class="cs-select-search__input-wrapper">
      <input
        ref="input"
        v-model="query"
        class="cs-textstyle-input-text cs-select-search__input"
        :placeholder="placeholder"
        @input="onInput"
        @keyup.up="highlightLast()"
        @keyup.down="highlight(0)"
      />
      <span class="cs-select-search__search-icon">
        <slot name="icon">
          <i :class="icon"></i>
        </slot>
      </span>
    </label>
    <div class="cs-select-search__results-wrapper">
      <div ref="results" class="cs-select-search__results">
        <div
          v-for="(group, $i) in filteredResults"
          :key="$i"
          class="cs-select-search__option-group"
        >
          <div v-if="group.label" class="cs-select-search__option-group-label">
            {{ group.label }}
          </div>
          <div
            v-for="(option, $j) in group.options"
            :key="$j"
            class="cs-select-search__option-group-item"
            :class="{
              'cs-select-search__option-group-item--indent': group.label,
              'cs-select-search__option-group-item--selected':
                selectedOption && selectedOption.value === option.value,
            }"
            :tabindex="open ? 0 : -1"
            @click="select(option)"
            @keyup.enter="select(option)"
            @keyup.down="highlightNext($event)"
            @keyup.up="highlightPrev($event)"
          >
            <div class="custom-result">
              <app-avatar
                :picture="option.value.profilePhotoURL"
                :name="option.label"
                size="small"
              />
              <div class="username"><app-username :user="option.value" /></div>
            </div>
          </div>
        </div>
        <div
          v-if="filteredResults.length < 1"
          class="cs-select-search__option-group-item--no-results"
        >
          {{ noResultsLabel }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AppAvatar from '@/components/general/Avatar.vue';
import AppUsername from '@/components/general/Username.vue';

export default {
  components: {
    AppAvatar,
    AppUsername,
  },
  props: {
    // Value is the value of the option selected
    value: {
      type: [String, Number],
    },
    noResultsLabel: {
      type: String,
      default: 'No Results',
    },
    placeholder: {
      type: String,
      default: 'Search',
    },
    options: {
      type: Array,
      default: null,
    },
    optionGroups: {
      type: Array,
      default: null,
    },
    searchProperties: {
      type: Array,
      default: () => ['label'],
    },
    customSearch: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      default: 'cs-icons-search-filled',
    },
    labelKey: {
      type: String,
      default: 'label',
    },
    valueKey: {
      type: String,
      default: 'value',
    },
    groupLabelKey: {
      type: String,
      default: 'label',
    },
  },
  data() {
    return {
      open: false,
      query: '',
      inputValue: this.value,
    };
  },
  computed: {
    selectedLabel() {
      const option = this.selectedOption;
      return option && option.label ? option.label : '';
    },
    selectedOption() {
      let option;
      const groups = this.optGroups();
      groups.forEach((group) => {
        group.options.forEach((opt) => {
          if (opt.value === this.inputValue) option = opt;
        });
      });
      return option;
    },

    // Lists of results from searching
    filteredResults() {
      const results = JSON.parse(JSON.stringify(this.optGroups())); // Copy list
      const query = this.query && this.query.toLowerCase().trim();
      if (!query) return results; // Don't search if no query
      if (this.customSearch) return results; // Don't filter if using custom-search

      results.forEach((group) => {
        group.matchCount = group.options.length;
      });
      if (query.length === 0) return results;

      // If group label exists and matches, show all sub-items
      results.forEach((group) => {
        if (group.label && group.label.toLowerCase().indexOf(query) > -1) {
          group.matches = true;
        }
      });

      // Filter for matching options
      results.forEach((group) => {
        if (group.matches) return;
        group.options.forEach((option) => {
          this.searchProperties.forEach((prop) => {
            const opProp = option[prop].toString();
            if (opProp.toLowerCase().indexOf(query) > -1) {
              option.match = true;
            }
          });
        });
        group.options = group.options.filter((option) => option.match);
        group.matchCount = group.options.length;
      });

      const filtered = results.filter((group) => group.matchCount > 0);
      return filtered;
    },
  },
  created() {
    this.query = this.selectedLabel;
  },
  methods: {
    onBlur() {
      const hasFocus = this.$el.matches('.cs-select-search:focus-within');
      if (!hasFocus) this.close();
    },
    onFocus() {
      if (!this.open) this.open = true;
    },
    onInput() {
      if (this.query === '') {
        this.inputValue = null;
        this.$emit('input');
      }
      this.$emit('query', this.query);
    },
    select(option) {
      this.inputValue = option.value;
      this.query = option.label;
      this.$emit('select', option); // Emitting the select event with the entire option object
      this.$emit('input', option.value); // Emitting the input event with the option value
      this.close();
    },
    close() {
      this.open = false;
      this.$refs.input.blur();
      this.$el.blur();
    },

    // Map  labels and values
    mapPropertiesForOptions() {
      const mappedOptions = this.options.map((option) => ({
        label: option[this.labelKey],
        value: option[this.valueKey],
      }));
      return mappedOptions;
    },

    mapPropertiesForOptionGroups() {
      const mappedOptionGroups = this.optionGroups.map((group) => ({
        label: group[this.groupLabelKey],
        options: group.options.map((option) => ({
          label: option[this.labelKey],
          value: option[this.valueKey],
        })),
      }));
      return mappedOptionGroups;
    },

    // Standardizes the option groups
    optGroups() {
      if (this.optionGroups) {
        const mappedOptionGroups = this.mapPropertiesForOptionGroups();
        return mappedOptionGroups;
      }
      if (this.options) {
        const mappedOptions = this.mapPropertiesForOptions();
        return [{ options: mappedOptions }];
      }
      return [];
    },

    highlightNext($event) {
      this.highlightChange(1, $event);
    },
    highlightPrev($event) {
      this.highlightChange(-1, $event);
    },
    highlightChange(change, $event) {
      const options = this.$refs.results.querySelectorAll(
        '.cs-select-search__option-group-item'
      );
      const optArray = Array.prototype.slice.call(options);
      this.highlight(optArray.indexOf($event.target) + change);
    },
    highlightLast() {
      const options = this.$refs.results.querySelectorAll(
        '.cs-select-search__option-group-item'
      );
      this.highlight(options.length - 1);
    },
    highlight(index) {
      const options = this.$refs.results.querySelectorAll(
        '.cs-select-search__option-group-item'
      );
      if (index > options.length - 1 || index === -1) {
        this.$refs.input.focus();
      } else {
        options[index].focus();
      }
    },
  },
};
</script>

<style scoped>
/* Input */
.cs-select-search {
  width: 100%;
  --cs-select-search-border-radius: var(--cs-input-border-radius);
  outline: none;
}
.cs-select-search__input-wrapper {
  display: block;
  position: relative;
  height: 40px;
  z-index: 1;
  align-items: center;
  overflow: hidden;
  box-sizing: border-box;
  border: 1px solid;
  border-color: var(--cs-gray-02);
  border-radius: var(---cs-select-search-border-radius);
  background-color: var(--cs-gray-00);
  transition: border-color 0.2s;
}
.cs-select-search--open .cs-select-search__input-wrapper {
  color: var(--cs-gray-07);
  border-color: var(--cs-gray-03);
  border-bottom-color: var(--cs-gray-02);
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}
.cs-select-search--open .cs-select-search__search-icon {
  color: var(--cs-gray-07);
}
.cs-select-search__input {
  display: block;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 0 var(--cs-form-input-padding-x);
  padding-right: calc(2 * var(--cs-form-input-padding-x) + 18px);
  color: var(--cs-gray-07);
  background-color: transparent;
  border: none;
  outline: none;
}
.cs-select-search__search-icon {
  position: absolute;
  right: var(--cs-form-input-padding-x);
  top: 9px;
  font-size: 18px;
  color: var(--cs-gray-03);
  transition: color 0.2s;
}
.cs-select-search__value {
  position: absolute;
  left: 0;
  top: 0;
  right: 40px;
  bottom: 0;
  box-sizing: border-box;
  padding: var(--cs-form-input-padding-x);
  background-color: #0f0;
}
.cs-select-search--open .cs-select-search__value {
  display: none;
}
/* Results */
.cs-select-search__results-wrapper {
  height: 0px;
}
.cs-select-search__results {
  position: relative;
  max-height: 200px;
  box-sizing: border-box;
  transform: scaleY(0) translateY(-50px);
  transform-origin: top;
  transition: transform 0.2s, opacity 0.2s, border-color 0.2s;
  border: solid 1px var(--cs-gray-02);
  border-top: none;
  border-bottom-left-radius: var(---cs-select-search-border-radius);
  border-bottom-right-radius: var(---cs-select-search-border-radius);
  overflow-y: auto;
  opacity: 0;
  background-color: var(--cs-gray-00);
}
.cs-select-search--open .cs-select-search__results {
  transform: scaleY(1) translateY(0);
  border-color: var(--cs-gray-03);
  opacity: 1;
}
.cs-select-search__option-group-label {
  padding: 12px;
  padding-top: 15px;
  font-size: var(--cs-font-size-50);
  text-transform: var(--cs-transform-upper);
  cursor: default;
  color: var(--cs-gray-04);
}
.cs-select-search__option-group-item,
.cs-select-search__option-group-item--no-results {
  padding: 11px;
  padding-top: 8px;
  font-size: var(--cs-font-size-100);
  white-space: normal;
  color: var(--cs-gray-07);
  outline: none;
}
.cs-select-search__option-group-item--indent {
  padding-left: 25px;
}
.cs-select-search__option-group-item--selected,
.cs-select-search__option-group-item:focus,
.cs-select-search__option-group-item:hover {
  background-color: var(--cs-gray-02);
  cursor: pointer;
}

.custom-result {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}
</style>
