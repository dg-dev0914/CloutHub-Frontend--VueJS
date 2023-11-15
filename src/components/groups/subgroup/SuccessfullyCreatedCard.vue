<template>
  <div class="successfully-created-card">
    <i class="ch-icons-verified check-icon"></i>
    <p class="cs-textstyle-paragraph-bold">Successfully Created</p>
    <p class="cs-textstyle-paragraph successfully-created-card__info">
      You have successfully created a subgroup
    </p>
    <p class="cs-textstyle-paragraph">"{{ groupName }}"</p>
  </div>
</template>

<script>
export default {
  props: {
    groupName: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
.check-icon {
  font-size: 70px;
  color: rgb(53, 201, 53);
}
.successfully-created-card {
  text-align: center;
}
.successfully-created-card__info {
  margin: 0px;
}
</style>
