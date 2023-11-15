<template>
  <div class="follow-button">
    <cs-button
      v-if="target.myRelationship && target.myRelationship.isFollower"
      :size="size"
      variant="secondary"
      fill="outline"
      :title="unfollowTip"
      @click="unfollow()"
      >Unfollow</cs-button
    >
    <cs-button v-else :size="size" :title="followTip" @click="follow()"
      >Follow</cs-button
    >
  </div>
</template>

<script>
import $relationshipsApi from '@/api/connections';
import $bus from '@/services/bus';

export default {
  props: {
    size: {
      type: String,
      default: 'medium',
    },
    target: {
      // The target user, including connections object if any
      type: Object,
      required: true,
    },
    block: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    followTip() {
      return `Follow to see more from ${this.target.username} in your feed`;
    },
    unfollowTip() {
      return `Unfollow to see less from ${this.target.username} in your feed`;
    },
  },
  methods: {
    async follow() {
      await $relationshipsApi.followUser(this.target);
      $bus.$emit('follow-user');
      this.$emit('changed-follow');
    },
    async unfollow() {
      await $relationshipsApi.unfollowUser(this.target);
      $bus.$emit('unfollow-user');
      this.$emit('changed-follow');
    },
  },
};
</script>
<style scoped>
.follow-button >>> .cs-button {
  max-width: 120px;
  width: 100%;
}
</style>
