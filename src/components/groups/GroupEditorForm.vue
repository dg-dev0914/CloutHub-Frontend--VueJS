<template>
  <div class="ch-group-editor">
    <!-- Group name -->
    <cs-input
      v-model="group.name"
      :label="subgroupName"
      :placeholder="subgroupName"
      required
      @input="onInput"
    />

    <!-- Group slug -->
    <app-slug-input
      :slug="orignalSlug"
      :name="group.name"
      slug-type="GROUP"
      @slugInput="handleSlugInput"
      @slugChecking="$emit('slugLoading', true)"
    />
    <b-row>
      <!-- Group profile picture -->
      <b-col key="pictureUrl-input" sm="6">
        <app-image-input
          v-model="group.picture"
          label="Picture (required ratio: 1 : 1)"
          :enforce-ratio="1"
          @input="onInput"
        />
      </b-col>
      <!-- Group banner picture -->
      <b-col key="bannerUrl-input" sm="6">
        <app-image-input
          v-model="group.banner"
          label="Banner (required ratio: 3 : 1)"
          :enforce-ratio="3"
          @input="onInput"
        />
      </b-col>
    </b-row>

    <div>
      <!-- Group description -->
      <app-textarea
        v-model="group.description"
        class="ch-group-editor-form__textarea"
        label="Description"
        placeholder="Description"
        maxlength="2500"
        @input="onInput"
      />
      <div class="ch-group-editor__chars cs-textstyle-paragraph-small">
        {{ group.description ? group.description.length : 0 }}/2500 Characters
      </div>
    </div>

    <!-- Group admin post review -->
    <app-toggle
      v-model="group.enableAdminReview"
      label-checked="Enabled Post review"
      label-unchecked="Require admins to approve all posts"
    />

    <!-- Group privacy -->
    <cs-radio-group
      v-model="group.privacy"
      label="Privacy"
      required
      @input="onInput"
    >
      <cs-radio label="Public" value="public">
        Public<br />
        <span class="cs-textstyle-paragraph-small">
          Anyone can find and join this group without permission
        </span>
      </cs-radio>
      <cs-radio label="Private" value="private">
        Private<br />
        <span class="cs-textstyle-paragraph-small">
          Anyone can find this group, but needs approval to join
        </span>
      </cs-radio>
      <cs-radio label="Secret" value="secret">
        Secret<br />
        <span class="cs-textstyle-paragraph-small">
          Only people with the link can join find this group. Needs permission
          to join
        </span>
      </cs-radio>
    </cs-radio-group>
  </div>
</template>

<script>
// General components
import AppTextarea from '@/components/general/Textarea.vue';
import AppImageInput from '@/components/general/ImageInput.vue';
import AppSlugInput from '@/components/general/SlugInput.vue';
import AppToggle from '@/components/general/CsToggle.vue';

export default {
  components: {
    AppTextarea,
    AppImageInput,
    AppSlugInput,
    AppToggle,
  },
  props: {
    value: {
      type: Object,
      default() {
        return {};
      },
    },
    subgroup: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      group: this.value,
      orignalSlug: this.value.slug,
    };
  },
  computed: {
    subgroupName() {
      if (this.subgroup) return 'Subgroup Name';
      return 'Group Name';
    },
  },
  mounted() {
    if (this.value && !this.group.slug) {
      this.group.slug = this.value.name;
    }
  },
  methods: {
    handleSlugInput(slug) {
      this.group.slug = slug;
      this.$emit('slugLoading', false);
    },
    onInput() {
      this.$emit('input', this.group);
    },
  },
};
</script>

<style scoped>
.ch-group-editor {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0 auto;
}
.ch-group-editor-form__textarea {
  width: 100%;
}
.ch-group-editor__chars {
  text-align: right;
  color: var(--cs-gray-04);
}
</style>
