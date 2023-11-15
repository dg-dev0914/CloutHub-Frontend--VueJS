<template lang="html">
  <portal to="modals">
    <app-form-modal :show="show" :title="title" :saving="saving" @close="close">
      <app-group-editor-form
        v-model="group"
        @slugLoading="checkingSlug = $event"
      />
      <div slot="footer" class="group-editor-modal__button-holder">
        <cs-button :disabled="invalidForm" size="small" @click="save">
          {{ buttonText }}
        </cs-button>
      </div>
    </app-form-modal>
  </portal>
</template>

<script>
import $popups from '@/services/popups';
import $upload from '@/services/upload';
import $groupsApi from '@/api/groups';

// General components
import AppFormModal from '@/components/general/FormModal.vue';

// Group common components
import AppGroupEditorForm from '@/components/groups/GroupEditorForm.vue';

export default {
  components: {
    AppFormModal,
    AppGroupEditorForm,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    groupData: {
      type: Object,
      default() {
        return { privacy: 'public' };
      },
    },
  },
  data() {
    return {
      group: JSON.parse(JSON.stringify(this.groupData)),
      saving: false,
      checkingSlug: false,
    };
  },
  computed: {
    isCreate() {
      return !this.group.id;
    },
    title() {
      return this.isCreate ? 'Create Group' : 'Edit Group';
    },
    buttonText() {
      return this.isCreate ? 'Create' : 'Save';
    },
    invalidForm() {
      if (!this.group) return true;
      if (!this.group.privacy) return true;
      if (!this.group.name || !this.group.name.trim()) return true;
      if (this.checkingSlug) return true;
      return false;
    },
  },
  watch: {
    groupData() {
      this.group = JSON.parse(JSON.stringify(this.groupData));
    },
  },
  methods: {
    save() {
      this.saving = true;
      this.uploadFiles()
        .then((group) =>
          this.isCreate ? this.createGroup(group) : this.updateGroup(group)
        )
        .catch((err) => {
          this.error(
            'There was an error saving.  Please try again later or contact support',
            err
          );
        });
    },
    async createGroup(group) {
      const result = await $groupsApi.createGroup(group);
      this.done(result.data.create_group.id);
    },
    async updateGroup(group) {
      await $groupsApi.updateGroup(group.id, group);
      this.done();
    },
    uploadFiles() {
      return $upload
        .uploadImages([this.group.picture, this.group.banner])
        .then((imgs) => {
          const picture =
            imgs[0] && imgs[0].url ? imgs[0].url : this.group.picture;
          const banner =
            imgs[1] && imgs[1].url ? imgs[1].url : this.group.banner;
          return { ...this.group, picture, banner };
        })
        .catch((err) =>
          this.error(
            'There was an error uploading.  Please try again later or contact support',
            err
          )
        );
    },
    done(groupId) {
      this.saving = false;
      if (groupId) {
        this.$router.push({ name: 'GroupDetail', params: { id: groupId } });
      }
      this.close();
    },
    close() {
      this.$emit('close');
    },
    error(message, err) {
      this.saving = false;
      $popups.alert(message);
      throw err;
    },
  },
};
</script>

<style lang="css" scoped>
.group-editor-modal__button-holder {
  text-align: right;
}
</style>
