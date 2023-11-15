<template>
  <div class="username">
    <span>{{ name }}</span>
    <img
      v-if="user.badgeType && user.badgeType === 'user'"
      title="Verified User"
      src="@/assets/images/badges/user.png"
      alt=""
    />
    <img
      v-if="user.badgeType && user.badgeType === 'founder'"
      title="Verified CloutHub Founder"
      src="@/assets/images/badges/founder.png"
      alt=""
    />
    <img
      v-if="user.badgeType && user.badgeType === 'influencer'"
      title="Verified Influencer"
      src="@/assets/images/badges/influencer.png"
      alt=""
    />
    <img
      v-if="user.badgeType && user.badgeType === 'channel'"
      title="Verified Influencer"
      src="@/assets/images/badges/influencer.png"
      alt=""
    />
  </div>
</template>
<script>
export default {
  props: {
    user: {
      type: Object,
      required: true,
    },
    type: {
      type: String,
      default: 'username',
    },
  },
  computed: {
    name() {
      return this.user[this.type];
    },
  },
};
</script>
<style scoped>
.verified-icon {
  color: blue;
  padding-left: 5px;
}
.verified-icon.founder {
  color: var(--cs-primary-base);
}
.username {
  display: inline-flex;
  align-items: center;
}

.username img {
  width: 15px;
  height: 15px;
  margin-left: 5px;
}
</style>
