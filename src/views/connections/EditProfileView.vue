<template>
  <div>
    <app-spinner v-if="!user"></app-spinner>
    <b-container v-if="user" fluid="xl">
      <div>
        <app-profile-banner-editor v-model="user.bannerImageURL" />
        <div class="edit-profile-details__profile-info">
          <div class="edit-profile-details__info-button">
            <div class="edit-profile-details__info-only">
              <app-profile-avatar-editor
                v-model="user.profilePhotoURL"
                :name="user.name"
              />
              <h3 class="cs-textstyle-item-heading">
                <app-username :user="user" type="displayname" />
              </h3>
              <p class="cs-textstyle-paragraph">{{ user.username }}</p>
            </div>
            <div class="edit-profile-details__button-only">
              <div class="edit-profile-details__first-row">
                <cs-button
                  size="small"
                  class="edit-profile-details__save-button"
                  :disabled="saving"
                  @click="updateProfile()"
                >
                  Save Profile
                </cs-button>
                <cs-button
                  variant="secondary"
                  fill="outline"
                  size="small"
                  @click="cancel"
                >
                  Cancel
                </cs-button>
              </div>
              <!-- SAVING -->
              <div v-if="saving" class="edit-profile-details__saving">
                <app-spinner></app-spinner>
                <span v-if="showBannerUploadProgress">
                  Uploading Banner {{ uploadProgress }}%
                </span>
                <span v-if="showProfileUploadProgress">
                  Uploading Profile {{ uploadProgress }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <b-row>
        <b-container class="mt-1">
          <cs-alert variant="primary">
            <div slot="content">
              To edit your username, email address or password, please visit
              <b v-router-link="{ name: 'Settings' }" class="settings-text"
                >Settings</b
              >.
            </div>
            <i slot="close-icon" class="cs-icons-close"></i>
          </cs-alert>
          <cs-alert
            v-if="isVerified"
            variant="primary"
            class="edit-profile-details__second-alert"
          >
            <div slot="content">
              You're a verified user. To change your first name, last name,
              display name, or username, please contact
              <b>support@clouthub.com</b>
            </div>
            <i slot="close-icon" class="cs-icons-close"></i>
          </cs-alert>
        </b-container>
        <b-col>
          <!-- Public Details -->
          <div class="edit-profile-details">
            <div
              class="
                edit-profile-details__personal-details
                cs-textstyle-item-heading
              "
            >
              Public Profile
              <div class="cs-textstyle-paragraph-small text-light">
                Your Public Profile is visible to everyone on CloutHub.
              </div>
            </div>
            <div class="edit-profile-details__fields">
              <!-- Profile Details  -->
              <div class="cs-textstyle-detail-heading">Profile Details</div>
              <!-- Display Name -->
              <cs-input
                v-model="user.displayname"
                placeholder="Your display name"
                label="Display Name"
                :disabled="user.badgeType != null && user.badgeType != 'none'"
              />
              <!-- Bio -->
              <app-textarea
                v-model="user.bio"
                label="Profile Bio"
                placeholder="Tell us about yourself..."
                maxlength="160"
              />
              <div
                class="
                  edit-profile-details__bio-char-count
                  cs-textstyle-paragraph-small
                "
              >
                {{ 160 - ((user.bio && user.bio.length) || 0) }}/160 Characters
                Left
              </div>
              <cs-input
                v-model="user.website"
                label="Website"
                type="url"
                placeholder="Website"
              >
              </cs-input>
              <!-- location  -->
              <div class="edit-profile-details">
                <div class="cs-textstyle-detail-heading">Location</div>
                <div class="">
                  <app-profile-location-input
                    v-model="user.location"
                  ></app-profile-location-input>
                </div>
              </div>
              <!-- Local Interest -->
              <app-local-interest v-model="user.issuesOfInterestLocal" />
              <!-- National Interest -->
              <app-national-interest v-model="user.issuesOfInterestNational" />
            </div>
          </div>
        </b-col>
        <b-col>
          <div class="edit-profile-details">
            <div
              class="
                edit-profile-details__personal-details
                cs-textstyle-item-heading
              "
            >
              Private Profile
              <div class="cs-textstyle-paragraph-small text-light">
                Your Private Profile is only visible to your friends.
              </div>
            </div>
            <div class="edit-profile-details__fields">
              <!-- First Name -->
              <cs-input
                v-model="user.firstname"
                placeholder="Your first name"
                label="First Name"
                :disabled="isVerified"
              />

              <!-- Last Name -->
              <cs-input
                v-model="user.lastname"
                placeholder="Your last name"
                label="Last Name"
                :disabled="isVerified"
              />
              <!-- Phone Number  -->
              <cs-input
                v-model="user.phoneNo"
                placeholder="Your phone number"
                label="Phone Number"
              />

              <!-- Date of Birth -->
              <cs-date-input
                v-model="user.dob"
                class=""
                type="date"
                label="Date of Birth"
              />
              <!-- Gender -->
              <div
                class="
                  edit-profile-details__gender-labels
                  cs-textstyle-label-text
                "
              >
                Gender
              </div>
              <cs-radio-group
                v-model="user.gender"
                :options="genderOptions"
                class="edit-profile-details__radio"
                @input="genderInput"
              ></cs-radio-group>
              <div v-if="genderInputShow">
                <cs-input
                  v-model="genderInputForm"
                  type="text"
                  class="edit-profile-details__form-input"
                  placeholder="Enter your gender"
                />
              </div>
            </div>
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import $aws from '@/services/aws';
import $auth from '@/services/auth';

import GetMe from '@/gql/general/GetMe.gql';
import UpdateUser from '@/gql/general/UpdateUserExample.gql';
import GetProfile from '@/gql/general/GetProfile.gql';
import ListLiveMeetings from '@/gql/meetings/ListLiveMeetings.gql';

import AppTextarea from '@/components/general/Textarea.vue';
import AppProfileBannerEditor from '@/components/connections/editor/ProfileBannerEditor.vue';
import AppProfileAvatarEditor from '@/components/connections/editor/ProfileAvatarEditor.vue';
import AppProfileLocationInput from '@/components/connections/editor/ProfileLocationInput.vue';
import AppSpinner from '@/components/general/Spinner.vue';
import AppUsername from '@/components/general/Username.vue';
import AppLocalInterest from '@/components/connections/editor/LocalInterest.vue';
import AppNationalInterest from '@/components/connections/editor/NationalInterest.vue';
import AppToggle from '@/components/general/CsToggle.vue';

export default {
  components: {
    AppTextarea,
    AppProfileBannerEditor,
    AppProfileAvatarEditor,
    AppProfileLocationInput,
    AppSpinner,
    AppUsername,
    AppLocalInterest,
    AppNationalInterest,
    AppToggle,
  },
  data() {
    return {
      user: null,
      saving: false,
      showBannerUploadProgress: false,
      showProfileUploadProgress: false,
      uploadProgress: 0,
      showInput: false,
      showPRInput: false,
      genderOptions: ['Male', 'Female', 'Other'],
      genderInputForm: '',
      politicalRegistrationFormInput: '',
      politicalRegistrationOptions: [
        { label: 'Democrat', value: 'Democrat' },
        { label: 'Republican', value: 'Republican' },
        { label: 'Independent', value: 'Independent' },
        { label: 'Green Party', value: 'Green Party' },
        { label: 'Libertarian', value: 'Libertarian' },
        { label: 'Decline to State', value: 'Decline to State' },
        { label: 'Other', value: 'Other' },
      ],
      politicalLeaningOptions: [
        { label: 'Conservative', value: 'Conservative' },
        { label: 'Liberal', value: 'Liberal' },
        { label: 'Middle of the road', value: 'Middle of the road' },
        { label: 'Decline to State', value: 'Decline to State' },
        { label: 'None', value: 'none' },
      ],
    };
  },
  computed: {
    genderInputShow() {
      if (this.showInput || this.user.gender === 'Other') {
        return true;
      }
      return false;
    },
    isVerified() {
      if (this.user.badgeType !== null && this.user.badgeType !== 'none') {
        return true;
      }
      return false;
    },
  },
  mounted() {
    this.fetchProfile();
  },
  methods: {
    politicalRegistrationInput(val) {
      if (val.value === 'Other') {
        this.showPRInput = true;
      } else {
        this.politicalRegistrationFormInput = '';
        this.user.politicalRegistration = val.value;
        this.showPRInput = false;
      }
    },
    genderInput(val) {
      if (val === 'Other') {
        this.showInput = true;
      } else {
        this.genderInputForm = '';
        this.user.gender = val;
        this.showInput = false;
      }
    },
    async fetchProfile() {
      const resp = await this.$apollo.query({
        query: GetMe,
      });
      this.user = { ...resp.data.user };

      // dob
      if (!this.user.dob) {
        this.user.dob = '';
      }
      // Gender;
      if (
        this.user.gender !== 'Male' &&
        this.user.gender !== 'Female' &&
        this.user.gender != null
      ) {
        this.genderInputForm = this.user.gender;
        this.user.gender = 'Other';
      }
      // Political Registration
      if (
        this.user.politicalRegistration !== 'Democrat' &&
        this.user.politicalRegistration !== 'Republican' &&
        this.user.politicalRegistration !== 'Independent' &&
        this.user.politicalRegistration !== 'Green Party' &&
        this.user.politicalRegistration !== 'Decline to State' &&
        this.user.politicalRegistration !== 'Libertarian' &&
        this.user.politicalRegistration !== null
      ) {
        this.politicalRegistrationFormInput = this.user.politicalRegistration;
        this.user.politicalRegistration = 'Other';
      }
    },
    onSelectPoliticalLeaning(val) {
      if (val.value === 'none') {
        this.user.politicalLeaning = '';
      } else {
        this.user.politicalLeaning = val.value;
      }
    },
    async updateProfile() {
      this.saving = true;
      if (this.user.gender === 'Other') {
        this.user.gender = this.genderInputForm;
      }
      if (this.user.politicalRegistration === 'Other') {
        this.user.politicalRegistration = this.politicalRegistrationFormInput;
      }
      const finalDob = new Date(this.user.dob);
      const variables = {
        bio: this.user.bio ? this.user.bio : '',
        website: this.user.website ? this.user.website : '',
        bannerImageURL: this.user.bannerImageURL,
        profilePhotoURL: this.user.profilePhotoURL,
        location: this.user.location,
        privateLocation: false,
        firstname: this.user.firstname,
        lastname: this.user.lastname,
        displayname: this.user.displayname,
        gender: this.user.gender ? this.user.gender : '',
        politicalLeaning: this.user.politicalLeaning
          ? this.user.politicalLeaning
          : '',
        politicalRegistration: this.user.politicalRegistration
          ? this.user.politicalRegistration
          : '',
        issuesOfInterestLocal: this.user.issuesOfInterestLocal,
        issuesOfInterestNational: this.user.issuesOfInterestNational,
        dob: finalDob || null,
        phoneNo: this.user.phoneNo ? this.user.phoneNo : '',
        badgeType: this.user.badgeType,
        username: this.user.username,
      };
      if (
        variables.bannerImageURL &&
        variables.bannerImageURL.startsWith('data:')
      ) {
        this.showBannerUploadProgress = true;
        this.uploadProgress = 0;
        variables.bannerImageURL = await $aws.uploadDataURL(
          variables.bannerImageURL,
          'connections.png',
          (progress) => {
            this.uploadProgress = progress;
          },
          'profile'
        );
        this.showBannerUploadProgress = false;
      }
      if (
        variables.profilePhotoURL &&
        variables.profilePhotoURL.startsWith('data:')
      ) {
        this.showProfileUploadProgress = true;
        this.uploadProgress = 0;
        variables.profilePhotoURL = await $aws.uploadDataURL(
          variables.profilePhotoURL,
          'banner.png',
          (progress) => {
            this.uploadProgress = progress;
          },
          'profile'
        );
        this.showProfileUploadProgress = false;
      }
      await this.$apollo.mutate({
        mutation: UpdateUser,
        variables,
        optimisticResponse: {
          update_user_data: {
            __typename: 'User',
            id: this.user.id,
            ...variables,
          },
        },
        refetchQueries: [{ query: ListLiveMeetings }],
        update: async (cache) => {
          const me = await $auth.getUser();
          const additionalCacheData = {
            mutual_local_interests: this.user.mutual_local_interests || '',
            mutual_national_interests:
              this.user.mutual_national_interests || '',
            mutual_followers: this.user.mutual_followers,
            mutual_following: this.user.mutual_following,
            mutual_friends: this.user.mutual_friends,
            myRelationship: me.myRelationship,
            allowUnsolicitedMessages: this.user.allowUnsolicitedMessages,
            enablePayments: me.enablePayments,
            createdAt: me.createdAt,
            followingCount: this.user.followingCount,
            followerCount: this.user.followerCount,
            badgeType: this.user.badgeType || '',
            id: this.user.id,
            friendCount: this.user.friendCount,
            isLiveStreaming: this.user.isLiveStreaming,
            role: me.role || '',
          };
          cache.writeQuery({
            query: GetProfile,
            variables: {
              id: me.id,
            },
            data: {
              user: { ...variables, ...additionalCacheData },
            },
          });
        },
      });

      // Gender
      if (
        this.user.gender !== 'Male' &&
        this.user.gender !== 'Female' &&
        this.user.gender != null
      ) {
        this.genderInputForm = this.user.gender;
        this.user.gender = 'Other';
      }
      // Political Registration
      if (
        this.user.politicalRegistration !== 'Democrat' &&
        this.user.politicalRegistration !== 'Republican' &&
        this.user.politicalRegistration !== 'Independent' &&
        this.user.politicalRegistration !== 'Green Party' &&
        this.user.politicalRegistration !== 'Decline to State' &&
        this.user.politicalRegistration !== 'Libertarian' &&
        this.user.politicalRegistration !== null
      ) {
        this.politicalRegistrationFormInput = this.user.politicalRegistration;
        this.user.politicalRegistration = 'Other';
      }
      this.saving = false;
      this.user = null;
      this.$router
        .push({
          name: 'UProfile',
          params: {
            username: variables.username.replace('@', ''),
          },
        })
        .then(() => window.location.reload());
    },
    cancel() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>
.edit-profile-details__fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 20px;
  padding-bottom: 20px;
}
.edit-profile-details__location-toggle {
  margin-bottom: 20px;
}
.edit-profile-details {
  background-color: white;
  margin-top: 20px;
}
.edit-profile-details__personal-details {
  padding: 20px;
  border-bottom: 1px solid var(--cs-gray-02);
}
.edit-profile-details__bio-char-count {
  color: var(--cs-gray-04);
  text-align: right;
}
.edit-profile-details-row {
  display: flex;
  justify-content: space-between;
}
.edit-profile-details__input-city {
  width: 48%;
}
.edit-profile-details__field {
  width: 48%;
}

.edit-profile-details__profile-info {
  margin-top: -105px;
  padding: 0 30px 20px;
  background: var(--cs-gray-00);
}
.edit-profile-details__info-button {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.edit-profile-details__info-only {
  display: flex;
  flex-direction: column;
}
.edit-profile-details__button-only {
  flex-direction: column;
  margin-top: 125px;
}
.edit-profile-details__save-button {
  margin-right: 10px;
}
.edit-profile-details__first-row {
  margin-top: 5px;
}
.edit-profile-details__saving {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* from mobile */
.edit-profile-details__radio {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}
.cs-input__input {
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: 0 var(--cs-form-input-padding-x);
  color: var(--cs-gray-07);
  background-color: var(--cs-gray-00);
  border: 1px solid;
  border-color: var(--cs-gray-02);
  border-radius: var(--cs-input-border-radius);
  height: 40px;
}

.cs-input__input:focus {
  outline: none;
  border-color: var(--cs-gray-03);
}

.edit-profile-details__gender-labels {
  color: var(--cs-gray-05);
}
.edit-profile-details__form-input {
  display: block;
  width: 100%;
}
.settings-text {
  cursor: pointer;
}
* >>> .cs-alert--primary {
  background: var(--cs-gray-02) !important;
}
.edit-profile-details__second-alert {
  margin-top: -15px;
}
</style>
