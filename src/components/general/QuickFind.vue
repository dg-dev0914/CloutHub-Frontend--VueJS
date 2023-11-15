<template>
  <div>
    <!-- <h5>Quick Find</h5> -->
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
  </div>
</template>
<script>
export default {
  props: {
    initialQuery: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      query: this.initialQuery,
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
        FORUM: 'Quick find posts',
        VIDEO: 'Quick find videos',
        GROUP: 'Quick find groups',
        NEWS: 'Quick find news',
        MEMBERS: 'Quick find members',
        MEETINGS: 'Quick find meetings',
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
.quick-find {
  background-color: white;
  padding: 10px;
  border-radius: 10px;
  margin-bottom: 10px;
}
</style>
