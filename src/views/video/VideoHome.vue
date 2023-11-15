<template>
  <b-container>
    <b-row>
      <b-col md="12">
        <app-video-segment-new
          title="Latest Videos"
          :query="recentQuery"
          :count="4"
          class="mb-4"
          :to="{ name: 'VideoList', params: { view: 'latest' } }"
        />
        <app-ad-slot widget-id="224550" height="1700" />
      </b-col>
    </b-row>
  </b-container>
</template>
<script>
import AppVideoSegmentNew from '@/components/video/VideoSegmentNew.vue';
import AppAdSlot from '@/components/sidebar/AdSlot.vue';

export default {
  components: {
    AppVideoSegmentNew,
    AppAdSlot,
  },
};
</script>
