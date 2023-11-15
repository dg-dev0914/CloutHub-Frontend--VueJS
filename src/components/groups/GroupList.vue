<template>
  <div class="group-list-container">
    <div
      v-if="groups && groups.length"
      class="group-list"
      :class="{ 'group-list-two-columns': twoColumns }"
    >
      <h2 v-if="title" class="group-list-title">{{ title }}</h2>
      <app-group-item
        v-for="group in groups"
        :key="group.id"
        class="group-list-item"
        :group="group"
        :show-menu="!hideItemMenu"
      />
      <app-infinite-offset :query="$apollo.queries.groups" />
    </div>
    <app-spinner v-else-if="$apollo.queries.groups.loading" />
    <template v-else-if="!$apollo.queries.groups.loading">
      <slot name="no-results"></slot>
    </template>
  </div>
</template>

<script>
import $apollo from '@/services/apollo';

import AppInfiniteOffset from '@/components/general/InfiniteOffset.vue';
import AppSpinner from '@/components/general/Spinner.vue';
import AppGroupItem from './GroupItem.vue';

export default {
  components: {
    AppGroupItem,
    AppSpinner,
    AppInfiniteOffset,
  },
  props: {
    groupsQuery: {
      type: Object,
      required: true,
      default: () => {},
    },
    queryVariables: {
      type: Object,
      default: () => {},
    },
    queryFieldName: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      required: false,
      default: '',
    },
    hideItemMenu: {
      type: Boolean,
      default: false,
    },
    twoColumns: {
      type: Boolean,
      default: false,
    },
  },
  apollo: {
    groups: {
      query() {
        return this.groupsQuery;
      },
      variables() {
        return this.queryVariables;
      },
      fetchPolicy: 'cache-first',
    },
  },
  destroyed() {
    if (!this.queryFieldName) {
      return;
    }

    // This is a workaround. Combining with fetchPolicy: cache-first,
    // the list is not reloaded until the page is left
    $apollo.cache.evict({
      id: 'ROOT_QUERY',
      fieldName: this.queryFieldName,
    });
  },
};
</script>

<style scoped>
.group-list-container {
  padding: 10px;
}

.group-list-title {
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: bold;
  color: #000;
}

.group-list.group-list-two-columns {
  display: flex;
  flex-wrap: wrap;
}

.group-list-two-columns .group-list-item {
  overflow: hidden;
  flex: 0 0 50%;
}
</style>
