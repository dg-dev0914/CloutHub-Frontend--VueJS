<template>
  <div>
    <cs-modal :show="show" @close="done()">
      <div slot="header">{{header}}</div>
      <div slot="body" class="document-upload-modal-body">
        <div v-if="!document">
          <app-file-input
            @selected="handleDocument"
            title="Drag PDF here, or:"
            buttonLabel="Select from computer"
            type="application/pdf"
            accept="application/pdf"
            :multiple="false"
          />
        </div>
        <div v-if="document">
          <cs-form class="document-modal-form">
            <p v-if="document">{{document.name}} ({{document.size}})</p>
            <cs-input label="Title" v-model="draft.title"/>
            <app-textarea label="Description" v-model="draft.description"/>
          </cs-form>
          <div class="document-upload-modal-footer">
            <cs-button size="small" :disabled="uploading" @click="upload()">Upload</cs-button>
          </div>
        </div>
      </div>
    </cs-modal>
  </div>
</template>
<script>
import $aws from '@/services/aws';
import AppTextarea from '@/components/general/Textarea.vue';
import AppFileInput from './FileInput.vue';

export default {
  components: {
    AppFileInput,
    AppTextarea,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      document: null,
      uploading: false,
      draft: {},
    };
  },
  computed: {
    header() {
      if (!this.document) {
        return '1. Select PDF';
      } if (!this.uploading) {
        return '2. Add Details';
      }
      return 'Uploading...';
    },
  },
  methods: {
    selectDocument() {
      this.showModal = true;
      this.draft = {};
    },
    handleDocument(file) {
      this.document = file;
    },
    async upload() {
      this.uploading = true;
      console.log('Uploading...');
      // TODO: maybe replace with $upload.uploadDocument
      const url = await $aws.uploadFile(this.document);
      console.log(url);
      const output = {
        type: 'document',
        contentType: this.document.type,
        size: this.document.size,
        url,
        name: this.document.name,
        title: this.draft.title,
        description: this.draft.description,
      };
      console.log('Return', output);
      this.$emit('selected', output);
      this.done();
    },
    done() {
      this.$emit('close');
    },
  },
};
</script>
<style scoped>
.document-upload-modal-body
{
  width: 100%;
}
.document-upload-modal-footer
{
  margin-top: 10px;
  text-align: right;
}
.document-modal-form
{
  display: flex;
  flex-direction: column;
}
</style>
