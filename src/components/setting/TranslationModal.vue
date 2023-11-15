<template lang="html">
  <app-modal :show="show" title="Translation" @close="close">
    <div class="mb-4">
      <div class="ch-notifcations__apply cs-textstyle-paragraph">
        For posts and comments in a different language, select the language
        you’d like to have the posts and comments translated in.
      </div>
      <div class="ch-current-language-wrapper">
        <div
          class="cs-textstyle-paragraph-bold"
          :style="{ 'margin-right': '5px' }"
        >
          Current Language:
        </div>
        <div class="cs-textstyle-paragraph">{{ currentLanguage }}</div>
      </div>
      <app-text-input
        v-model.trim="query"
        class="language-search-input"
        placeholder="Search Languages"
        @input="findLanguage"
        @onEnter="findLanguage"
      />
      <cs-radio-group
        v-model="requestedBadgeType"
        :options="languagesToShow"
      ></cs-radio-group>
      <div
        v-if="!viewMore"
        class="menu-popover-more cs-textstyle-detail-heading cursor-pointer"
        @click="viewMoreHandler"
      >
        View More
      </div>
    </div>

    <cs-button class="float-right" @click="close">Save</cs-button>
  </app-modal>
</template>

<script>
import AppModal from '@/components/general/Modal.vue';
import AppTextInput from '@/components/general/TextInput.vue';
import $wwtc from '@/services/wwtc';
import UpdateUserLanguage from '@/gql/general/UpdateUserLanguage.gql';

const topLanguagesCodes = [
  'english-united-states',
  'french-france',
  'dutch-netherlands',
  'italian-italy',
  'spanish-spain',
  'portuguese-brazil',
  'japanese',
  'chinese-mandarin',
  'chinese-cantonese',
  'russian',
];

export default {
  components: {
    AppModal,
    AppTextInput,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      currentLanguage: localStorage.getItem('currentLanguage'),
      query: '',
      availableLanguages: null,
      viewMore: null,
      languagesToShow: [],
      languagesToShowCopy: [],
      requestedBadgeType: localStorage.getItem('currentLanguage'),
    };
  },
  watch: {
    requestedBadgeType() {
      this.changeLanguage(this.requestedBadgeType);
    },
    viewMore() {
      let result = [];
      if (this.availableLanguages && this.viewMore) {
        result = this.availableLanguages
          .map((el) => ({
            label: el.name,
            value: el.name,
          }))
          .sort((a, b) => {
            const nameA = a.value.toUpperCase();
            const nameB = b.value.toUpperCase();
            if (nameA < nameB) {
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }
            return 0;
          });
      }
      if (this.availableLanguages && !this.viewMore)
        result = this.formTop10Languages(this.availableLanguages).map((el) => ({
          label: el.name,
          value: el.name,
        }));
      this.languagesToShowCopy = result;
      if (this.query)
        result = result.filter((el) => el.label.includes(this.query));
      this.languagesToShow = result;
    },
  },
  async mounted() {
    this.availableLanguages = await $wwtc.getAvailableForTranslateLanguages();
    this.viewMore = false;
    const languageName = this.availableLanguages.find(
      (el) => el.code === localStorage.getItem('currentLanguageCode')
    ).name;
    if (!localStorage.getItem('currentLanguage')) {
      this.requestedBadgeType = languageName;
    }
  },
  methods: {
    async changeLanguage(language) {
      localStorage.setItem('currentLanguage', language);
      this.currentLanguage = language;
      const languageCode = this.availableLanguages.find(
        (el) => el.name === language
      ).code;
      localStorage.setItem('currentLanguageCode', languageCode);
      await this.$apollo.mutate({
        mutation: UpdateUserLanguage,
        variables: {
          language: languageCode,
        },
      });
    },
    findLanguage() {
      if (this.query)
        this.languagesToShow = this.languagesToShowCopy.filter((el) =>
          el.label.toLowerCase().includes(this.query.toLowerCase())
        );
      else this.languagesToShow = this.languagesToShowCopy;
    },
    viewMoreHandler() {
      this.viewMore = !this.viewMore;
    },
    formTop10Languages(languages) {
      return languages.filter((el) => topLanguagesCodes.includes(el.code));
    },
    close() {
      this.$emit('close');
      this.viewMore = false;
    },
  },
};
</script>

<style scoped>
.ch-notifcations__apply {
  color: var(--cs-gray-05);
}
.ch-current-language-wrapper {
  display: flex;
  margin-top: 5px;
}
.float-right {
  float: right;
}
.language-search-input {
  flex: 1 1 auto;
  margin: 10px 0;
}
</style>
