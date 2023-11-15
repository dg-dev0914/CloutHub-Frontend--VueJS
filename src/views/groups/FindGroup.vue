<template>
  <app-group-page>
    <groups-page-sub-header page-name="FindGroup" />
    <div class="categories">
      <router-link
        v-for="cat in categories"
        :key="cat.value"
        :to="{ name: 'GroupCategory', params: { category: cat.value } }"
        class="category-item"
      >
        <app-img :src="cat.img" auto-optimize class="category-item-img" />
        <span class="category-item-label">
          {{ cat.label }}
        </span>
      </router-link>
    </div>

    <router-view :key="$route.fullPath" />
  </app-group-page>
</template>

<script>
import AppGroupPage from '@/components/groups/GroupPage.vue';
import AppImg from '@/components/general/Img.vue';
import categories from '@/assets/config/groupcategories.json';
import GroupsPageSubHeader from '@/components/groups/GroupsPageSubHeader.vue';

export default {
  components: {
    GroupsPageSubHeader,
    AppImg,
    AppGroupPage,
  },
  data() {
    return {
      categories,
    };
  },
};
</script>

<style scoped>
.categories {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding: 5px;
  margin-bottom: 10px;
}

.category-item {
  position: relative;
  display: block;
  flex: 0 0 115px;
  height: 95px;
  margin: 5px;
}

.category-item.router-link-active::after {
  content: '';
  position: absolute;
  top: -5px;
  left: -5px;
  display: block;
  height: calc(100% + 10px);
  width: calc(100% + 10px);
  border-radius: 7px;
  border: solid 3px #e2896e;
}

.category-item-img {
  overflow: hidden;
  height: 100%;
  width: 100%;
  border-radius: 4px;
}

.category-item-label {
  position: absolute;
  bottom: 7px;
  left: 7px;
  font-size: 12px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  letter-spacing: normal;
  color: #fff;
}
</style>
