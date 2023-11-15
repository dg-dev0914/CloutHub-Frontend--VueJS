<template>
  <div class="meeting-resources">
    <cs-button
      v-if="canUpload"
      size="small"
      fill="outline"
      :disabled="disableUpload"
      @click="uploadFile()"
      >Upload Handout</cs-button
    >
    <app-upload-progress v-if="uploading" />
    <div v-if="files && files.length">
      <app-meeting-file
        v-for="file in files"
        :key="file.id"
        :file="file"
        :is-admin="canUpload"
        :disable-action="disableUpload"
        @deleted="onDeleteFile"
      >
      </app-meeting-file>
    </div>
    <cs-empty-state
      v-if="files && !files.length"
      title="No handouts added"
    ></cs-empty-state>
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
import InsertMeetingFile from '@/gql/meetings/InsertMeetingFile.gql';
import ListMeetingFiles from '@/gql/meetings/ListMeetingFiles.gql';

export default {
  components: {
    AppUploadProgress,
    AppMeetingFile,
  },
  props: {
    meeting: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      uploading: false,
    };
  },
  apollo: {
    files: {
      query: ListMeetingFiles,
      variables() {
        return {
          meetingId: this.meeting.id,
        };
      },
      fetchPolicy: 'network-only',
    },
  },
  computed: {
    canUpload() {
      return (
        this.meeting &&
        this.meeting.myMembership &&
        this.meeting.myMembership.role &&
        (this.meeting.myMembership.role === 'ADMIN' ||
          this.meeting.myMembership.role === 'HOST')
      );
    },
    disableUpload() {
      return (
        this.meeting.status === 'TRANSCODING' || this.meeting.status === 'ENDED'
      );
    },
  },
  mounted() {
    $socket.onRoom(
      'meeting',
      this.meeting.id,
      'meeting-handouts-modified',
      () => {
        this.$apollo.queries.files.refetch();
        alert('New Handouts Available');
      }
    );
  },
  methods: {
    async uploadFile() {
      const file = await $utils.selectFile('application/*');
      this.uploading = true;
      const url = await $aws.uploadFile(file, 'forum');
      const vars = {
        meetingId: this.meeting.id,
        name: file.name,
        size: file.size,
        contentType: file.type,
        description: '',
        url,
      };
      await this.$apollo.mutate({
        mutation: InsertMeetingFile,
        variables: vars,
      });
      await this.$apollo.queries.files.refetch();
      this.uploading = false;
      $socket.sendRoom('meeting', this.meeting.id, 'meeting-handouts-modified');
    },
    onDeleteFile() {
      $socket.sendRoom('meeting', this.meeting.id, 'meeting-handouts-modified');
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
.upload-file-btn {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}
</style>
