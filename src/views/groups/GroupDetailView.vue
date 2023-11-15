<template>
  <b-container fluid="xl" class="no-padding px-0">
    <b-row class="no-gutters">
      <b-col md="8">
        <app-spinner
          v-if="!group && $apollo.queries.group.loading"
        ></app-spinner>

        <template v-else-if="group">
          <!-- Main section -->

          <!-- Header for SubGroup only -->
          <div
            v-if="group.parentGroupId"
            class="cs-textstyle-paragraph-bold group-detail-view__back-section"
            @click="
              $router.push({
                name: 'GroupDetail',
                params: { id: group.parentGroupId },
              })
            "
          >
            <i class="cs-icons-back-arrow group-detail-view__back-arrow"></i
            >Back to
            {{ parentGroup.name }}
          </div>

          <!-- Group info section -->
          <div class="card-no-padding group-detail-view__maincard">
            <app-group-banner-image :group="group" />

            <div class="group-detail-view__title-bar">
              <!-- Show a link and title of the parent group -->
              <div class="group-detail-view__title">
                <div
                  v-if="group.parentGroupId"
                  class="
                    cs-textstyle-paragraph-small-bold
                    group-detail-view__parent-group-title
                  "
                  @click="
                    $router.push({
                      name: 'GroupDetail',
                      params: { id: group.parentGroupId },
                    })
                  "
                >
                  <i class="ch-icons-groups"></i>
                  {{ parentGroup.name }}
                </div>
                <!-- Group title -->
                <div class="cs-textstyle-item-heading">{{ group.name }}</div>
                <div
                  class="
                    group-detail-view__description
                    cs-textstyle-paragraph-extra-small
                  "
                >
                  {{ group.memberCount }} {{ membersLabel }}
                  <span class="group-detail-view__bullet">&bullet;</span>
                  {{ group.postCount }} {{ postsLabel }}
                </div>
              </div>

              <cs-button
                v-if="group.id === '6196dace-09d1-5cb5-a73d-ebff708c1df1'"
                size="small"
                variant="danger"
                class="group-detail-view__action_button"
                href="https://www.supportcleanelections.com"
                target="_blank"
                >Report Fraud</cs-button
              >

              <!-- Join group button -->
              <app-group-join-button :group="group" />

              <!-- Create Subgroups -->
              <cs-button
                v-if="canCreateSubgroups && tabIndex === 3"
                fill="outline"
                size="small"
                @click="showSubgroupModal = true"
                >Create Subgroup</cs-button
              >

              <!-- Group send notification button -->
              <app-group-broadcast-button
                v-if="userIsModerator"
                class="group-detail-view__share"
                :group="group"
                @click="showBroadcastModal = true"
              />

              <!-- Share button -->
              <app-group-share-button
                v-if="userIsMember"
                class="group-detail-view__share"
                :group="group"
              />
            </div>

            <div class="group-detail-view__tab-holder">
              <!-- Tab bar - Discussion, Description, Members, Subgroups -->
              <cs-page-tabs
                v-model="tabIndex"
                class="group-detail-view__tab-labels"
                :tabs="tabs"
                no-border
                @input="pageTabChange"
              />

              <!-- Group menu button -->
              <app-group-menu :group="group" />
            </div>
          </div>

          <!-- Warning for a private group the user is not allowed to view content of -->
          <div v-if="shouldShowPrivateWarning" class="card-no-padding">
            <app-group-private-warning />
          </div>

          <!-- Discussion tab content -->
          <div v-show="tabIndex === 0">
            <template v-if="shouldShowPosts">
              <app-post-prompt
                v-if="userIsMember"
                :for-groups="subgroups.length > 0 ? true : false"
                :group-id="id"
              />
              <app-group-post-list
                v-if="group && group.id"
                :group="group"
                :is-moderator="userIsModerator || userIsSuperAdmin"
              />
            </template>
          </div>

          <!-- Description tab content -->
          <div v-show="tabIndex === 1">
            <app-group-description-card
              v-if="userIsMember || group.privacy === 'public'"
              :group="group"
            />
          </div>

          <!-- Members tab content -->
          <div v-show="tabIndex === 2">
            <template v-if="userIsMember || group.privacy === 'public'">
              <template v-if="loadMembers">
                <app-group-members-list-card
                  :group="group"
                  role="pending-member"
                />
                <app-group-members-list-card :group="group" role="admin" />
                <app-group-members-list-card :group="group" role="moderator" />
                <app-group-members-list-card :group="group" role="member" />
              </template>
            </template>
          </div>

          <!-- Subgroups tab content -->
          <div v-show="tabIndex === 3">
            <app-group-subgroup-card
              v-if="
                subgroups &&
                (group.privacy === 'public' || userIsMember) &&
                !group.rootGroupId
              "
              :group-id="id"
            />
          </div>
        </template>

        <app-create-subgroup-modal
          v-if="group.id"
          title="Create Subgroup"
          :show="showSubgroupModal"
          :parent-group="group"
          :siblings="subgroups"
          @close="showSubgroupModal = false"
        />

        <app-group-broadcast-modal
          v-if="showBroadcastModal"
          title="Send Broadcast Notification"
          :show="showBroadcastModal"
          :group="group"
          :subgroups="subgroups"
          @close="showBroadcastModal = false"
        />

        <cs-empty-state
          v-if="error"
          title="Nothing here"
          description="Sorry, we are unable to find what you're looking for at this moment"
        >
          <cs-button slot="button" @click="$router.go(-1)">Go Back</cs-button>
        </cs-empty-state>
      </b-col>

      <b-col md="4">
        <a
          v-if="group.id === '6196dace-09d1-5cb5-a73d-ebff708c1df1'"
          href="http://www.supportcleanelections.com"
          target="_blank"
        >
          <img
            class="ad"
            src="https://chforum.backendcdn.com/b9c91e90-545c-4dce-b8fb-0104ea8d9dda"
          />
        </a>
        <app-download-card />
        <app-site-links />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import $auth from '@/services/auth';
