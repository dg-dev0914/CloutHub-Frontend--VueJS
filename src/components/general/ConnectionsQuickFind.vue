<template>
  <div>
    <div class="search-card">
      <div class="col-md-5">
        <h5>Quick Find</h5>
        <span>{{ currentView.title }}</span>
      </div>
      <div class="col-md-7 search-bar__input-header">
        <div class="search-bar__container">
          <div class="search-bar">
            <i class="cs-icons-search" @click="$refs.nativeInput.focus()" />
            <input
              ref="nativeInput"
              v-model="search"
              type="text"
              placeholder="Enter here"
              @input="inputSearch"
            />
          </div>
          <div v-if="search" class="close-icon__container">
            <i slot="close-icon" class="cs-icons-close" @click="clean"></i>
          </div>
        </div>
        <div class="find-button">
          <cs-button
            variant="secondary"
            size="small"
            fill="outline"
            @click="inputSearch()"
          >
            Find
          </cs-button>
        </div>
      </div>
    </div>
    <!-- Find results -->
    <div v-if="users" class="row">
      <app-user-card
        v-for="user in users"
        :key="user.id"
        :user="user"
        @status-changed="refreshSearchList"
      />
      <app-infinite-loader
        :paused="$apollo.queries.users.loading"
        :finished="!mayHaveMore"
        @more="loadMore()"
      />
    </div>
    <cs-empty-state
      v-if="users && users.length === 0 && this.$route.params.view === 'find'"
      description="No users"
    />
  </div>
</template>
<script>
import UserSearch from '@/gql/search/UserSearch.gql';
import AppUserCard from '@/components/connections/UserCard.vue';
import AppInfiniteLoader from '@/components/general/InfiniteLoader.vue';

const viewSettings = {
  recommended: {
    title: 'Enter the name or term you want to search.',
  },
  friends: {
    title: 'Enter the name of the member you want to find.',
  },
  following: {
    title: 'Enter the name of the member you want to find.',
  },
  followers: {
    title: 'Enter the name of the member you want to find.',
  },
  find: {
    title: 'Enter the name or term you want to search.',
  },
};
export default {
  components: {
    AppUserCard,
    AppInfiniteLoader,
  },
  props: {
    query: {
      type: String,
      // required: true,
      default: '',
    },
  },
  apollo: {
    users: {
      query: UserSearch,
      variables() {
        return {
          query: this.search,
        };
      },
      skip() {
        return !this.search;
      },
    },
  },
  data() {
    return {
      mayHaveMore: true,
      searchTimer: null,
      search: this.$route.query ? this.$route.query.q : '',
    };
  },
  computed: {
    noQuery() {
      return this.search ? this.search.trim().length === 0 : true;
    },
    currentView() {
      return viewSettings[
        this.$route.params.view ? this.$route.params.view : 'find'
      ];
    },
  },
  methods: {
    inputSearch(data) {
      data || data === undefined ? (this.users = []) : true;
      const searchData = {
        query: {
          q: data,
        },
      };
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => searchData, 700);
    },
    clean() {
      this.search = '';
      this.$emit('input', this.search);
      this.inputSearch();
    },
    loadMore() {
      if (this.mayHaveMore) {
        this.mayHaveMore = false;
        const offset = this.users.length;
        this.$apollo.queries.users.fetchMore({
          variables: {
            query: this.query,
            offset,
          },
          updateQuery: (previousResult, { fetchMoreResult }) => {
            this.mayHaveMore = !!fetchMoreResult.users.length;
            return {
              users: [...previousResult.users, ...fetchMoreResult.users],
            };
          },
        });
      }
    },
    async refreshSearchList() {
      await this.$apollo.queries.users.refetch();
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
  gap: 10px;
  background-color: white;
  padding: 15px;
  border-radius: 0px;
  -moz-box-shadow-bottom: 1px 2px 1px rgba(0, 0, 0, 0.1);
  -webkit-box-shadow-bottom: 1px 2px 1px rgba(0, 0, 0, 0.1);
  box-shadow: 1px 2px 1px rgba(0, 0, 0, 0.1);
}
/* .search-bar {
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
} */
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
  right: 10px;
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
  width: 100%;
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
