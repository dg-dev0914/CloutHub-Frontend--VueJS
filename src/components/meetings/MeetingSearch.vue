<template>
<div>
  <div class="search-bar">
   <span> Quick Find</span>
   <input
    type="search"
    placeholder="Enter Here"
    @keyup.enter="search()"
    v-model="query"
  >
  </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      query: '',
    };
  },
  methods: {
    select() {
      this.$refs.input.focus();
    },
    search() {
      this.$router.push({
        name: 'MeetingSearch',
        query: {
          q: this.query,
        },
      });
    },
  },
};
</script>
<style scoped>
  .search-bar
  {
    /* flex: 1; */
    margin: 0px;
    margin-left: 20px;
    margin-right: 20px;
    display: flex;
    float: right;
    /* align-items: center; */
    /* justify-content: center; */
    gap: 10px;
    /* border: solid 1px var(--cs-gray-02); */
    padding-left: 10px;
    overflow: hidden;
  }
  .search-bar span {
    width: 150px;
  }
  .search-bar i
  {
    cursor: pointer;
  }
  .search-bar input
  {
    width: 100%;
    border: none;
    height: 38px;
    max-width: 400px;
    background: var(--cs-gray-02);
    border-radius: 15px;
    padding: 10px;
    outline-width: 0;
  }
</style>