import $popups from '@/services/popups';

// GQL
import GetGroup from '@/gql/groups/GetGroup.gql';

// General components
import AppSpinner from '@/components/general/Spinner.vue';

// Group common components
import AppGroupJoinButton from '@/components/groups/GroupJoinButton.vue';

// Group detail components
import AppGroupBannerImage from '@/components/groups/detail/GroupBannerImage.vue';
import AppGroupShareButton from '@/components/groups/detail/GroupShareButton.vue';
import AppGroupMenu from '@/components/groups/detail/GroupMenu.vue';
import AppGroupPrivateWarning from '@/components/groups/detail/GroupPrivateWarning.vue';
import AppGroupDescriptionCard from '@/components/groups/detail/GroupDescriptionCard.vue';
import AppGroupMembersListCard from '@/components/groups/detail/GroupMembersListCard.vue';
import AppGroupBroadcastButton from '@/components/groups/detail/GroupBroadcastButton.vue';
import AppGroupBroadcastModal from '@/components/groups/detail/GroupBroadcastModal.vue';

// Group subgroup components
import AppGroupSubgroupCard from '@/components/groups/subgroup/GroupSubgroupCard.vue';
import AppCreateSubgroupModal from '@/components/groups/subgroup/CreateSubgroupModal.vue';

// Post components
import AppGroupPostList from '@/components/post/lists/GroupPostList.vue';
import AppPostPrompt from '@/components/post/PostPrompt.vue';

// Sidebar components
import AppDownloadCard from '@/components/sidebar/AppDownloadCard.vue';
import AppSiteLinks from '@/components/sidebar/SiteLinks.vue';

// FOR TESTS ONLY
import ListSubgroupsByGroupId from '@/gql/groups/ListSubgroupsByGroupId.gql';
// import AppAdSlot from '@/components/sidebar/AdSlot.vue';

const defaultTabs = ['Discussion', 'Description', 'Members'];

