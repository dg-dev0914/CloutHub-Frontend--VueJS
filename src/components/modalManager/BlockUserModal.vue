<template>
  <div class="block-user-modal">
    <app-modal
      v-if="user"
      :show="showModal"
      class="block-modal"
      :title="`Block ` + user.username"
      size="small"
      @close="onCloseMsgModal"
    >
      <div class="block-modal__body text-center">
        <div v-if="block">
          <div
            class="
              align-items-center
              d-flex
              flex-column
              justify-content-center
              text-center
            "
          >
            <app-avatar
              v-if="user"
              :picture="user.profilePhotoURL"
              :name="user.displayname"
              size="large"
              class="mb-2"
            >
            </app-avatar>
            <h2>
              Are you sure you <br />
              want to block {{ user.username }} ?
            </h2>
          </div>
          <p>
            From this point forward you will no longer see their posts,
            comments, or be able to message or search this member.
          </p>
          <cs-button class="px-5 my-4" @click="confirm"> Block </cs-button>
        </div>
        <app-spinner v-if="loading" />
        <div v-if="confirmation">
          <div
            class="
              align-items-center
              d-flex
              flex-column
              justify-content-center
              text-center
            "
          >
            <div class="mt-5 mb-4">
              <img src="@/assets/images/check-circle.svg" />
            </div>
            <h2>Successfully Blocked</h2>
          </div>
          <p class="mx-4">
            You have blocked {{ user.username }} and to unblock navigate to
            settings.
          </p>
          <cs-button class="px-5 my-2" @click="onCloseMsgModal">
            Done
          </cs-button>
        </div>
      </div>
    </app-modal>
  </div>
</template>
<script>
import $relationships from '@/api/connections';
import $bus from '@/services/bus';
import AppModal from '@/components/general/Modal.vue';
import AppAvatar from '@/components/general/Avatar.vue';
import AppSpinner from '@/components/general/Spinner.vue';

export default {
  components: {
    AppModal,
    AppAvatar,
    AppSpinner,
  },
  data() {
    return {
      showModal: false,
      user: null,
      confirmation: false,
      loading: false,
      block: false,
    };
  },
  watch: {
    showModal(value) {
      if (value) {
        this.block = true;
        this.confirmation = false;
      }
    },
    loading(value) {
      if (!value) {
        this.confirmation = true;
        console.log('value loader', value);
      }
    },
  },
  mounted() {
    $bus.$on('block-user-modal', (params) => {
      this.user = params.user;
      this.showModal = true;
    });
  },
  methods: {
    onCloseMsgModal() {
      if (this.confirmation === true) {
        this.showModal = false;
        this.block = false;
        this.confirmation = false;
        $bus.$emit('reload-conversation');
      }else{
        this.showModal = false;
        this.block = false;
        this.confirmation = false;
      }
    },
    confirm() {
      this.block = false;
      this.loading = true;
      $relationships.blockUser(this.user);
      setInterval(() => {
        this.loading = false;
      }, 3000);
    },
  },
};
</script>
<style scoped>
.block-modal >>> .block-modal__body h2,
.block-confirm-modal >>> .block-modal__body h2 {
  font-size: var(--cs-font-size-200);
  color: var(--cs-gray-06);
  font-weight: var(--cs-font-weight-bold);
  /* margin: 20px 0px; */
}
.block-modal >>> .block-modal__body p,
.block-confirm-modal >>> .block-modal__body p {
  font-size: var(--cs-font-size-100);
  color: var(--cs-gray-05);
  margin: 10px 0px 20px 0px;
}
</style>
