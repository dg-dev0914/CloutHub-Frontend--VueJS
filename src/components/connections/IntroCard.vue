<template>
  <div class="ch-intro-card">
    <b-list-group flush>
      <b-list-group-item class="title cs-textstyle-paragraph-bold">
        About
        <app-username v-if="!isPreview" :user="user" />
      </b-list-group-item>
      <b-list-group-item v-if="notUpdatedAndLoggedIn === 'yes'">
        <cs-empty-state>
          <div slot>
            <div class="slot-text">Update your profile</div>
            <cs-button
              v-router-link="{
                name: 'EditProfile',
                params: { id: user.id },
              }"
              size="small"
              class="cursor-pointer"
              variant="primary"
            >
              <i class="cs-icons-edit"></i>
              <span>Edit Profile</span>
            </cs-button>
          </div>
        </cs-empty-state>
      </b-list-group-item>
      <b-list-group-item v-if="notUpdatedAndLoggedIn === 'no'">
        <cs-empty-state>
          <div slot class="slot-another-text">
            This user hasn't updated his profile.
          </div>
        </cs-empty-state>
      </b-list-group-item>
      <b-list-group-item v-if="notUpdatedAndLoggedIn === 'updated'">
        <div class="ch-intro-card__info-holder">
          <div
            v-if="user.bio"
            class="cs-textstyle-paragraph-small ch-intro-card__info"
          >
            <i class="cs-icons-info"></i>
            <span class="cs-textstyle-paragraph-small">{{ user.bio }}</span>
          </div>
          <div
            v-if="hasLocation"
            class="cs-textstyle-paragraph-small ch-intro-card__info"
          >
            <a
              :href="`https://www.google.com/maps/search/${validAddress}`"
              target="_blank"
              class="ch_website_link"
              ><i class="cs-icons-marker"></i>
              <span class="ch-intro-card__text">{{ validAddress }}</span></a
            >
          </div>
          <div
            v-if="user.website"
            class="cs-textstyle-paragraph-small ch-intro-card__info"
          >
            <a :href="url" target="_blank" class="ch_website_link"
              ><i class="cs-icons-website"></i>
              <span class="ch-intro-card__text">{{ user.website }}</span></a
            >
          </div>
        </div>
        <div v-if="loggedUserHasLocalOrNationalInterests">
          <div
            class="cs-textstyle-paragraph-small-bold ch-intro-card__politics"
          >
            Interests
          </div>
          <div
            v-if="hasLocalInterests"
            class="ch-intro-card__political-left cs-textstyle-paragraph-small"
          >
            Local Interests
          </div>
          <div v-if="hasLocalInterests" class="tags">
            <cs-small-tag
              v-for="(option, $index) in user.issuesOfInterestLocal"
              :key="$index"
              variant="default"
            >
              {{ option }}
            </cs-small-tag>
          </div>
          <div
            v-if="hasNationalInterests"
            class="ch-intro-card__political-left cs-textstyle-paragraph-small"
          >
            National Interests
          </div>
          <div v-if="hasNationalInterests" class="tags">
            <cs-small-tag
              v-for="(option, $index) in user.issuesOfInterestNational"
              :key="$index"
              variant="default"
            >
              {{ option }}
            </cs-small-tag>
          </div>
        </div>
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>
import $auth from '@/services/auth';
import AppUsername from '@/components/general/Username.vue';

export default {
  components: {
    AppUsername,
  },
  props: {
    user: {
      type: Object,
      required: true,
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      url: '',
      validAddress: '',
    };
  },
  computed: {
    isLogged() {
      return this.user.id === $auth.getUserId();
    },
    hasLocation() {
      return this.user.location && this.validAddress.length > 0;
    },
    hasPoliticalLeaning() {
      return this.user.politicalLeaning && this.isLogged;
    },
    hasPoliticalRegistration() {
      return this.user.politicalRegistration && this.isLogged;
    },
    loggedUserHasPoliticalRegistrationOrLeaning() {
      return (
        (this.user.politicalLeaning || this.user.politicalRegistration) &&
        this.isLogged
      );
    },
    hasLocalInterests() {
      return (
        this.user.issuesOfInterestLocal &&
        this.user.issuesOfInterestLocal.length > 0
      );
    },
    hasNationalInterests() {
      return (
        this.user.issuesOfInterestNational &&
        this.user.issuesOfInterestNational.length > 0
      );
    },
    loggedUserHasLocalOrNationalInterests() {
      return (
        ((this.user.issuesOfInterestLocal &&
          this.user.issuesOfInterestLocal.length > 0) ||
          (this.user.issuesOfInterestNational &&
            this.user.issuesOfInterestNational.length > 0)) &&
        this.isLogged
      );
    },
    notUpdatedAndLoggedIn() {
      let updated;
      if (
        !this.user.bio &&
        !this.user.website &&
        !this.user.location &&
        !this.user.politicalLeaning &&
        !this.user.politicalRegistration &&
        !this.user.issuesOfInterestLocal &&
        !this.user.issuesOfInterestNational &&
        this.isLogged
      ) {
        updated = 'yes';
        return updated;
      }
      if (
        !this.user.bio &&
        !this.user.website &&
        !this.user.location &&
        !this.user.politicalLeaning &&
        !this.user.politicalRegistration &&
        !this.user.issuesOfInterestLocal &&
        !this.user.issuesOfInterestNational &&
        !this.isLogged
      ) {
        updated = 'no';
        return updated;
      }
      updated = 'updated';
      return updated;
    },
  },
  mounted() {
    if (this.user.website) {
      const addHttp = this.user.website.substring(0, 8);
      this.url =
        addHttp === 'https://'
          ? this.user.website
          : `https://${this.user.website}`;
    }
    const location =
      this.user.location &&
      this.user.location.address
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .join(', ');
    this.validAddress = location;
  },
};
</script>

<style scoped>
.list-group-item:first-child {
  padding: 15px;
}

.list-group-item:nth-child(2) {
  padding: 20px 15px;
}
.ch-intro-card__text {
  white-space: -moz-pre-wrap !important;
  white-space: -pre-wrap;
  white-space: -o-pre-wrap;
  white-space: pre-wrap;
  word-wrap: break-word;
  white-space: -webkit-pre-wrap;
  word-break: break-all;
  white-space: normal;
}
.ch-intro-card__info {
  color: var(--cs-gray-05);
  margin-top: 15px;
}

.ch-intro-card__info:first-child {
  margin-top: 0;
}

.ch-intro-card__info i {
  margin-right: 7px;
}

.ch-intro-card__edit-button {
  margin-top: 20px;
  text-align: center;
}
.ch_website_link {
  font-weight: inherit !important;
  font-family: inherit !important;
  font-size: inherit !important;
  line-height: inherit !important;
}

.ch-intro-card__political {
  display: flex;
  justify-content: space-between;
  color: var(--cs-gray-05);
  padding: 1.5px 0px;
}

.ch-intro-card__politics {
  margin-top: 15px;
}
.ch-intro-card__political-left {
  color: var(--cs-gray-05);
}
.tags {
  display: flex;
  flex-direction: row;
  gap: 5px;
  flex-wrap: wrap;
}
.slot-text {
  font-size: 15px;
  margin-bottom: 5px;
  text-align: center;
}
.slot-another-text {
  font-size: 15px;
}
.title >>> .username {
  display: inline-block;
  width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
