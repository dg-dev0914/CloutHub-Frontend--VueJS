<template>
  <div class="ch-username-validator">
    <div class="ch-username-validator__title cs-textstyle-paragraph">
      Requirements
    </div>
    <app-validator-option
      :valid="has_start"
      label="Must start with a letter or number"
    />
    <app-validator-option
      :valid="has_minimum_length"
      label="Must have a minimum of 4 and maximum of 20 characters"
    />
    <app-validator-option
      :valid="has_one_letter"
      label="Must have at least one letter"
    />
    <app-validator-option
      :valid="has_no_special"
      label="Must not contain a special character within the username"
    />
    <app-validator-option
      :valid="has_no_space"
      label="Must not have any spaces"
    />
    <app-validator-option
      :valid="has_no_emoji"
      label="Must not contain emojis"
    />

    <app-validator-option
      v-if="alreadyuse"
      :valid="!alreadyuse"
      label="Username already in use"
    />
  </div>
</template>

<script>
import AppValidatorOption from '@/components/general/ValidatorOption.vue';

export default {
  components: {
    AppValidatorOption,
  },
  props: {
    // Note: value is just used because it's nice to bind to v-model
    value: {
      type: Boolean,
    },
    username: {
      type: String,
      required: true,
    },
    alreadyuse: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    has_minimum_length() {
      return this.username.length > 3 && this.username.length < 21;
    },
    has_start() {
      return /^[@a-z0-9]/i.test(this.username);
    },
    has_one_letter() {
      return /[a-zA-Z]/.test(this.username);
    },
    has_no_special() {
      return !/[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(this.username);
    },
    has_no_space() {
      return !/\s/.test(this.username);
    },
    has_no_emoji() {
      const emojiRegEx =
        /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi;
      return !emojiRegEx.test(this.username);
    },
    valid_username() {
      if (
        this.has_no_special &&
        this.has_minimum_length &&
        this.has_start &&
        this.has_no_space &&
        this.has_one_letter &&
        this.has_no_emoji
      ) {
        return true;
      }
      return false;
    },
  },
  watch: {
    valid_username: {
      immediate: true,
      handler() {
        this.$emit('input', this.valid_username);
      },
    },
  },
};
</script>

<style scoped>
.ch-username-validator__title {
  color: var(--cs-gray-05);
  margin-bottom: 3px;
  margin-top: 20px;
}
</style>
