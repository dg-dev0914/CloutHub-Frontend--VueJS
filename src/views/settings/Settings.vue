<template>
  <b-container fluid="xl">
    <b-row>
      <b-col md="3"> </b-col>
      <b-col md="6">
        <div class="cs-card-setting">
          <div class="cs_card_header">Settings</div>
          <div class="cs_card_body">
            <b-row>
              <b-col
                md="6"
                lg="6"
                class="setting-item mb-4 d-flex align-items-center"
                v-for="setting in settings"
                :key="setting.modal"
                @click="openModal(setting.modal)"
              >
                <div class="setting-icon-wrapper">
                  <i :class="setting.icon"></i>
                </div>
                <div class="">{{ setting.title }}</div>
              </b-col>
            </b-row>
          </div>
        </div>
      </b-col>
      <b-col md="3">
        <app-follow-recommendations-card />
        <app-download-card />
        <app-site-links-card />
      </b-col>
    </b-row>
    <app-change-password-modal
      :show="showChangePasswordModal"
      @close="closeModal"
    />
    <app-change-email-modal :show="showChangeEmailModal" @close="closeModal" />
    <app-change-username-modal
      :show="showChangeUsernameModal"
      @close="closeModal"
    />
    <app-blocked-members-modal
      :show="showBlockedMembersModal"
      @close="closeModal"
    />
    <app-contact-us-modal :show="showContactUsModal" @close="closeModal" />
    <app-delete-user-modal :show="showDeleteUserModal" @close="closeModal" />
    <app-notification-modal :show="showNotificationModal" @close="closeModal" />
    <app-translation-modal :show="showTranslationModal" @close="closeModal" />
    <app-verification-modal :show="showVerificationModal" @close="closeModal" />
  </b-container>
</template>
<script>
import AppDownloadCard from '@/components/sidebar/AppDownloadCard.vue';
import AppFollowRecommendationsCard from '@/components/sidebar/FollowRecommendationsCard.vue';
import AppSiteLinksCard from '@/components/sidebar/SiteLinks.vue';
import AppChangePasswordModal from '@/components/setting/ChangePasswordModal.vue';
import AppChangeEmailModal from '@/components/setting/ChangeEmailModal.vue';
import AppChangeUsernameModal from '@/components/setting/ChangeUsernameModal.vue';
import AppBlockedMembersModal from '@/components/setting/BlockedMembersModal.vue';
import AppContactUsModal from '@/components/setting/ContactUsModal.vue';
import AppDeleteUserModal from '@/components/setting/DeleteUserModal.vue';
import AppNotificationModal from '@/components/setting/NotificationModal.vue';
import AppTranslationModal from '@/components/setting/TranslationModal.vue';
import AppVerificationModal from '@/components/setting/VerificationModal.vue';

export default {
  data() {
    return {
      settings: [
        {
          title: 'Change Password',
          icon: 'ch-icons-secure',
          modal: 'showChangePasswordModal',
        },
        {
          title: 'Change Email',
          icon: 'ch-icons-change-email',
          modal: 'showChangeEmailModal',
        },
        {
          title: 'Change Username',
          icon: 'ch-icons-change-username',
          modal: 'showChangeUsernameModal',
        },
        {
          title: 'Contact Us',
          icon: 'ch-icons-message',
          modal: 'showContactUsModal',
        },
        {
          title: 'Notification Options',
          icon: 'ch-icons-notification',
          modal: 'showNotificationModal',
        },
        {
          title: 'Language',
          icon: 'ch-icons-globe',
          modal: 'showTranslationModal',
        },
        {
          title: 'Blocked Members',
          icon: 'ch-icons-block-user',
          modal: 'showBlockedMembersModal',
        },
        {
          title: 'Delete Account',
          icon: 'ch-icons-delete-user',
          modal: 'showDeleteUserModal',
        },
        {
          title: 'Verify Account',
          icon: 'ch-icons-verified',
          modal: 'showVerificationModal',
        },
      ],
      currentTab: null,
      showChangeEmailModal: false,
      showChangeUsernameModal: false,
      showChangePasswordModal: false,
      showBlockedMembersModal: false,
      showContactUsModal: false,
      showDeleteUserModal: false,
      showNotificationModal: false,
      showTranslationModal: false,
      showVerificationModal: false,
    };
  },
  components: {
    AppDownloadCard,
    AppFollowRecommendationsCard,
    AppSiteLinksCard,
    AppChangePasswordModal,
    AppChangeEmailModal,
    AppChangeUsernameModal,
    AppBlockedMembersModal,
    AppContactUsModal,
    AppDeleteUserModal,
    AppNotificationModal,
    AppTranslationModal,
    AppVerificationModal,
  },
  methods: {
    openModal(id) {
      this[id] = true;
    },
    closeModal() {
      this.showChangeEmailModal = false;
      this.showChangeUsernameModal = false;
      this.showChangePasswordModal = false;
      this.showBlockedMembersModal = false;
      this.showContactUsModal = false;
      this.showDeleteUserModal = false;
      this.showNotificationModal = false;
      this.showTranslationModal = false;
      this.showVerificationModal = false;
    },
  },
};
</script>
<style>
.cs-setting-modal .cs-modal__body {
  align-items: initial !important;
  margin-top: 0px !important;
  padding: 0px 0 !important;
  overflow: auto !important;
  max-height: 530px !important;
  width: 100% !important;
}
.setting-item {
  display: flex;
  margin-top: 10px;
  margin-bottom: 10px;
  cursor: pointer;
}
.setting-icon-wrapper {
  background: var(--cs-gray-01);
  border: 1px solid var(--cs-gray-02);
  width: 35px;
  height: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 30px;
  margin-right: 10px;
}
.setting-icon-wrapper i {
  font-size: 19px;
  color: var(--cs-gray-04);
}
.cs-card-setting {
  height: 70vh;
  --cs-card-margin-x: 0px;
  /* --cs-card-margin-y: 0px; */
  margin-top: 0px !important;
  box-shadow: 0px 3px 6px #0000000d;
  border: none;
  background-color: var(--cs-gray-00);
  border-radius: var(--cs-card-border-radius);
}
.cs-card-setting .cs_card_header {
  border-bottom: 1px solid var(--cs-gray-02);
  padding: var(--cs-navtab-padding-y) var(--cs-card-padding-x);
  font: normal normal bold 16px/24px Roboto;
  color: var(--gray-06);
}
.cs-card-setting .cs_card_body {
  padding: var(--cs-navtab-padding-y) var(--cs-card-padding-x);
}
.cs-card-setting .cs_card_body .setting-item {
  font: normal normal bold 14px/21px Roboto;
  color: var(--gray-06);
}
</style>
