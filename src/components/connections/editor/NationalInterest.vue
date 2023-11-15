<template>
  <div class="edit-profile-details__interest">
    <label class="edit-profile-details__interest-labels cs-textstyle-label-text"
      >National Interests</label
    >
    <multiselect
      v-model="interest"
      tag-placeholder="Add this interest"
      placeholder="Search or add an interest"
      :options="options"
      :multiple="true"
      :taggable="true"
      @input="update"
      @tag="addInterest"
    ></multiselect>
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect';

export default {
  components: {
    Multiselect,
  },
  props: {
    value: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  data() {
    const interest = this.value && this.value.length > 0 ? this.value : [];
    return {
      interest,
      options: [
        'Crime',
        'Traffic',
        'Over Development',
        'Schools',
        'Blight',
        'Economic Development',
        'Housing',
        'Homelessness',
        'Rent Control',
        'Services',
        'Infrastructure',
      ],
    };
  },
  methods: {
    addInterest(newTag) {
      this.options.push(newTag);
      this.interest.push(newTag);
      this.update();
    },
    update() {
      this.$emit('input', this.interest);
    },
  },
};
</script>

<style scoped>
.edit-profile-details__interest-labels {
  margin-bottom: 5px !important;
  color: var(--cs-gray-05);
}
.edit-profile-details__interest >>> .multiselect__tag {
  background: var(--cs-primary-base);
}
.edit-profile-details__interest >>> .multiselect__option--selected {
  background: var(--cs-primary-base) !important;
}
.edit-profile-details__interest >>> .multiselect__option--highlight {
  background: var(--cs-primary-base) !important;
}

.edit-profile-details__interest >>> .multiselect__option--highlight:after {
  background: var(--cs-primary-base) !important;
}
</style>
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
