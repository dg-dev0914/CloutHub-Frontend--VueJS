<template lang="html">
  <img
    v-if="!(hideOnError && hasError)"
    v-bind="$attrs"
    :src="imgSrc"
    @error="handleError"
  />
</template>

<script>
import $cdn from '@/services/cdn';

const defaultPicture = require('@/assets/images/placeholders/profile-banner.png');

export default {
  props: {
    src: {
      type: String,
      required: false,
      default: '',
    },
    original: {
      type: Boolean,
      default: false,
    },
    width: {
      type: Number,
      required: false,
      default: null,
    },
    autoOptimize: {
      type: Boolean,
      required: false,
      default: false,
    },
    height: {
      type: Number,
      required: false,
      default: null,
    },
    altImg: {
      type: String,
      required: false,
      default: '',
    },
    hideOnError: {
      type: Boolean,
      required: false,
      default: false
    },
  },
  data() {
    return {
      defaultPicture,
      hasError: false,
      mounting: true,
      imgWidth: this.width,
    };
  },
  computed: {
    imgSrc() {
      if ((this.autoOptimize && this.mounting) || !this.src || this.hasError) {
        if (this.altImg) {
          return this.altImg;
        }
        return this.defaultPicture;
      }
      if (this.imgWidth || this.height) {
        return $cdn.optimize(
          this.src,
          this.original,
          this.imgWidth,
          this.height
        );
      }
      return $cdn.optimize(this.src, this.original);
    },
  },
  mounted() {
    this.mounting = false;
    if (this.autoOptimize) {
      this.imgWidth = this.$el.clientWidth;
    }
  },
  methods: {
    handleError() {
      this.hasError = true;
    },
  },
};
</script>
