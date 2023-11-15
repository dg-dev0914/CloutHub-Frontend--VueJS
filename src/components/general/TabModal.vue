<template lang="html">
  <!-- This is a modal with tabs in the header.  That is all -->
  <app-modal class="ch-tabs-modal" :show="show" @close="$emit('close')">
    <cs-page-tabs
      v-if="!custom"
      :key="'tab-' + tabKey"
      class="ch-tabs-modal__labels"
      no-border
      :tabs="tabs"
      :value="value"
      @input="$emit('input', $event)"
    />
    <div v-if="custom" class="tab-bar">
      <div
        v-for="(tab, index) in tabs"
        :key="tab.value"
        class="tab"
        :class="{ tab__selected: index === selectedIndex }"
        @click="activeTab(index)"
      >
        <img
          v-if="tab.value"
          class="emoji"
          :src="'/assets/emojis/' + tab.value + '.png'"
          :alt="tab.value"
        />
        <span>{{ tab.label }}</span>
      </div>
    </div>
    <div :key="'tab-content-' + tabKey" class="ch-tabs-modal__body">
      <slot name="body" />
    </div>
    <slot slot="footer" name="buttons" />
  </app-modal>
</template>

<script>
import AppModal from '@/components/general/Modal.vue';

export default {
  components: {
    AppModal,
  },
  props: {
    custom: {
      type: Boolean,
      required: false,
      default: false,
    },
    tabs: {
      type: Array,
      required: true,
    },
    value: {
      type: Number,
      default: 0,
    },
    show: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      tabKey: null,
      selectedIndex: 0,
    };
  },
  watch: {
    tabs() {
      this.tabKey = Math.floor(Math.random() * 1000000000);
    },
  },
  methods: {
    activeTab(index) {
      this.selectedIndex = index;
      this.$emit('custom-ip', index);
    },
  },
};
</script>

<style lang="css" scoped>
.ch-tabs-modal .ch-tabs-modal__labels {
  position: absolute;
  top: 0;
  left: 0;
  right: 60px;
  --cs-page-tabs-label-padding: 19px 20px !important;
}

.ch-tabs-modal__body {
  width: 100%;
}
.tab-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
  padding: 19px 20px;
  background-color: white;
  margin-bottom: 5px;
  position: absolute;
  top: 0;
  left: 0;
  right: 60px;
}
.tab {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 2px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}
.emoji {
  height: 20px;
  width: 20px;
}
.tab__selected {
  color: var(--cs-primary-base);
}
</style>
