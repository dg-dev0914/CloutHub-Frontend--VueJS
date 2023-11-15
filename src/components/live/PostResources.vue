<template>
  <div class="meeting-resources">
    <cs-button @click="uploadFile()" size="small" v-if="canUpload"
      fill="outline"
    >Upload Handout</cs-button>
    <app-upload-progress v-if="uploading"/>
    <div v-if="files && files.length">
      <app-meeting-file
        v-for="file in files"
        :key="file.id"
        :file="file"
        :is-post="true"
        :isAdmin="canUpload"
        @deleted="onDeleteFile"
      >
      </app-meeting-file>
    </div>
    <cs-empty-state title="No handouts added" v-if="files && !files.length"></cs-empty-state>
  </div>
</template>
<script>
import $utils from '@/services/utils';
import $aws from '@/services/aws';
import $socket from '@/services/socket';

// Component
import AppUploadProgress from '@/components/general/UploadProgress.vue';
import AppMeetingFile from '@/components/meetings/MeetingFile.vue';
// GQL
import InsertPostFile from '@/gql/live/InsertPostFile.gql';
import ListPostFiles from '@/gql/live/ListPostFiles.gql';

export default {
  components: {
    AppUploadProgress,
    AppMeetingFile,
  },
  props: {
    postId: {
      type: String,
      required: true,
    },
    canUpload: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      uploading: false,
    };
  },
  apollo: {
    files: {
      query: ListPostFiles,
      variables() {
        return {
          postId: this.postId,
        };
      },
      fetchPolicy: 'network-only',
    },
  },
  async mounted() {    
    $socket.onRoom('post', this.postId, 'post-handouts-modified', () => {
      console.log('post-handouts-modified');
      
      this.$apollo.queries.files.refetch();
      if(!this.canUpload)
        alert('New Handouts Available');
    });
  },
  methods: {
    async uploadFile() {
      const file = await $utils.selectFile('application/*');
      this.uploading = true;
      const url = await $aws.uploadFile(file, 'forum');
      const vars = {
        postId: this.postId,
        name: file.name,
        size: file.size,
        contentType: file.type,
        description: '',
        url,
      };
      await this.$apollo.mutate({
        mutation: InsertPostFile,
        variables: vars,
      });
      await this.$apollo.queries.files.refetch();
      this.uploading = false;
      $socket.sendRoom('post', this.postId, 'post-handouts-modified');
    },
    onDeleteFile() {
      $socket.sendRoom('post', this.postId, 'post-handouts-modified');
    },
  },
};
</script>

<style scoped>
.meeting-resources {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
}
.upload-file-btn{
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}
</style>
