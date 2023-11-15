<template>
  <div class="edit-profile-details__interest">
    <label class="edit-profile-details__interest-labels cs-textstyle-label-text"
      >Local Interests</label
    >
    <multiselect
      v-model="interest"
      tag-placeholder="Add this interest"
      placeholder="Search or add an interest"
      :options="interestLocalOptions"
      :multiple="true"
      :taggable="true"
      @input="update"
      @tag="addInterestLocal"
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
      default: () => null,
    },
  },
  data() {
    const interest = this.value && this.value.length > 0 ? this.value : [];
    return {
      interest,
      interestLocalOptions: [
        'Economy',
        'Jobs',
        'Government Spending',
        'Taxes',
        'Immigration',
        'Health Care',
        'Mental Illness',
        'Environment',
        'Infrastructure',
        'Protection of Faith',
        'Drug Issues',
      ],
    };
  },
  methods: {
    addInterestLocal(newTag) {
      this.interestLocalOptions.push(newTag);
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
