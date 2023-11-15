<template lang="html">
  <div>
    <app-form-modal
      :show="show"
      title="Create Subgroup"
      :saving="saving"
      @close="close"
    >
      <app-group-editor-form
        v-model="group"
        :subgroup="true"
        @slugLoading="checkingSlug = $event"
      />
      <div slot="footer" class="group-editor-modal__button-holder">
        <cs-button :disabled="invalidForm" size="small" @click="save"
          >Continue</cs-button
        >
      </div>
    </app-form-modal>

    <!-- Don't create the moderator selector component before newGroup exists. -->
    <!-- Otherwise it attempts to load the group members of no group -->
    <template v-if="newGroup">
      <app-select-subgroup-moderators-modal
        title="Create Subgroup"
        :show="showModeratorsModal"
        :group="newGroup"
        :parent-group-id="parentGroup.id"
        @close="showModeratorsModal = false"
      />
    </template>
  </div>
</template>

<script>
import $groupsApi from '@/api/groups';
import $upload from '@/services/upload';
import $popups from '@/services/popups';

import AppFormModal from '@/components/general/FormModal.vue';
import AppGroupEditorForm from '@/components/groups/GroupEditorForm.vue';

// Group subgroup components
import AppSelectSubgroupModeratorsModal from '@/components/groups/subgroup/SelectSubgroupModeratorsModal.vue';

export default {
  components: {
    AppFormModal,
    AppGroupEditorForm,
    AppSelectSubgroupModeratorsModal,
  },
  props: {
    parentGroup: {
      type: Object,
      required: true,
    },
    show: {
      type: Boolean,
      default: false,
    },
    siblings: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      group: { privacy: this.parentGroup.privacy },
      saving: false,
      newGroup: {},
      checkingSlug: false,
      showModeratorsModal: false,
    };
  },
  computed: {
    invalidForm() {
      if (!this.group) return true;
      if (!this.group.privacy) return true;
      if (!this.group.name || !this.group.name.trim()) return true;
      if (this.checkingSlug) return true;
      return false;
    },
  },
  watch: {
    show() {
      this.group = { privacy: this.parentGroup.privacy };
    },
  },
  methods: {
    save() {
      this.saving = true;
      this.uploadFiles()
        .then(() => this.createSubgroup())
        .catch((err) => {
          this.error(err.message, err);
        });
    },
    createSubgroup() {
      const newGroup = {
        parentGroupId: this.parentGroup.id,
        ...this.group,
      };
      return $groupsApi
        .createGroup(newGroup)
        .then((result) => result.data.create_group)
        .then(this.openModeratorsModal)
        .catch((err) => {
          this.error(err.message, err);
        });
    },
    uploadFiles() {
      return $upload
        .uploadImages([this.group.picture, this.group.banner])
        .then((imgs) => {
          const picture =
            imgs[0] && imgs[0].url ? imgs[0].url : this.group.picture;
          const banner =
            imgs[1] && imgs[1].url ? imgs[1].url : this.group.banner;
          this.$set(this.group, 'picture', picture);
          this.$set(this.group, 'banner', banner);
        });
    },
    async openModeratorsModal(newGroup) {
      this.newGroup = newGroup;
      this.close();
      await this.$nextTick();
      this.showModeratorsModal = true;
    },
    close() {
      this.saving = false;
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
