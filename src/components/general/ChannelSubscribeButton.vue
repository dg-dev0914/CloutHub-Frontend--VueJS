<template>
  <div class="subscribe-button">
    <cs-button
      v-if="!target.subscribedToChannel"
      :size="size"
      variant="primary"
      :title="subscribeTip"
      @click="subscribe()"
      >Subscribe</cs-button
    >
    <cs-button
      v-else
      :size="size"
      variant="secondary"
      fill="outline"
      :title="UnsubscribeTip"
      @click="unsubscribe()"
      >Unsubscribe</cs-button
    >
  </div>
</template>

<script>
import $relationshipsApi from '@/api/connections';

export default {
  props: {
    size: {
      type: String,
      default: 'medium',
    },
    target: {
      type: Object,
      required: true,
    },
  },
  computed: {
    subscribeTip() {
      return `Subscribe to see more from ${this.target.channelName} in your feed`;
    },
    UnsubscribeTip() {
      return `Unsubscribe to see less from ${this.target.channelName} in your feed`;
    },
  },
  methods: {
    async subscribe() {
      await $relationshipsApi.subscribeChannel(this.target);
      this.$parent.$emit('afterSubscribeClick');
    },
    async unsubscribe() {
      await $relationshipsApi.unsubscribeChannel(this.target);
      this.$parent.$emit('afterSubscribeClick');
    },
  },
};
</script>
<style scoped>
.subscribe-button .cs-button {
  max-width: 120px;
  width: 100%;
}
</style>
