<template>
  <div class="config-item">
    <img class="icon-action config-item-icon" :src="icon" :alt="label" />
    <div class="config-item-body">
      <app-button-plain class="button-action">{{ label }}</app-button-plain>
      <span v-if="explanation" class="config-explanation">{{
        explanation
      }}</span>
    </div>
    <app-button-radio :active="active" />
  </div>
</template>

<script>
import AppButtonPlain from '@/components/general/ButtonPlain.vue';
import AppButtonRadio from '@/components/general/ButtonRadio.vue';

export default {
  components: {
    AppButtonPlain,
    AppButtonRadio,
  },
  props: {
    label: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
      required: false,
      default: '',
    },
    icon: {
      type: String,
      require: true,
      default: '',
    },
    active: {
      type: Boolean,
      require: false,
      default: false,
    },
  },
};
</script>

<style scoped>
.icon-action {
  height: 24px;
  width: 24px;
}

.button-action {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  color: #000;
}

.config-item-icon {
  margin-right: 15px;
}

.config-item-icon {
  flex-shrink: 0;
}

.config-item {
  display: flex;
  margin-bottom: 14px;
}

.config-item-body {
  flex: 1 1 100%;
}

.config-explanation {
  line-height: normal;
  letter-spacing: normal;
  font-size: 14px;
  color: #747576;
}
</style>
