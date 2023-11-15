<template>
  <div>
    <b-container fluid="xl">
      <b-row>
        <b-col md="2">
          <app-page-menu title="People">
            <app-page-menu-item
              v-for="item in menuItems"
              :key="item.view"
              :label="item.label"
              :to="{ name: item.name, params: { view: item.view } }"
            />
          </app-page-menu>
        </b-col>
        <b-col md="10">
          <router-view :key="$route.fullPath" />
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import $auth from '@/services/auth';
import AppPageMenu from '@/components/general/PageMenu.vue';
import AppPageMenuItem from '@/components/general/PageMenuItem.vue';

export default {
  components: {
    AppPageMenu,
    AppPageMenuItem,
  },
  data() {
    return {
      menuItems: [
        { name: 'UserList', view: 'recommended', label: 'Recommended' },
        { name: 'ConnectionsFind', view: 'find', label: 'Find' },
        { name: 'UserList', view: 'friends', label: 'Friends' },
        { name: 'UserList', view: 'following', label: 'Following' },
        { name: 'UserList', view: 'followers', label: 'Followers' },
      ],
    };
  },
  computed: {
    me() {
      return {
        id: $auth.getUserId(),
      };
    },
  },
};
</script>
