<template>
  <RecycleScroller
    ref="scroller"
    :items="itemsWithSize"
    :min-item-size="minItemSize"
    :direction="direction"
    key-field="id"
    v-bind="$attrs"
    @resize="onScrollerResize"
    @visible="onScrollerVisible"
    v-on="listeners"
  >
    <template slot-scope="{ item: itemWithSize, index, active }">
      <slot
        v-bind="{
          item: itemWithSize.item,
          index,
          active,
          itemWithSize,
        }"
      />
    </template>
    <template slot="before">
      <slot name="before" />
    </template>
    <template slot="after">
      <slot name="after" />
    </template>
  </RecycleScroller>
</template>

<script>
import RecycleScroller from './RecycleScroller.vue';
import { props, simpleArray } from './common';
import { saveScrollData, getScrollData } from '../cache';

export default {
  name: 'DynamicScroller',

  components: {
    RecycleScroller,
  },

  inheritAttrs: false,

  provide() {
    if (typeof ResizeObserver !== 'undefined') {
      this.$_resizeObserver = new ResizeObserver((entries) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const entry of entries) {
          if (entry.target) {
            const event = new CustomEvent('resize', {
              detail: {
                contentRect: entry.contentRect,
              },
            });
            entry.target.dispatchEvent(event);
          }
        }
      });
    }

    const scrollData = getScrollData(this.cacheId);
    if (scrollData) {
      this.vscrollData = scrollData;
    }

    return {
      vscrollData: this.vscrollData,
      vscrollParent: this,
      vscrollResizeObserver: this.$_resizeObserver,
    };
  },

  props: {
    ...props,

    minItemSize: {
      type: [Number, String],
      required: true,
    },
  },

  data() {
    return {
      vscrollData: {
        active: true,
        sizes: {},
        validSizes: {},
        keyField: this.keyField,
        simpleArray: false,
      },
    };
  },

  computed: {
    simpleArray,

    itemsWithSize() {
      const result = [];
      // eslint-disable-next-line no-shadow
      const { items, keyField, simpleArray } = this;
      const sizes = this.vscrollData.sizes;
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const id = simpleArray ? i : item[keyField];
        let size = sizes[id];
        if (typeof size === 'undefined' && !this.$_undefinedMap[id]) {
          size = 0;
        }
        result.push({
          item,
          id,
          size,
        });
      }
      return result;
    },

    listeners() {
      const listeners = {};
      // eslint-disable-next-line no-restricted-syntax
      for (const key in this.$listeners) {
        if (key !== 'resize' && key !== 'visible') {
          listeners[key] = this.$listeners[key];
        }
      }
      return listeners;
    },
  },

  watch: {
    items() {
      this.forceUpdate(false);
    },

    simpleArray: {
      handler(value) {
        this.vscrollData.simpleArray = value;
      },
      immediate: true,
    },

    direction() {
      this.forceUpdate(true);
    },
  },

  created() {
    this.$_updates = [];
    this.$_undefinedSizes = 0;
    this.$_undefinedMap = {};
  },

  activated() {
    this.vscrollData.active = true;
  },

  deactivated() {
    this.vscrollData.active = false;
  },

  beforeDestroy() {
    if (!this.cacheId) return;
    saveScrollData(this.cacheId, this.vscrollData);
  },

  methods: {
    onScrollerResize() {
      const scroller = this.$refs.scroller;
      if (scroller) {
        this.forceUpdate();
      }
      this.$emit('resize');
    },

    onScrollerVisible() {
      this.$emit('vscroll:update', { force: false });
      this.$emit('visible');
    },

    forceUpdate(clear = true) {
      if (clear || this.simpleArray) {
        this.vscrollData.validSizes = {};
      }
      this.$emit('vscroll:update', { force: true });
    },

    scrollToItem(index) {
      const scroller = this.$refs.scroller;
      if (scroller) scroller.scrollToItem(index);
    },

    getItemSize(item, index = undefined) {
      // eslint-disable-next-line no-nested-ternary
      const id = this.simpleArray
        ? index != null
          ? index
          : this.items.indexOf(item)
        : item[this.keyField];
      return this.vscrollData.sizes[id] || 0;
    },

    scrollToBottom() {
      if (this.$_scrollingToBottom) return;
      this.$_scrollingToBottom = true;
      const el = this.$el;
      // Item is inserted to the DOM
      this.$nextTick(() => {
        el.scrollTop = el.scrollHeight + 5000;
        // Item sizes are computed
        const cb = () => {
          el.scrollTop = el.scrollHeight + 5000;
          requestAnimationFrame(() => {
            el.scrollTop = el.scrollHeight + 5000;
            if (this.$_undefinedSizes === 0) {
              this.$_scrollingToBottom = false;
            } else {
              requestAnimationFrame(cb);
            }
          });
        };
        requestAnimationFrame(cb);
      });
    },
  },
};
</script>
