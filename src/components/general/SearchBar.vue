<template>
  <div class="search-bar">
    <i class="cs-icons-search" @click="select()"></i>
    <input
      ref="input"
      v-model="query"
      type="search"
      :placeholder="placeholder"
      @keyup.enter="search()"
    />
  </div>
</template>
<script>
export default {
  data() {
    return {
      query: '',
    };
  },
  computed: {
    mode() {
      const path = this.$route.fullPath;
      if (path.includes('/forum')) {
        return 'FORUM';
      }
      if (path.includes('/video')) {
        return 'VIDEO';
      }
      if (path.includes('/group')) {
        return 'GROUP';
      }
      if (path.includes('/news')) {
        return 'NEWS';
      }
      if (path.includes('/user')) {
        return 'MEMBERS';
      }
      if (path.includes('/meetings')) {
        return 'MEETINGS';
      }
    },
    placeholder() {
      const map = {
        FORUM: 'Search posts',
        VIDEO: 'Search videos',
        GROUP: 'Search groups',
        NEWS: 'Search news',
        MEMBERS: 'Search members',
        MEETINGS: 'Search Meetings',
      };
      const mode = map[this.mode] || 'Search Members';
      return mode;
    },
  },
  watch: {
    $route(to, from) {
      if (!to.fullPath.includes('search')) {
        this.query = '';
      }
    },
  },
  methods: {
    select() {
      this.$refs.input.focus();
    },
    search() {
      const searchPathMap = {
        FORUM: 'ForumSearch',
        VIDEO: 'VideoSearch',
        GROUP: 'GroupSearch',
        NEWS: 'NewsSearch',
        MEMBERS: 'UserSearch',
        MEETINGS: 'MeetingSearch',
      };
      const searchPath = searchPathMap[this.mode] || 'UserSearch';
      this.$router.push({
        name: searchPath,
        query: {
          q: this.query,
        },
      });
    },
  },
};
</script>
<style scoped>
.search-bar {
  flex: 1;
  margin: 0px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: solid 1px var(--cs-gray-02);
  border-radius: 4px;
  padding-left: 10px;
  overflow: hidden;
}
.search-bar i {
  cursor: pointer;
}
.search-bar input {
  width: 100%;
  border: none;
  height: 38px;
  padding: 10px;
  outline-width: 0;
}
</style>
