<template>
  <div class="search-bar__input-header">
    <div class="search-bar__container">
      <div>
        <h5>Quick Find</h5>
        <span>Enter the video subject or channel you want to find.</span>
      </div>
      <div class="ch-search-bar-align">
        <div class="search-bar">
          <i class="cs-icons-search" @click="$refs.nativeInput.focus()" />
          <input
            ref="nativeInput"
            v-model="query"
            type="search"
            placeholder="Enter here"
            @input="$emit('input', query)"
            @keydown.enter="$emit('search')"
          />
        </div>
        <div v-if="query.length" class="close-icon__container">
          <i class="cs-icons-close close-icon" @click="clean"></i>
        </div>
        <div class="find-btn">
          <cs-button
            variant="secondary"
            size="small"
            fill="outline"
            @click="search"
          >
            Find
          </cs-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  emits: ['input'],
  data() {
    return {
      query: '',
    };
  },
  mounted() {
    this.$emit('input', this.query);
  },
  methods: {
    clean() {
      this.query = '';
      this.$emit('input', this.query);
    },
    search() {
      this.$emit('search');
    },
  },
};
</script>

<style scoped>
.close-icon {
  color: var(--cs-gray-01);
  font-size: 13px;
}
.close-icon__container {
  position: absolute;
  right: 138px;
  width: 24px;
  height: 24px;
  background-color: var(--cs-gray-03);
  border-radius: 50%;
  text-align: center;
}
.search-bar__input-header {
  background-color: white;
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: solid 1px #efefef;
  margin-bottom: 5px;
}
.search-bar__container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  /* margin-right: 20px; */
}
.search-bar {
  display: flex;
  border: solid 1px var(--cs-gray-02);
  border-radius: 15px;
  flex: 1;
  width: 525px;
  overflow: hidden;
  align-items: center;
}
.search-bar input {
  flex: 1;
  border: none;
  padding: 5px;
}
.search-bar input:focus {
  outline-width: 0;
}

.search-bar i {
  padding-left: 10px;
  padding-right: 10px;
}
.ch-search-bar-align {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 19px;
}
.find-btn >>> .cs-button {
  max-width: 120px;
  width: 100%;
  --cs-button-padding: 5.5px 47px;
}
</style>
