<template lang="html">
  <app-modal
    :show="show"
    @close="cancel"
    :title="title"
    hide-close
    size="small"
  >
    <div>
      <div class="cs-textstyle-paragraph">{{ message }}</div>
      <template v-if="isPrompt && message"><br /><br /></template>
      <cs-input
        class="popup__input"
        v-if="isPrompt"
        v-model="promptValue"
        :placeholder="placeholder"
      />
    </div>
    <div slot="footer" class="popup__buttons">
      <cs-button
        class="popup__cancel-button"
        v-if="isConfirm || isPrompt"
        @click="cancel"
        variant="default"
        size="medium"
        >Cancel</cs-button
      >
      <cs-button @click="submit" :variant="variant" size="medium">{{
        okLabel
      }}</cs-button>
    </div>
  </app-modal>
</template>

<script>
import AppModal from '@/components/general/Modal.vue';

export default {
  components: {
    AppModal,
  },
  props: {
    type: {
      type: String,
      default: 'alert',
      validator(x) {
        return ['alert', 'confirm', 'prompt'].indexOf(x) > -1;
      },
    },
    variant: {
      type: String,
      default: 'primary',
      validator(x) {
        return (
          [
            'primary',
            'secondary',
            'default',
            'info',
            'success',
            'warning',
            'danger',
          ].indexOf(x) > -1
        );
      },
    },
    show: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
    },
    message: {
      type: String,
    },
    okLabel: {
      type: String,
      default: 'OK',
    },
    cancelLabel: {
      type: String,
      default: 'Cancel',
    },
    value: {
      type: String,
    },
    placeholder: {
      type: String,
    },
  },
  computed: {
    isAlert() {
      return this.type === 'alert';
    },
    isConfirm() {
      return this.type === 'confirm';
    },
    isPrompt() {
      return this.type === 'prompt';
    },
  },
  data() {
    return {
      promptValue: this.value,
    };
  },
  methods: {
    cancel() {
      this.$emit('cancel');
      this.close();
    },
    close() {
      this.$emit('close');
      this.promptValue = '';
    },
    submit() {
      this.isPrompt ? this.$emit('ok', this.promptValue) : this.$emit('ok');
      this.close();
    },
  },
};
</script>

<style lang="css" scoped>
.popup__input {
  width: 100%;
}
.popup__buttons {
  text-align: right;
}
.popup__cancel-button {
  margin-right: 8px;
}
</style>
