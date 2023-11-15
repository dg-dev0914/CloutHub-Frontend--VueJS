<template lang="html">
  <span class="ch-avatar" :class="['ch-avatar--' + size]" :style="customStyle">
    <div class="ch-avatar__content">
      <div class="ch-avatar__initials">{{ initials }}</div>
      <app-img
        v-if="picture"
        :src="picture"
        :original="original"
        :width="displayWidth"
        :height="displayHeight"
        class="ch-avatar__img"
      />
    </div>
  </span>
</template>

<script>
// https://stackoverflow.com/a/3426956 for text to hash to rgb
import AppImg from '@/components/general/Img.vue';

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}
function intToRGB(i) {
  const c = (i & 0x00ffffff).toString(16).toUpperCase();
  return '00000'.substring(0, 6 - c.length) + c;
}
function textColor(text) {
  return intToRGB(hashCode(text));
}
export default {
  components: {
    AppImg,
  },
  props: {
    name: {
      type: String,
      required: false,
      default: '',
    },
    picture: {
      type: String,
      required: false,
      default: null,
    },
    width: {
      type: Number,
      required: false,
      default: null,
    },
    height: {
      type: Number,
      required: false,
      default: null,
    },
    original: {
      type: Boolean,
      required: false,
      default: false,
    },
    size: {
      type: String,
      default: 'small',
      validator(x) {
        return ['small', 'medium', 'large'].indexOf(x) > -1;
      },
    },
  },
  computed: {
    customStyle() {
      const color = this.name
        ? `#${textColor(this.name)}`
        : 'var(--cs-primary-base)';
      return `--ch-avatar-color: ${color}`;
    },
    initials() {
      const value =
        this.name && this.name.match(/\b\w/g)
          ? this.name && this.name.match(/\b\w/g)
          : [];
      return value[0] ? `${value[0].toUpperCase()}` : '';
    },
    displayWidth() {
      if (this.width) {
        return this.width;
      }
      if (this.size) {
        const sizeMap = {
          small: 35,
          medium: 55,
          large: 85,
        };
        return sizeMap[this.size];
      }
      return 100;
    },
    displayHeight() {
      if (this.height) {
        return this.height;
      }
      if (this.size) {
        const sizeMap = {
          small: 35,
          medium: 55,
          large: 85,
        };
        return sizeMap[this.size];
      }
      return 100;
    },
  },
};
</script>

<style lang="css" scoped>
.ch-avatar {
  line-height: --ch-avatar-size;
  --ch-avatar-color: var(--cs-primary-base);
  --ch-avatar-size: 35px;
  --ch-avatar-font-size: 12px;
}
.ch-avatar__content {
  display: block;
  position: relative;
  height: var(--ch-avatar-size);
  width: var(--ch-avatar-size);
  line-height: 1;
  border-radius: 50%;
  box-sizing: border-box;
  overflow: hidden;
  align-items: center;
  border: 2px solid #fff;
}
.ch-avatar--small {
  --ch-avatar-size: 35px;
  --ch-avatar-font-size: 12px;
}
.ch-avatar--medium {
  --ch-avatar-size: 55px;
  --ch-avatar-font-size: 16px;
}
.ch-avatar--large {
  --ch-avatar-size: 85px;
  --ch-avatar-font-size: 22px;
}
.ch-avatar__img {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  object-fit: cover;
  width: 100%;
  height: 100%;
}
.ch-avatar__initials {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  color: var(--cs-gray-05);
  font-weight: var(--cs-font-weight-bold);
  font-size: var(--ch-avatar-font-size);
  background-color: var(--ch-avatar-color);
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}
</style>
