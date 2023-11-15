<template>
  <div>
    <cs-modal :show="true" @close="done()" class="simple-modal">
      <div slot="header">{{header}}</div>
      <div slot="body" class="video-upload-modal-body">
        <div v-if="!thumbnails">
          <app-file-input
            @selected="generateThumbnails"
            title="Drag video here, or:"
            buttonLabel="Select from computer"
            type="video/"
            accept="video/*"
            :multiple="false"
          />
        </div>
        <div v-if="thumbnails && !thumbnail">
          <img class="thumbnail-option" v-for="(t,index) in thumbnails" :key="index" :src="t" @click="selectThumbnail(t)">
        </div>
        <div v-if="thumbnail">
          <app-spinner v-if="uploading"></app-spinner>
          <cs-form class="video-modal-form" v-if="!uploading">
            <p>This will help others discover your video.</p>
            <cs-input label="Title" v-model="draft.title"/>
            <app-textarea label="Description" v-model="draft.description"/>
          </cs-form>
          <div class="video-upload-modal-footer">
            <cs-button @click="upload()" :disabled="uploading">Upload</cs-button>
          </div>
        </div>
      </div>
      <div slot="buttons" hidden>
        <cs-button hidden></cs-button>
      </div>
    </cs-modal>
  </div>
</template>
<script>
import $aws from '@/services/aws';
import AppSpinner from '@/components/general/Spinner.vue';
import AppTextarea from '@/components/general/Textarea.vue';
import AppFileInput from './FileInput.vue';

export default {
  components: {
    AppFileInput,
    AppTextarea,
    AppSpinner,
  },
  data() {
    return {
      thumbnails: null,
      thumbnail: null,
      draft: {},
      uploading: false,
    };
  },
  computed: {
    header() {
      if (!this.thumbnails) {
        return '1. Select Video';
      } if (!this.thumbnail) {
        return '2. Select Thumbnail';
      } if (!this.uploading) {
        return '3. Add Info';
      }
      return 'Uploading...';
    },
  },
  methods: {
    selectVideo() {
      this.showModal = true;
      this.draft = {};
    },
    generateThumbnail(video, canvas, time) {
      return new Promise((resolve, reject) => {
        video.addEventListener('timeupdate', () => {
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
          canvas.toBlob((blob) => {
            const thumbUrl = URL.createObjectURL(blob);
            resolve(thumbUrl);
          });
        });
        video.currentTime = time;
      });
    },
    generateThumbnails(file) {
      this.draft.file = file;
      const videoUrl = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.src = videoUrl;
      this.draft.videoUrl = videoUrl;

      video.addEventListener('loadedmetadata', async () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const duration = video.duration;

        const thumbnails = [];

        for (let i = 1; i <= 5; i++) {
          const thumbUrl = await this.generateThumbnail(video, canvas, Math.floor(i * duration / 5));
          thumbnails.push(thumbUrl);
        }
        this.thumbnails = thumbnails;
      });
    },
    selectThumbnail(t) {
      this.thumbnail = t;
      this.draft.thumbnail = t;
    },
    async upload() {
      this.uploading = true;
      console.log('Uploading...');
      // TODO: maybe replace with $upload.uploadVideo
      const url = await $aws.uploadFile(this.draft.file);
      console.log(url);
      const output = {
        contentType: this.draft.file.type,
        type: 'video',
        size: this.draft.file.size,
        url,
        name: this.draft.file.name,
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
  .video-upload-modal-body
  {
    width: 100%;
  }
  .video-upload-modal-footer
  {
    margin-top: 10px;
    text-align: right;
  }
  .thumbnail-option
  {
    height: 135px;
    width: 240px;
    object-fit: cover;
    padding: 10px;
    margin: 10px;
    display: inline;
  }
  .thumbnail-option:hover {
    cursor: pointer;
    border: solid 1px var(--cs-primary-base);
    box-sizing: border-box;
  }
  .video-modal-form
  {
    display: flex;
    flex-direction: column;
  }
  .simple-modal >>> .cs-modal__body{
    margin-top: 5px;
    padding: 0px;
  }
  .simple-modal >>> .cs-modal__footer{
    display: none;
  }

</style>
