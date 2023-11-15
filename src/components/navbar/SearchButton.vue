<template>
  <div class="navbar-icon-button cursor-pointer" v-router-link="{name:'Search', params: {type:'users'}}">
    <i class="ch-icons-search" tabindex="-1" :class="{selectedIcon:highlight}"></i>
  </div>
</template>
<script>
export default {
  computed: {
    highlight() {
      return this.$route.name === 'Search';
    },
  },
};
</script>
