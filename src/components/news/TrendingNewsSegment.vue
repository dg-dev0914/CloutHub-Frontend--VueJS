<template>
  <div>
    <div class="mb-2 cs-textstyle-item-heading">Trending Topics</div>
    <div class="">
      <wordcloud
        :data="defaultWords"
        name-key="name"
        value-key="value"
        :color="myColors"
        :show-tooltip="false"
        :font-size="[20, 30]"
      >
      </wordcloud>
    </div>
  </div>
</template>

<script>
import wordcloud from 'vue-wordcloud';

export default {
  components: {
    wordcloud,
  },
  data() {
    return {
      myColors: ['#1f77b4', '#629fc9', '#94bedb', '#c9e0ef'],
      defaultWords: [
        {
          name: 'Surfside',
          value: 9,
        },
        {
          name: 'Covid',
          value: 8,
        },
        {
          name: 'Vaccine',
          value: 7,
        },
        {
          name: 'Flights',
          value: 6,
        },
        {
          name: 'Canada Heat Wave',
          value: 5,
        },
        {
          name: 'Boris Johnson',
          value: 5,
        },
        {
          name: 'Donald Trump',
          value: 4,
        },
        {
          name: 'Lexus',
          value: 3,
        },
        {
          name: 'Apple',
          value: 3,
        },
        {
          name: 'White Privilege',
          value: 3,
        },
        {
          name: 'Freedom Day',
          value: 3,
        },
      ],
    };
  },
};
</script>
