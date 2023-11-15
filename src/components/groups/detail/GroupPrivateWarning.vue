<template>
  <div class="group-private-warning">
    <app-img
      class="group-private-warning__img"
      :src="require('@/assets/images/groups/lock.svg')"
    />
    <div class="group-private-warning__title cs-textstyle-paragraph-bold">
      This Group is Private
    </div>
    <div
      class="group-private-warning__description cs-textstyle-paragraph-small"
    >
      You need to join to see the content
    </div>
  </div>
</template>

<script>
import AppImg from '@/components/general/Img.vue';

export default {
  components: {
    AppImg,
  },
};
</script>

<style lang="css" scoped>
/* Private box */
.group-private-warning {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 40px;
}
.group-private-warning__img {
  height: 116px;
}
.group-private-warning__title {
  color: var(--cs-gray-06);
}
.group-private-warning__description {
  color: var(--cs-gray-04);
}
</style>
