<template>
  <div class="ch-follow-list">
    <cs-spinner v-if="!people" class="ch-spinner" />
    <vue-slick-carousel v-if="people && people.length > 0" v-bind="settings">
      <div v-for="person in people" :key="person.id">
        <app-follow-item :person="person"></app-follow-item>
      </div>
    </vue-slick-carousel>
    <cs-empty-state
      v-if="!people.length"
      title="No Matching Recommendations"
      class="ch-follow-list__empty cs-textstyle-detail-heading"
    ></cs-empty-state>
  </div>
</template>

<script>
import AppFollowItem from '@/components/followCards/FollowItem.vue';
import VueSlickCarousel from 'vue-slick-carousel';
import 'vue-slick-carousel/dist/vue-slick-carousel.css';
import 'vue-slick-carousel/dist/vue-slick-carousel-theme.css';

export default {
  components: {
    AppFollowItem,
    VueSlickCarousel,
  },
  props: {
    people: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      settings: {
        dots: false,
        focusOnSelect: false,
        infinite: false,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 3,
        touchThreshold: 5,
      },
    };
  },
};
</script>

<style scoped>
.ch-follow-list__empty {
  border: dashed 1px var(--cs-gray-02);
  border-radius: 10px;
  margin-top: 10px;
  flex: 1;
}
* >>> .cs-textstyle-page-title {
  font-size: 16px !important;
}
</style>
