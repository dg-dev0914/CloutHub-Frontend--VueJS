<template>
  <div>
    <div class="explore-video-category-tiles">
      <div
        v-for="cat in categories"
        :key="cat.value"
        class="explore-video-category"
        :label="cat.label"
        :class="{ selected: cat.value == selectedCategory }"
        @click="selectCategory(cat)"
      >
        <app-img :src="cat.img" class="img-category" />
        <div class="text">{{ cat.label }}</div>
      </div>
    </div>
    <div class="video-list">
      <div class="cs-textstyle-section-heading category-title">
        {{ categoryTitle }}
      </div>
      <div v-if="videos && selectedCategory !== 'justTheNews'">
        <app-spinner v-if="$apollo.queries.videos.loading" />
        <app-video-list :videos="videos"></app-video-list>
        <app-infinite-simple
          :query="$apollo.queries.videos"
          sort-key="createdAt"
        ></app-infinite-simple>
      </div>
      <div v-if="justTheNews && selectedCategory === 'justTheNews'">
        <app-spinner v-if="$apollo.queries.justTheNews.loading" />
        <app-just-the-news-video-list
          :videos="justTheNews"
        ></app-just-the-news-video-list>
        <app-infinite-simple
          :query="$apollo.queries.justTheNews"
          sort-key="createdAt"
        ></app-infinite-simple>
      </div>
    </div>
  </div>
</template>

<script>
import categories from '@/assets/config/videocategories.json';
import ListCategoryVideos from '@/gql/videos/ListCategoryVideos.gql';

import AppVideoList from '@/components/video/new/VideoListNew.vue';
import AppImg from '@/components/general/Img.vue';
import AppSpinner from '@/components/general/Spinner.vue';
import AppInfiniteSimple from '@/components/general/InfiniteSimple.vue';

export default {
  components: {
    AppVideoList,
    AppImg,
    AppSpinner,
    AppInfiniteSimple,
  },
  apollo: {
    videos: {
      query: ListCategoryVideos,
      variables() {
        return {
          category: this.selectedCategory,
        };
      },
    },
  },
  data() {
    return {
      categories,
      selectedCategory: 'news',
      categoryTitle: 'News',
    };
  },
  methods: {
    selectCategory(cat) {
      this.selectedCategory = cat.value;
      this.categoryTitle = cat.label;
    },
  },
};
</script>

<style scoped>
.explore-video-category-wrapper {
  overflow-x: scroll;
}
.explore-video-category-tiles {
  width: 1046px;
  padding: 10px;
}
.explore-video-category {
  position: relative;
  background-color: transparent;
  color: #fff;
  font-size: 14px;
  width: 106px;
  display: inline-flex;
  margin-right: 7px;
  border-radius: 5px;
  height: 65px;
}
.explore-video-category.selected {
  box-shadow: 0px 0px 2px 2px var(--cs-primary-base);
  border-radius: 5px;
}
.video-list {
  margin-top: 5px;
}
.text {
  position: absolute;
  bottom: 5px;
  left: 5px;
}
.img-category {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 5px;
  opacity: 0.9;
}
.category-title {
  margin-left: 10px;
  margin-bottom: 10px;
}
* >>> .ch-video-item__header {
  height: 150px;
}
* >>> .ch-video-item {
  border-radius: 0px;
}
</style>
