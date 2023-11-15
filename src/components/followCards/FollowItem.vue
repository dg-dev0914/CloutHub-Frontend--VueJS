<template>
  <div class="ch-follow-item">
    <div class="ch-follow-item__info" @click="openProfilePreview">
      <div class="ch-follow-item__background">
        <app-img
          v-if="person.bannerImageURL"
          :src="person.bannerImageURL"
          :original="false"
          class="ch-follow-item__background-img"
          :width="250"
        />
        <app-img
          v-else
          class="ch-follow-item__background-img"
          :src="require('@/assets/images/placeholders/profile-banner.png')"
        />
      </div>
      <div class="ch-follow-item__avatar">
        <app-avatar
          :picture="person.profilePhotoURL"
          :name="person.firstname"
          variant="primary"
          size="medium"
          class="img-class"
          :original="false"
        />
      </div>
      <div class="cs-textstyle-paragraph-bold">{{ person.username }}</div>
      <div class="ch-follow-item__bio cs-textstyle-paragraph-extra-small">
        {{ person.bio }}
      </div>
    </div>
    <app-follow-button
      v-if="user"
      :target="user"
      size="small"
    ></app-follow-button>
  </div>
</template>

<script>
import $bus from '@/services/bus';
import AppFollowButton from '@/components/general/FollowButton.vue';
import AppAvatar from '@/components/general/Avatar.vue';
import AppImg from '@/components/general/Img.vue';
import GetProfile from '@/gql/general/GetProfile.gql';

export default {
  components: {
    AppFollowButton,
    AppAvatar,
    AppImg,
  },
  props: {
    person: {
      type: Object,
      required: true,
    },
  },
  apollo: {
    user: {
      query: GetProfile,
      variables() {
        return {
          id: this.person.id,
        };
      },
      skip() {
        return !this.person.id;
      },
    },
  },
  methods: {
    openProfilePreview() {
      $bus.$emit('profile-preview-modal', this.person);
    },
  },
};
</script>

<style scoped>
.ch-follow-item {
  display: flex;
  flex-direction: column;
  height: 220px;
  margin: 0 4px;
  align-items: center;
  background-color: white;
  border-radius: 5px;
  overflow: hidden;
  border: solid 1px var(--cs-gray-02);
}
.ch-follow-item__info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
  cursor: pointer;
  width: 100%;
}
.ch-follow-item__background {
  width: 100%;
}
.ch-follow-item__background-img {
  width: 100%;
  height: 80px;
  object-fit: cover;
}
.ch-follow-item__avatar {
  margin-top: -35px;
}
.ch-follow-item__bio {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  height: 35px;
  overflow: hidden;
  text-align: center;
  padding-left: 15px;
  padding-right: 15px;
  color: var(--cs-gray-05);
}
</style>
