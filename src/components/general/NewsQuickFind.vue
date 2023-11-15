<template>
  <div>
    <div class="search-card">
      <div class="p-2">
        <h5>Quick Find</h5>
        <span>Enter the news subject or publisher you want to find.</span>
      </div>
      <div class="p-2 search-bar__input-header">
        <div class="search-bar__container">
          <div class="search-bar">
            <i class="cs-icons-search" @click="$refs.nativeInput.focus()" />
            <input
              ref="input"
              v-model="query"
              type="search"
              placeholder="Enter here"
              @keyup.enter="search()"
            />
          </div>
          <div v-if="query.length" class="close-icon__container">
            <i slot="close-icon" class="cs-icons-close" @click="clean"></i>
          </div>
        </div>
        <div class="find-button">
          <cs-button
            variant="secondary"
            size="small"
            fill="outline"
            @click="search()"
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
        MEETINGS: 'Search meetings',
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
    clean() {
      this.query = '';
      this.$emit('input', this.query);
    },
  },
};
</script>
<style scoped>
.find-button >>> .cs-button {
  max-width: 120px;
  width: 100%;
  --cs-button-padding: 5.5px 47px;
}

.search-card {
  /*  */
  display: flex;
  /* gap: 160px; */
  justify-content: space-around;
  align-items: center;
  background-color: white;
  padding: 10px;
  -moz-box-shadow-bottom: 1px 2px 1px rgba(0, 0, 0, 0.1);
  -webkit-box-shadow-bottom: 1px 2px 1px rgba(0, 0, 0, 0.1);
  box-shadow: 1px 2px 2px rgba(0, 0, 0, 0.1);
  /* border-radius: 10px; */
}
.search-bar i {
  color: var(--cs-gray-04);
}
.quick-find {
  background-color: white;
  padding: 10px;
  border-radius: 10px;
  margin-bottom: 10px;
}
/* mob */
.close-icon {
  color: var(--cs-gray-01);
  font-size: 13px;
}
.close-icon__container {
  position: absolute;
  top: 8px;
  right: 5px;
  width: 20px;
  height: 20px;
  background-color: var(--cs-gray-03);
  border-radius: 50%;
  padding-bottom: 2px;
  color: white;
  text-align: center;
  cursor: pointer;
}
.close-icon__container i {
  position: absolute;
  right: 0px;
  width: 20px;
  height: 20px;
  bottom: 2px;
}
.search-bar__input-header {
  margin: 0px 0px -30px -4px;
  /* background-color: white; */
  display: flex;
  align-items: center;
  /* padding: 10px; */
  /* border-bottom: solid 1px #efefef; */
}
.search-bar__container {
  position: relative;
  display: flex;
  align-items: center;
  width: 453px;
  margin-right: 20px;
}
.search-bar {
  background-color: var(--cs-gray-01);
  display: flex;
  border: solid 1px var(--cs-gray-02);
  border-radius: 15px;
  flex: 1;
  overflow: hidden;
  align-items: center;
}
.search-bar input {
  background-color: var(--cs-gray-01);
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
</style>
