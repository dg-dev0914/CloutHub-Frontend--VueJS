<template>
  <div class="group-page-subheader">
    <div class="group-search">
      <span class="group-search-title">Search for a Group</span>
      <app-text-input
        v-model.trim="query"
        class="group-search-input"
        placeholder="Search Groups"
        @input="onInputChange"
        @onEnter="searchGroups"
      />
      <cs-button
        class="group-search-button"
        :disabled="query.length < 3"
        variant="default"
        fill="outline"
        size="small"
        @click="searchGroups"
      >
        Find
      </cs-button>
    </div>
  </div>
</template>

<script>
import AppTextInput from '@/components/general/TextInput.vue';

export default {
  components: {
    AppTextInput,
  },
  props: {
    searchRoute: {
      type: String,
      default: 'GroupSearch',
    },
    pageName: {
      type: String,
      default: 'MyGroupsList',
      require: true,
    },
  },
  data() {
    return {
      query: this.$route.query.q || '',
      searchTimer: null,
    };
  },

  methods: {
    searchGroups() {
      this.$router
        .push({
          name: this.searchRoute,
          query: {
            q: this.query,
          },
        })
        .catch(() => {});
    },
    onInputChange($event) {
      this.$emit('searching', !!$event);
      if ($event === '' && this.pageName === 'MyGroupsList') {
        this.$router.push({ name: 'MyGroupsList' });
        clearTimeout(this.searchTimer);
      } else {
        clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => this.searchGroups(), 1500);
      }
    },
  },
};
</script>

<style scoped>
.group-page-subheader {
  padding: 10px 16px;
  border-bottom: solid 1px #e7eaea;
}

.group-search {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-search-input {
  flex: 1 1 auto;
  margin: 0 10px;
}

.group-search-title {
  font-size: 16px;
  font-weight: bold;
  color: #000;
}

.cs-button.group-search-button {
  --cs-button-color: #737373;
  --cs-button-text-color: #737373;
}
</style>
