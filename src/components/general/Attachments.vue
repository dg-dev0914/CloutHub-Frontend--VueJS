<template>
  <div class="ch-attachments">
    <!-- Images -->
    <div v-if="attachedImage && attachedImage.length > 0" class="row w-100">
      <div  v-for="(image, index) in attachedImage" :key="index" class="col-md-6">
        <div class="ch-post-attachment">
        <app-img  :src="image.url" class="ch-image" v-if="image.type === 'image/gif'" />
        <app-img  :src="image.url" class="ch-image"  v-else-if="image.url"/>
        <app-img  :src="image.dataurl" class="ch-image" v-else />
        <!-- <div class="ch-attachment-delete"><i class="cs-icons-delete" @click="$emit('rmvImg', index)" /></div> -->
        <i class="cs-icons-delete ch-attachment-delete" @click="$emit('remove', image)"></i>
        </div>
      </div>
    </div>
    <div class="ch-attachment-container" v-if="attachment">
      <!-- Video -->
      <div v-if="attachment.type.startsWith('video')" class="ch-post-attachment">
        <cs-video-player
          :src="attachmentSrc"
        />
        <i class="cs-icons-delete ch-attachment-delete" @click="$emit('remove')"></i>
      </div>
      <!-- File Preview -->
      <div v-if="attachment.type.startsWith('application') || attachment.type.startsWith('document')" class="ch-post-attachment p-3">
        <cs-file-preview
          :src="attachmentSrc"
          :file-type="attachment.type"
          :title="attachment.name"
          :file-size="attachment.size"
          class="attachment-file"
        ></cs-file-preview>
        <i class="cs-icons-delete ch-attachment-delete" @click="$emit('remove')"></i>
      </div>
    </div>
  </div>
</template>

<script>
import AppImg from '@/components/general/Img.vue';
import $cdn from '@/services/cdn';

export default {
  components: {
    AppImg,
  },
  props: {
    attachment: {
      type: [Object, File],
    },
    attachedImage: Array,
  },
  computed: {
    attachmentSrc() {
      return this.attachment.dataurl || $cdn.optimize(this.attachment.url);
    },
  },
};
</script>

<style scoped>
.ch-attachments{
  padding-top: 15px;
}
.ch-post-attachment {
  position: relative;
  max-height: 250px;
  max-width: 250px;
  overflow: hidden;
  border-radius: 15px;
  margin-bottom: 25px;
}
.ch-image-container{
  display: flex;
  flex-direction: row;
  flex-wrap:  wrap;
  align-items: center;
  justify-content: flex-start;
}
.ch-image{
  /* height: 250px; */
  width: 100%;
  border-radius: 15px;
  /* flex: 1 auto; */
}
.ch-attachment-container{
  position: relative;
  /* display: flex;
  flex: 1; */
  padding: 10px;
}
.attachment-file{
  flex: 1;
}
.ch-image-box{
  display: flex;
  flex-direction: row;
}
.ch-attachment-delete{
    background: var(--cs-white);
    font-size: 20px;
    padding: 5px 11px;
    right: 5px;
    cursor: pointer;
    position: absolute;
    color: var(--cs-secondary-dark);
    border-radius: 10px;
    top: 5px;
    font-weight: 700;
    transition: 0.2s ease-in;
}
.ch-post-attachment::before {
   content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background:#00000026;
    opacity: 0;
    border-radius: 15px;
    transition: 0.2s ease-in;
}
</style>
