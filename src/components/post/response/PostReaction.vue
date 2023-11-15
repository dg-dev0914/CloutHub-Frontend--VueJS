<template>
  <b-popover
    v-if="isTargetRendered"
    ref="popover"
    custom-class="reaction-box"
    placement="right"
    fallback-placement="counterclockwise"
    :target="targetElementId"
    triggers="hover"
  >
    <div class="ch-reaction-bar">
      <div
        v-for="reaction in reactions"
        :key="reaction.unicode"
        class="ch-reaction-icon"
        @click="react(reaction.value)"
      >
        <!-- <span class="emoji">{{ reaction.value }}</span> -->
        <img
          class="emoji"
          :src="'/assets/emojis/' + reaction.value + '.png'"
          :alt="reaction.name"
        />
      </div>
    </div>
  </b-popover>
</template>
<script>
import reactions from '@/assets/emojis/reactions.json';
import $postsApi from '@/api/posts';

export default {
  props: {
    show: {
      type: Boolean,
    },
    post: {
      type: Object,
      required: true,
    },
    targetElementId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      reactions,
      myReaction: null,
      isTargetRendered: false,
    };
  },
  watch: {
    targetElementId: {
      immediate: true,
      handler() {
        this.$nextTick(() => {
          this.checkIfTargetIsRendered();
        });
      },
    },
  },
  mounted() {
    this.myReaction = this.post.myReaction;
  },
  updated() {
  // Wait for DOM updates
  this.$nextTick().then(() => {
    // Re-check if target is rendered in the DOM
    const targetElement = document.getElementById(this.targetElementId);
    if (targetElement) {
      this.isTargetRendered = true;
    } else {
      // Optional: You may want to add another checkIfTargetIsRendered function here
      this.checkIfTargetIsRendered();
    }
  });
},
  methods: {
    checkIfTargetIsRendered(attempt = 1) {
      if (attempt > 100) {
        return;
      }

      this.$nextTick().then(() => {
        const targetElement = document.getElementById(this.targetElementId);
        if (targetElement) {
          this.isTargetRendered = true;
        } else {
          setTimeout(() => this.checkIfTargetIsRendered(attempt + 1), 100);
        }
      });
    },
    async react(data) {
      await $postsApi.reactPost(this.post, data);
      this.$refs.popover.$emit('close');
      // this.$emit('react');
    },
  },
};
</script>

<style scoped>
.reaction-box.popover {
  max-width: none;
  border: none;
  box-shadow: 0 4px 6px rgb(0 0 0 / 13%);
  border-radius: 100px;
}
.reaction-box.popover .popover-body {
  padding: 10px !important;
}
.ch-reaction-bar {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  font-size: 20px;
}
.emoji {
  cursor: pointer;
  font-size: 24px;
  width: 30px;
  height: 30px;
  margin: 5px;
}
.popover-body {
  border-radius: 10px !important;
}
</style>
