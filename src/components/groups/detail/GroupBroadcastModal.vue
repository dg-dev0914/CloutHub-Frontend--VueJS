<template lang="html">
  <div>
    <app-form-modal
      :show="show"
      title="Send Broadcast Notification"
      :saving="saving"
      @close="close"
    >
      <p>
        Select recipients you would like to receive this notification. You can
        send this notification to the Admins, Moderators and/or Members of
        specific subgroups or all subgroups
      </p>
      <div class="group-broadcast-modal__form">
        <app-group-role-select
          v-model="recipients"
          label="Recipients"
          :subgroups="subgroups"
          :group="group"
        />
        <div>
          <app-textarea
            v-model="description"
            class="group-broadcast-modal__textarea"
            label="Enter what you want your notification to say."
            placeholder="Enter text here"
            maxlength="200"
          />
          <div class="group-broadcast-modal__chars">
            {{ description ? description.length : 0 }}/200 Characters
          </div>
        </div>
        <cs-input
          v-model="link"
          class="group-broadcast-modal__link"
          label="Link (optional)"
          placeholder="e.g. https://example.com"
        />
      </div>
      <div slot="footer" class="group-broadcast-modal__button-holder">
        <cs-button :disabled="invalidForm" size="small" @click="send">
          Send
        </cs-button>
      </div>
    </app-form-modal>
  </div>
</template>

<script>
import $popups from '@/services/popups';

import AppFormModal from '@/components/general/FormModal.vue';
import AppTextarea from '@/components/general/Textarea.vue';
import AppGroupRoleSelect from '@/components/groups/GroupRoleSelect.vue';

import SendAnnouncement from '@/gql/groups/SendAnnouncement.gql';

export default {
  components: {
    AppFormModal,
    AppTextarea,
    AppGroupRoleSelect,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    group: {
      type: Object,
      required: true,
    },
    subgroups: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  data() {
    return {
      saving: false,
      description: '',
      link: '',
      recipients: [],
    };
  },
  computed: {
    invalidForm() {
      if (this.description.length < 6) return true;
      if (!this.recipients.length) return true;
      return false;
    },
  },
  methods: {
    send() {
      this.saving = true;
      this.$apollo
        .mutate({
          mutation: SendAnnouncement,
          variables: {
            groupId: this.group.id,
            recipients: this.recipients,
            description: this.description,
            link: this.link,
          },
        })
        .then(({ data }) => {
          if (data.send_announcement) this.close();
          else $popups.alert('Please, try again later');
        })
        .catch(() => {
          $popups.alert('Please, try again later');
        })
        .finally(() => {
          this.saving = false;
          this.$toast.open({
            message: 'Notification Successfully Sent',
            type: 'success',
            duration: 1000,
            dismissible: true,
            position: 'top',
          });
        });
    },
    close() {
      this.$emit('close');
    },
  },
};
</script>

<style lang="css" scoped>
.group-broadcast-modal__button-holder {
  text-align: right;
}
.group-broadcast-modal__textarea,
.group-broadcast-modal__link {
  width: 100%;
}
.group-broadcast-modal__chars {
  text-align: right;
  color: var(--cs-gray-04);
}
.group-broadcast-modal__form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
</style>