export default {
  components: {
    AppSpinner,
    AppGroupJoinButton,
    AppGroupBannerImage,
    AppGroupShareButton,
    AppGroupMenu,
    AppGroupPrivateWarning,
    AppGroupDescriptionCard,
    AppGroupMembersListCard,
    AppGroupBroadcastButton,
    AppGroupBroadcastModal,
    AppGroupSubgroupCard,
    AppGroupPostList,
    AppPostPrompt,
    AppDownloadCard,
    AppSiteLinks,
    AppCreateSubgroupModal,
    // AppAdSlot,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      tabIndex: 0,
      showGroupEditor: false,
      confirmMute: false,
      loadMembers: false,
      error: null,
      group: {
        banner: null,
      },
      parentGroup: {},
      showSubgroupModal: false,
      subgroups: [],
      showBroadcastModal: false,
    };
  },
  apollo: {
    group: {
      query: GetGroup,
      variables() {
        return {
          id: this.id,
        };
      },
      error(error) {
        this.showError(JSON.stringify(error.message), error);
      },
      result(data) {
        if (data.data.group.parentGroupId) {
          this.getParentGroup();
        }
      },
    },
    subgroups: {
      query: ListSubgroupsByGroupId,
      variables() {
        return {
          parentGroupId: this.id,
        };
      },
      update: (data) => data.groups,
    },
  },
  computed: {
    tabs() {
      return this.group.rootGroupId
        ? defaultTabs
        : defaultTabs.concat('Subgroups');
    },
    userIsMember() {
      if (!this.group || !this.group.myMembership) return null;
      return this.group.myMembership.role !== 'pending-member';
    },
    userIsModerator() {
      if (!this.group || !this.group.myMembership) return null;
      const membership = this.group.myMembership.role;
      return membership === 'moderator' || membership === 'admin';
    },
    membersLabel() {
      return this.group.memberCount === 1 ? 'member' : 'members';
    },
    postsLabel() {
      return this.group.postCount === 1 ? 'post' : 'posts';
    },
    userIsSuperAdmin() {
      return $auth.isAdmin();
    },
    shouldShowPrivateWarning() {
      return (
        !this.userIsMember &&
        !this.userIsSuperAdmin &&
        this.group.privacy &&
        this.group.privacy !== 'public'
      );
    },
    shouldShowPosts() {
      return (
        this.userIsMember ||
        this.userIsSuperAdmin ||
        this.group.privacy === 'public'
      );
    },
    canCreateSubgroups() {
      return (
        this.canHaveSubgroups && this.userIsModerator
        // Removed this.userIsSuperAdmin on client request
      );
    },
    canHaveSubgroups() {
      if (!this.group) return false;
      if (!this.group.parentGroupId) return true;
      return !this.group.rootGroupId;
    },
  },
  methods: {
    async getParentGroup() {
      const parentGroupId = this.group.parentGroupId;
      await this.$apollo
        .query({
          query: GetGroup,
          variables: {
            id: parentGroupId,
          },
        })
        .then((data) => {
          this.parentGroup = data.data.group;
        })
        .catch((error) => {
          this.showError(JSON.stringify(error.message), error);
        });
    },
    pageTabChange($event) {
      if ($event === 2) this.loadMembers = true;
    },
    showError(message, err) {
      $popups.alert(message);
      throw err;
    },
  },
};
</script>

<style>
.ad {
  width: 100%;
  margin-bottom: 20px;
}
/* Subgroup header */
.group-detail-view__back-section {
  margin-bottom: 10px;
  cursor: pointer;
}
.group-detail-view__back-arrow {
  font-size: 20px;
  margin-right: 10px;
}

/* Main card details */
.group-detail-view__maincard {
  position: relative;
  margin-bottom: 20px;
}
.group-detail-view__title-bar {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-bottom: solid 1px var(--cs-gray-02);
}
.group-detail-view__title {
  flex: 1;
  color: var(--cs-gray-06);
}
.group-detail-view__parent-group-title {
  color: var(--cs-primary-base);
  cursor: pointer;
}
.group-detail-view__description {
  color: var(--cs-gray-04);
}
.group-detail-view__bullet {
  margin: 0 6px;
}
.group-detail-view__share {
  margin-right: -20px;
}

/* Page tabs */
.group-detail-view__tab-holder {
  display: flex;
  align-items: center;
}
.group-detail-view__tab-labels.cs-page-tabs {
  flex: 1;
}

.group-detail-view__action_button {
  margin-right: 10px;
}

/* Fix for the search bar icon */
.cs-search-bar__icon {
  top: 6px !important;
}
</style>
