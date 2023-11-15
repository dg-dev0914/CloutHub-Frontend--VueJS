<template>
  <cs-button
    size="small"
    class="cs-profile__button"
    variant="default"
    @click="goToMyChannel()"
    >My Channel</cs-button
  >
</template>

<script>
import $auth from '@/services/auth';

export default {
  methods: {
    goToMyChannel() {
      this.$router.push({
        name: 'VideoProfile',
        params: {
          id: $auth.getUserId(),
        },
      });
    },
  },
};
</script>

<style scoped>
.cs-profile__button {
  padding: 4.5px 53px !important;
  --cs-button-color: #747577 !important;
}
</style>
