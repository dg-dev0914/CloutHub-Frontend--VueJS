<template>
  <b-popover
    :show="show"
    :target="target"
    :triggers="triggers"
    :placement="placement"
    ref="emojiPopover"
  >
    <div class="emoji-popover">
      <div class="emoji-popover-header">
        <cs-page-tabs :tabs="tabs" @input="selectedTab" />
      </div>
      <div class="emoji-popover-body">
        <span
          v-for="emoji in emojis[selectedGroup].data"
          :key="emoji.codes"
          @click="selectedEmoji(emoji)"
        >
          {{ emoji }}
        </span>
      </div>
    </div>
  </b-popover>
</template>

<script>
import emojis from '@/assets/emojis/emojis';

export default {
  props: {
    show: Boolean,
    placement: {
      type: String,
      default: '',
    },
    triggers: {
      type: String,
      default: 'click blur',
    },
    target: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      emojis,
      tabs: [],
      selectedGroup: 'Frequently used',
    };
  },
  mounted() {
    for (const emoji in emojis) {
      this.tabs.push({
        label: emojis[emoji].selector,
        value: emoji,
      });
    }
  },
  methods: {
    selectedTab(value) {
      this.selectedGroup = this.tabs[value].value;
    },
    selectedEmoji(emoji) {
      this.$emit('selected', emoji);
      this.closeEmojiPopover();
    },
    closeEmojiPopover() {
      this.$refs.emojiPopover.$emit('close');
    },
  },
};
</script>

<style scoped>
.emoji-popover {
  max-width: auto;
  height: 300px;
  cursor: pointer;
}
.emoji-popover span {
  font-size: 30px;
}
.emoji-popover-header {
  height: initial;
}
.emoji-popover-body {
  height: 80%;
  width: 230px;
  overflow-y: auto;
}
.emoji-popover {
  margin-right: -16px;
}
.emoji-popover >>> .cs-page-tabs__tab-label {
  padding: 10px !important;
}
::-webkit-scrollbar {
  width: 10px;
  border-radius: 10px;
}

/* Track */
::-webkit-scrollbar-track {
  background: var(--cs-gray-00);
  border-radius: 10px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: var(--cs-gray-02);
  border-radius: 10px;
}
</style>
