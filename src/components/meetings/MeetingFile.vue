<template>
  <div class="meeting-file">
    <div class="meeting-file__files">
      <i :class="icon"></i>
      <a
        class="meeting-file-info"
        target="_blank"
        :href="'https://ch-forum.backendcdn.com/' + file.url"
      >
        <div class="cs-textstyle-paragraph-bold">{{ file.name }}</div>
        <div class="cs-textstyle-paragraph">
          {{ displaySize }}
        </div>
      </a>
    </div>
    <div class="meeting-file__btns">
      <cs-button
        v-if="isAdmin"
        size="small"
        :disabled="disableAction"
        @click="deleteFile"
        >Remove</cs-button
      >
      <cs-button
        v-if="!isPost"
        size="small"
        fill="outline" 
        target="_blank"
        :href="handoutLink"
        >View file</cs-button
      >
    </div>
  </div>
</template>

<script>
import $cdn from '@/services/cdn';
import DeleteMeetingFile from '@/gql/meetings/DeleteMeetingFile.gql';
import DeletePostFile from '@/gql/live/DeletePostFile.gql';

export default {
  props: {
    file: {
      type: Object,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isPost: {
      type: Boolean,
      default: false,
    },
    disableAction: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    icon() {
      const map = {
        'application/pdf': 'cs-icons-pdf',
      };
      return map[this.file.contentType] || 'cs-icons-application-file';
    },
    displaySize() {
      return `${Math.floor(this.file.size / 1000)} kb`;
    },
    handoutLink() {
      return $cdn.optimize(this.file.url);
    },
  },
  methods: {
    async deleteFile() {
      console.log('Delete Me');
      await this.$apollo.mutate({
        mutation: this.isPost ? DeletePostFile : DeleteMeetingFile,
        variables: {
          id: this.file.id,
        },
        update: (cache) => {
          const normalizedId = cache.identify(this.file);
          if (normalizedId) {
            cache.evict({ id: normalizedId });
            cache.gc();
          }
        },
      });
      this.$emit('deleted');
      console.log('done');
    },
  },
};
</script>
<style scoped>
.meeting-file {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 10px;
}
.meeting-file i {
  font-size: 24px;
}
.meeting-file-info {
  flex: 1;
}
.meeting-file__files {
  display: flex;
  flex-direction: row;
  gap: 10px;
  width: 70%;
  overflow: hidden;
  text-overflow: ellipsis;
}
.meeting-file__btns {
  display: flex;
  flex-direction: row;
  gap: 10px;
}
</style>
