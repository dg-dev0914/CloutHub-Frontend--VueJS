<template>
<div class="card-no-padding card-margin sidebar-card">
  <div>
    <div class="header cs-textstyle-paragraph-bold">
      <router-link :to="{name:'Bookmarked'}">
        My Bookmarked Posts
      </router-link>
    </div>
  </div>
</div>
</template>
<script>

export default {
  // apollo: {
  //   topics: TrendingTopics,
  // },
};
</script>
<style scoped>

.header
{
  padding: var(--cs-card-padding-y) var(--cs-card-padding-x);
  border-bottom: 1px solid var(--cs-gray-02);
  color: var(--cs-gray-06);
  cursor: pointer;
}
</style>
