<template>
  <div class="cursor-pointer" v-router-link="{name:'Profile', params:user}">
    <app-username :user="user" />
  </div>
</template>

<script>
import AppUsername from '@/components/general/Username.vue';

export default {
  components: {
    AppUsername,
  },
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
};
</script>
