<template>
  <div class="wrapper">
    <label class="cs-textstyle-label-text">
      Custom URL
      <span class="cs-textstyle-paragraph-small">{{
        displayContent.label
      }}</span></label
    >
    <cs-input
      :value="slugInputData"
      placeholder="your-customurl"
      @input="slugHandle"
    ></cs-input>
    <div v-if="!isValidSlug">
      <p v-if="slugValidationError" class="slug-error">
        Customurl Can not contain special symbol or spaces
      </p>
      <p v-if="isEmptySlug" class="slug-error">Customurl is required</p>
      <p v-if="slugInUse" class="slug-error">Customurl is already in use</p>
    </div>
    <div v-if="isValidSlug && !loading">
      <p class="slug-valid">Valid URL</p>
    </div>
    <app-spinner v-if="loading" size="small" class="ch-spinner" />
  </div>
</template>

<script>
import CheckSlugAvailability from '@/gql/general/CheckSlugAvailability.gql';
import AppSpinner from '@/components/general/Spinner.vue';

export default {
  components: {
    AppSpinner,
  },
  props: {
    slug: {
      type: String,
      default: '',
    },
    slugType: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      slugInputData: this.slug,
      isValidSlug: true,
      timeout: null,
      slugValidationError: false,
      slugInUse: false,
      isEmptySlug: false,
      loading: false,
      formData: {
        MEETING: {
          label: '(https://clouthub.com/m/your-custom-url)',
        },
        GROUP: {
          label: '(https://clouthub.com/g/your-custom-url)',
        },
        CHANNEL: {
          label: '(https://clouthub.com/c/your-custom-url)',
        },
      },
    };
  },
  computed: {
    displayContent() {
      return this.formData[this.slugType];
    },
  },
  mounted() {
    if (!this.slug) {
      if (this.name) {
        const randomNum = Math.floor(Math.random() * (999 - 100 + 1) + 100);
        const name = this.name.replace(/[^a-zA-Z ]/g, '');
        const NameArray = name.split(' ');
        if (NameArray.length > 1)
          this.slugInputData = `${NameArray[0]}_${NameArray[1]}_${randomNum}`;
        else this.slugInputData = `${NameArray[0]}_${randomNum}`;
      } else {
        this.slugInputData = [...Array(8)]
          .map((i) => (~~(Math.random() * 36)).toString(36))
          .join('');
      }
    }
  },
  methods: {
    slugHandle(slug) {
      this.$emit('slugChecking');
      this.loading = true;
      this.isValidSlug = false;
      this.isEmptySlug = false;
      this.slugInUse = false;
      if (!!slug && slug !== this.slug) {
        this.slugValidationError = /[^a-z\d_-]/i.test(slug);
        if (this.slugValidationError) this.loading = false;
        clearTimeout(this.timeout);
        if (!this.slugValidationError) {
          this.timeout = setTimeout(async () => {
            const { data } = await this.$apollo.query({
              query: CheckSlugAvailability,
              variables: {
                type: this.slugType,
                slug,
              },
            });
            if (data.check_slug_availability) {
              this.isValidSlug = true;
              this.$emit('slugInput', slug);
              this.loading = false;
            } else {
              this.slugInUse = true;
              this.loading = false;
            }
          }, 2000);
        }
      } else {
        if (!slug) this.isEmptySlug = true;
        else {
          this.isValidSlug = true;
          this.$emit('slugInput', slug);
        }
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.slug-error {
  color: var(--cs-danger-base);
  font-size: var(--cs-font-size-10);
}
.slug-valid {
  color: var(--cs-success-base);
  font-size: var(--cs-font-size-10);
}
.wrapper {
  position: relative;
  padding-top: 20px;
  display: flex;
  flex-direction: column;
}
</style>
