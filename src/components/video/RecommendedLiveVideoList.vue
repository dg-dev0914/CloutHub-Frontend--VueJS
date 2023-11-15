<template>
  <div class="recommended-videos">
    <div class="recommended-videos-header">
      <h3 class="recommended-videos-title">News</h3>
      <cs-button
        v-router-link="{ name: 'VideoListNew', params: { view: 'liveVideos' } }"
        fill="clear"
        variant="info"
        class="view-more-link"
      >
        See more
      </cs-button>
    </div>
    <vue-slick-carousel
      v-if="!$apollo.queries.videos.loading"
      ref="recommendedVideosCarousel"
      v-bind="settings"
      class="recommended-videos-list"
      @init="onSliderInit"
      @beforeChange="onSlideChange"
    >
      <div
        v-for="(video, index) in recommendedVideos"
        class="recommended-video"
        :class="{
          'recommended-video-blocked': activeSlide !== index,
        }"
      >
        <app-video-live-badge
          v-if="video.video.isLive"
          class="recommended-video-live-badge"
        />

        <div class="recommended-video-content">
          <app-video-thumbnail
            class="recommended-video-thumbnail"
            :video="video"
            animated
          />
        </div>

        <div class="recommended-video-channel">
          <div class="recommended-video-channel-avatar-container">
            <app-img
              class="recommended-video-channel-avatar"
              auto-optimize
              :src="video.channelAvatar"
              :alt="video.channelName"
            />
          </div>
          <span class="recommended-video-channel-name">{{
            video.channelName
          }}</span>
        </div>
      </div>
    </vue-slick-carousel>
  </div>
</template>

<script>
import VueSlickCarousel from 'vue-slick-carousel';

import 'vue-slick-carousel/dist/vue-slick-carousel.css';
import 'vue-slick-carousel/dist/vue-slick-carousel-theme.css';

import AppImg from '@/components/general/Img.vue';
import AppVideoLiveBadge from '@/components/video/VideoLiveBadge.vue';
import AppVideoThumbnail from '@/components/video/VideoThumbnail.vue';

import ListRecommendedVideos from '@/gql/videos/ListRecommendedVideos.gql';
import IncrementViewCount from '@/gql/videos/IncrementViewCount.gql';

export default {
  components: {
    VueSlickCarousel,
    AppVideoLiveBadge,
    AppImg,
    AppVideoThumbnail,
  },
  apollo: {
    videos: {
      query: ListRecommendedVideos,
    },
  },

  data() {
    return {
      settings: {
        centerMode: false,
        centerPadding: '0px',
        dots: true,
        arrows: true,
        focusOnSelect: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        touchThreshold: 1,
      },
      activeSlide: 0,
    };
  },
  computed: {
    recommendedVideos() {
      return this.videos
        .filter((video) => video.safe)
        .map((video) => ({
          ...video,
          channelName: this.getChannelName(video.postedByUser),
          channelAvatar: this.getChannelAvatarUrl(video.postedByUser),
        }));
    },
  },
  methods: {
    incrementVideoView(slide) {
      this.$apollo.mutate({
        mutation: IncrementViewCount,
        variables: {
          postId: this.recommendedVideos[slide].id,
        },
      });
    },
    async onSliderInit() {
      await this.$nextTick(); // Slider mounted in DOM
      const lastActiveRecommendedVideo = window.sessionStorage.getItem(
        'lastActiveRecommendedVideo'
      );
      if (lastActiveRecommendedVideo)
        this.$refs.recommendedVideosCarousel.goTo(
          Number(lastActiveRecommendedVideo)
        );
    },
    getChannelName(channel) {
      return channel.channelName || `${channel.displayname}'s Channel`;
    },
    getChannelAvatarUrl(channel) {
      return channel.channelPicture || channel.profilePhotoURL;
    },
    onSlideChange(prevSlide, nextSlide) {
      this.incrementVideoView(nextSlide);
      this.activeSlide = nextSlide;
      window.sessionStorage.setItem('lastActiveRecommendedVideo', nextSlide);
    },
  },
};
</script>

<style scoped>
.recommended-videos >>> .slick-dots {
  top: -35px;
  bottom: initial;
  width: 300px;
  left: 50%;
  margin-left: -150px;
}

.recommended-videos >>> .slick-dots li {
  margin: 0;
}

.recommended-videos >>> .slick-dots li {
  width: 15px;
}

.recommended-videos >>> .slick-dots li button {
  width: 15px;
  height: 15px;
  padding: 0;
}

.recommended-videos >>> .slick-dots li button::before {
  width: 15px;
  height: 15px;
  line-height: 15px;
  font-size: 10px;
  opacity: 1;
  color: #a0a7ad;
}

.recommended-videos >>> .slick-dots li.slick-active button::before {
  color: #000000;
}

.recommended-videos >>> .slick-prev,
.recommended-videos >>> .slick-next {
  top: calc(50% - 20px);
  display: block;
  height: 24px;
  width: 24px;
  background-position: center center;
}

.recommended-videos >>> .slick-prev {
  left: -30px;
  background-image: url('../../assets/icons/arrow_left.svg');
}

.recommended-videos >>> .slick-next {
  right: -30px;
  background-image: url('../../assets/icons/arrow_right.svg');
}

.recommended-videos >>> .slick-prev::before,
.recommended-videos >>> .slick-next::before {
  content: '';
}

.recommended-videos .view-more-link {
  padding: 0;
  font-size: 18px;
}

.recommended-videos {
  margin: 15px 0;
  background-color: var(--cs-gray-00);
  padding: 20px;
  --cs-font-primary: Lato, sans-serf;
  font-family: var(--cs-font-primary);
}

.recommended-videos-header {
  display: flex;
  justify-content: space-between;
}

.recommended-videos-title {
  margin: 0;
  display: flex;
  align-items: center;
  text-transform: uppercase;
  font-size: 18px;
  font-weight: bold;
  color: #000000;
}

.recommended-videos-list {
  max-width: 590px;
  margin: 0 auto;
}

.recommended-video {
  position: relative;
  padding: 10px 5px;
}

.recommended-video-live-badge {
  position: absolute;
  top: 20px;
  left: 20px;
}

.recommended-video-content {
  overflow: hidden;
  height: 360px;
  margin-bottom: 15px;
  border-radius: 8px;
}

.recommended-video-thumbnail {
  height: 100%;
  width: 100%;
  object-fit: contain;
  background-color: #000000;
}

.recommended-video-channel {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.recommended-video-channel-avatar-container {
  overflow: hidden;
  flex: 40px 0 0;
  height: 40px;
  margin-right: 10px;
  border-radius: 40px;
}

.recommended-video-channel-avatar {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.recommended-video-channel-name {
  font-size: 20px;
  font-weight: bold;
  color: var(--cs-gray-05);
}
</style>
