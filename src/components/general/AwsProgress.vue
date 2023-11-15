<template>
  <span class="ch-progress" v-show="uploading">
    {{ progress }}%
  </span>
</template>

<script>
import $bus from '@/services/bus';

export default {
  data() {
    return {
      progress: 0,
      uploading: false,
      timeout: null,
    };
  },
  created() {
    $bus.$on('aws-upload-progress', this.uploadProgress);
  },
  beforeDestroy(){
    $bus.$off('aws-upload-progress');
  },
  methods: {
    uploadProgress($event) {
      this.uploading = true;
      this.progress = $event.value;
      this.$emit('progress', $event);
      clearTimeout(this.timeout);
      if ($event === 100) {
        this.timeout = setTimeout(() => {
          this.$emit('done');
          this.uploading = false;
        }, 3000);
      }
    },
  },
}
</script>

<style scoped>
</style>
