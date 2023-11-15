<template>
  <div class="ch-profile-preview">
    <app-modal
      :show="showProfilePreview"
      class="profile-preview__modal"
      :title="person.displayname"
      @close="closePreview()"
    >
      <div v-if="user" class="ch-profile-preview">
        <app-img
          v-if="user.bannerImageURL"
          :original="false"
          :width="800"
          :src="user.bannerImageURL"
          class="ch-profile-preview__cover ch-profile-preview__center-item"
          @click="goToFullProfile"
        />
        <app-img
          v-else
          :src="defaultPicture"
          class="ch-profile-preview__cover ch-profile-preview__center-item"
          @click="goToFullProfile"
        />
        <app-avatar
          class="ch-profile-preview__avatar ch-profile-preview__center-item"
          size="large"
          :width="300"
          :name="user.username"
          :picture="user.profilePhotoURL"
          @click="goToFullProfile"
        ></app-avatar>
        <div
          class="cs-textstyle-detail-heading ch-profile-preview__center-item"
        >
          {{ user.displayname }}
        </div>
        <div
          class="
            cs-textstyle-paragraph-small
            text-light
            ch-profile-preview__center-item
          "
        >
          <app-username :user="user" />
          <div v-if="user.location" class="ch-profile-preview__center-item">
            <i class="cs-icons-marker"></i>{{ user.location.address }}
          </div>
          <div class="ch-profile-preview__interacting-buttons">
            <app-follow-button
              :target="user"
              size="small"
              class="ch-profile__button-follow"
            ></app-follow-button>
            <app-friend-button
              :target="user"
              size="small"
              class="ch-profile__button-friend"
            ></app-friend-button>
            <cs-button
              class="ch-profile__button-message"
              size="small"
              @click="openNewMessageModal"
              ><i class="cs-icons-email cs-email"></i>Message</cs-button
            >
          </div>
        </div>
        <div class="ch-profile-preview__body">
          <div
            v-if="user.bio"
            class="ch-profile-preview__about ch-profile-preview__common-styles"
          >
            <div
              class="
                ch-profile-preview__about--header
                cs-textstyle-paragraph-bold
              "
            >
              About {{ user.username }}
            </div>
            <div
              class="
                ch-profile-preview__about--bio
                cs-textstyle-paragraph-small
              "
            >
              {{ user.bio }}
            </div>
          </div>
          <div
            v-if="hasBothInterest"
            class="
              ch-profile-preview__interest ch-profile-preview__common-styles
            "
          >
            <div
              class="
                ch-profile-preview__interest--header
                cs-textstyle-paragraph-bold
              "
            >
              Interest
            </div>
            <div
              v-if="
                user.issuesOfInterestLocal &&
                user.issuesOfInterestLocal.length > 0
              "
              class="ch-profile-preview__interest--local"
            >
              <div
                class="
                  ch-profile-preview__interest--local--header
                  cs-textstyle-paragraph
                "
              >
                Local Interest
              </div>
              <div class="ch-profile-preview__interest--body">
                <cs-small-tag
                  v-for="(option, $index) in user.issuesOfInterestLocal"
                  :key="$index"
                  variant="default"
                >
                  {{ option }}
                </cs-small-tag>
              </div>
            </div>
            <div
              v-if="
                user.issuesOfInterestNational &&
                user.issuesOfInterestNational.length > 0
              "
              class="ch-profile-preview__interest--national"
            >
              <div
                class="
                  ch-profile-preview__interest--national--header
                  cs-textstyle-paragraph
                "
              >
                National Interest
              </div>
              <div class="ch-profile-preview__interest--body">
                <cs-small-tag
                  v-for="(option, $index) in user.issuesOfInterestNational"
                  :key="$index"
                  variant="default"
                >
                  {{ option }}
                </cs-small-tag>
              </div>
            </div>
          </div>
          <!-- They might want to show this in future? -->
          <!-- <div
            v-if="user.politicalLeaning || user.politicalRegistration"
            class="
              ch-profile-preview__political ch-profile-preview__common-styles
            "
          >
            <div
              class="
                ch-profile-preview__political--header
                cs-textstyle-paragraph-bold
              "
            >
              Political Views
            </div>
            <div
              v-if="user.politicalLeaning"
              class="ch-profile-preview__political--views"
            >
              <div>Political Leaning</div>
              <div>{{ user.politicalLeaning }}</div>
            </div>
            <div
              v-if="user.politicalRegistration"
              class="ch-profile-preview__political--views"
            >
              <div>Political Registration</div>
              <div>{{ user.politicalRegistration }}</div>
            </div>
          </div> -->
          <div
            class="
              ch-profile-preview__recommendations
              cs-textstyle-paragraph-bold
            "
          >
            <app-follow-card-segment
              :count="3"
              :is-preview="isPreview"
              :followers="people"
              :title="title"
            />
          </div>
          <div
            class="
              ch-profile-preview__bottom-button
              cs-textstyle-paragraph-bold
            "
            @click="goToFullProfile"
          >
            View Full Profile
          </div>
        </div>
      </div>
    </app-modal>
  </div>
