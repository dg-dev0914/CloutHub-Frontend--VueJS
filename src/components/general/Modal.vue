<template>
  <span class="ch-modal" :class="{ 'ch-modal__open': show }">
    <transition name="ch-modal__fade">
      <div v-if="show" class="ch-modal__backdrop" @click="requestClosing">
        <div class="ch-modal__backdrop-opacity"></div>
      </div>
    </transition>
    <transition name="ch-modal__fade">
      <div v-if="show" class="ch-modal__popup" :class="sizeClass">
        <div
          v-if="title || !hideClose"
          class="ch-modal__header"
          :class="{ 'ch-modal__header_with-title': title }"
        >
          <div class="ch-modal__title cs-textstyle-item-heading">
            {{ title }}
          </div>
          <i
            v-if="!hideClose"
            class="cs-icons-close-filled ch-modal__close"
            @click="requestClosing"
          />
        </div>
        <div v-if="$slots.default" class="ch-modal__body">
          <slot />
        </div>
        <div v-if="$slots.footer" class="ch-modal__footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </transition>
  </span>
</template>

<script>
import $popups from '@/services/popups';

export default {
  name: 'Modal',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
    },
    hideClose: {
      type: Boolean,
      default: false,
    },
    withClosingAlert: {
      type: Boolean,
      default: false,
    },
    noBackdrop: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: 'large',
      validator(x) {
        return ['small', 'large'].indexOf(x) > -1;
      },
    },
  },
  data() {
    return {
      isOpen: this.open,
      appendedToBody: false,
    };
  },
  computed: {
    sizeClass() {
      return this.size === 'small'
        ? 'ch-modal__popup--small'
        : 'ch-modal__popup--large';
    },
  },
  watch: {
    async show() {
      if (this.$el && !this.appendedToBody) {
        document.body.appendChild(this.$el);
        this.appendedToBody = true;
        await this.$nextTick();
      }
      this.isOpen = this.show;
    },
  },
  mounted() {
    if (this.$parent) {
      this.$parent.$once('hook:beforeDestroy', () => {
        this.$emit('close');
        if (this.$el) this.$el.remove();
        this.$destroy();
      });
    }
  },
  methods: {
    async requestClosing() {
      if (this.withClosingAlert) {
        const confirmClose = await $popups.confirmClose({
          title: 'Do you want to close without posting?',
          message:
            'Your post will be lost if you click OK or press CANCEL to continue with your post.',
        });
        if (confirmClose) this.close();
      } else {
        this.close();
      }
    },
    close() {
      this.$emit('close');
    },
  },
};
</script>

<style scoped>
.ch-modal__fade-enter-active,
.ch-modal__fade-leave-active {
  transition: all 0.3s;
}
.ch-modal__fade-enter,
.ch-modal__fade-leave-to {
  opacity: 0;
}

.ch-modal {
}
.ch-modal__backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backdrop-filter: blur(4px);
  z-index: 1;
}

.ch-modal__open ~ .ch-modal__open .ch-modal__backdrop {
  z-index: 6;
}

.ch-modal__open ~ .ch-modal__open .ch-modal__popup {
  z-index: 7;
}

.ch-modal__backdrop-opacity {
  position: absolute;
  height: 100%;
  width: 100%;
  opacity: 0.4;
  background-color: var(--cs-gray-06);
}

.ch-modal__popup {
  background-color: var(--cs-gray-00);
  border-radius: 15px;
  position: absolute;
  max-height: 90%;
  top: 50%;
  z-index: 2;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
  max-width: 740px;
  min-width: 300px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
}
.ch-modal__popup--large {
  width: 80%;
}
.ch-modal__popup--small {
  width: 27%;
}

.ch-modal__header {
  height: 64px;
  padding: 20px;
  display: flex;
  align-items: center;
}
.ch-modal__header_with-title {
  border-bottom: solid 1px var(--cs-gray-02);
}
.ch-modal__title {
  color: var(--cs-gray-08);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ch-modal__close {
  font-size: 20px;
  color: var(--cs-gray-04);
  cursor: pointer;
}
.ch-modal__body {
  padding: 20px;
  overflow: auto;
}
.ch-modal__footer {
  padding: 20px;
  border-top: solid 1px var(--cs-gray-02);
}
</style>