</template>

<script>
import $bus from '@/services/bus';
import GetProfile from '@/gql/general/GetProfile.gql';
import ListFollowingByUserId from '@/gql/connections/ListFollowingByUserId.gql';

import AppModal from '@/components/general/Modal.vue';
import AppAvatar from '@/components/general/Avatar.vue';
import AppUsername from '@/components/general/Username.vue';
import AppImg from '@/components/general/Img.vue';
import AppFriendButton from '@/components/general/FriendButton.vue';
import AppFollowButton from '@/components/general/FollowButton.vue';
import AppFollowCardSegment from '@/components/followCards/FollowCardSegment.vue';

const defaultPicture = require('@/assets/images/placeholders/profile-banner.png');

export default {
  components: {
    AppModal,
    AppAvatar,
    AppImg,
    AppUsername,
    AppFriendButton,
    AppFollowButton,
    AppFollowCardSegment,
  },
  apollo: {
    user: {
      query: GetProfile,
      fetchPolicy: 'cache-only',
    },
    people: {
      query: ListFollowingByUserId,
      fetchPolicy: 'cache-only',
    },
  },
  data() {
    return {
      showProfilePreview: false,
      user: {},
      person: {},
      defaultPicture,
      isPreview: true,
    };
  },
  watch: {
    showProfilePreview(opened) {
      if (!opened) return;
      this.$apollo.queries.user.refetch({
        id: this.person.id,
      });
      this.$apollo.queries.people.refetch({
        userId: this.person.id,
      });
    },
  },
  computed: {
    hasBothInterest() {
      return (
        (this.user.issuesOfInterestLocal &&
          this.user.issuesOfInterestLocal.length > 0) ||
        (this.user.issuesOfInterestNational &&
          this.user.issuesOfInterestNational.length > 0)
      );
    },
    title() {
      return `${this.person.displayname} follows`;
    },
  },
  mounted() {
    $bus.$on('profile-preview-modal', (params) => {
      this.showProfilePreview = true;
      this.person = params;
    });
  },
  methods: {
    closePreview() {
      this.showProfilePreview = false;
    },
    // Open a new message modal
    openNewMessageModal() {
      $bus.$emit('new-message-modal', { user: this.user });
    },
    // Go to Full Profile
    goToFullProfile() {
      this.$router.push({
        name: 'Profile',
        params: this.user,
      });
    },
  },
};
</script>

<style scoped>
.ch-profile-preview {
  display: flex;
  align-items: center;
  flex-direction: column;
  position: relative;
  border: none !important;
}
.ch-profile-preview__cover {
  position: absolute;
  height: 100px;
  width: 100%;
  background-size: cover;
  background-position: center;
  background-color: #efefef;
  object-fit: cover;
}
.ch-profile-preview__avatar {
  display: inline-block;
  margin-top: 50px;
  margin-bottom: 5px;
  border: 2px solid #fff;
}
.ch-profile-preview__center-item {
  text-align: center;
}
.ch-profile-preview__body {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 20px;
  font-size: var(--cs-font-size-100);
  border-top: solid 1px var(--cs-gray-02);
}

* >>> .ch-modal__body {
  padding: 0px;
  background: var(--cs-gray-00);
}
.ch-profile-preview__interacting-buttons {
  display: flex;
  flex-direction: row;
  gap: 6px;
  margin-top: 5px;
}
.cs-email {
  margin-right: 5px;
}

.ch-profile-preview__interest--body {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 5px 0px;
}
.ch-profile-preview__political--views {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}
.ch-profile-preview__interest {
  margin-top: 20px;
}
.ch-profile-preview__political {
  margin-top: 20px;
  width: 50%;
}
.ch-profile-preview__interest--national--header {
  margin-top: 5px;
}
.ch-profile-preview__recommendations {
  margin-top: 20px;
  margin-bottom: 25px;
}
.ch-profile-preview__bottom-button {
  position: fixed;
  bottom: 0px;
  width: 100%;
  padding: 10px 0px !important;
  margin: 0px !important;
  background: var(--cs-gray-00);
  border-top: 1px solid var(--cs-gray-02);
  cursor: pointer;
  text-align: center;
}
.ch-profile-preview__common-styles {
  padding: 0px 25px;
  margin-top: 10px;
}
.ch-profile-preview__about--bio {
  color: var(--cs-gray-05);
}
</style>
