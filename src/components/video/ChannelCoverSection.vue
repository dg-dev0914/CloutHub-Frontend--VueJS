<template>
  <div class="channel-cover-section">
    <div v-if="!showCrop">
      <app-image-input
        v-if="!cover && !selectedBanner"
        label=""
        @input="imageSelected"
      />
      <app-image-input
        v-if="cover && !selectedBanner"
        :value="cover"
        label=""
        :show-upload-button="showUploadButton"
        @input="imageSelected"
      />

      <div v-if="!cover && selectedBanner" class="selected-banner-preview">
        <app-img :src="selectedBanner" class="banner-image" />
        <cs-button size="small" class="upload-button" @click="selectImage"
          >Upload</cs-button
        >
      </div>
      <div class="header-image-container">
        <app-img
          v-for="(banner, index) in randomCovers"
          :key="index"
          :src="banner"
          class="header-image"
          :class="{ 'header-image__selected': index === selectedIndex }"
          @click="selectBannerImg(banner, index)"
        />
      </div>
    </div>
    <div v-if="showCrop" class="cropped-image">
      <app-image-crop
        :image="cover.dataurl"
        :aspect-ratio="5.75 / 1"
        @cropped="croppedCover"
      />
    </div>
  </div>
</template>

<script>
import $utils from '@/services/utils';
import AppImg from '@/components/general/Img.vue';
import AppImageInput from '@/components/general/ImageInput.vue';
import AppImageCrop from '@/components/general/ImageCrop.vue';

const randomCovers = [
  'us-west-2:39954b8f-6cf8-49af-b5bb-1a1db1dc18ed/691144aa-41ce-4a39-8b88-f3c9c336cebc.jpg',
  'us-west-2:39954b8f-6cf8-49af-b5bb-1a1db1dc18ed/1c980dcf-b3a6-47ad-96e3-351e514250e1.jpg',
  'us-west-2:39954b8f-6cf8-49af-b5bb-1a1db1dc18ed/8895a176-394a-40c0-88dd-799d117094e3.jpg',
  'us-west-2:39954b8f-6cf8-49af-b5bb-1a1db1dc18ed/b136af2b-1087-4579-9d61-a211a7e73a40.jpg',
  'us-west-2:39954b8f-6cf8-49af-b5bb-1a1db1dc18ed/e5c5154d-afc6-405d-9cfe-01def1e94574.jpg',
  'us-west-2:39954b8f-6cf8-49af-b5bb-1a1db1dc18ed/8de78653-1f2d-4d8b-b2ed-b12a9f40dc5b.jpg',
  'us-west-2:39954b8f-6cf8-49af-b5bb-1a1db1dc18ed/5ef9e56e-8e7e-4456-ac65-d45b444b73fd.jpg',
  'us-west-2:39954b8f-6cf8-49af-b5bb-1a1db1dc18ed/dc0fd3fd-752d-4502-bbfe-7729e157daea.jpg',
  'us-west-2:39954b8f-6cf8-49af-b5bb-1a1db1dc18ed/efdd6d6f-43ca-4068-a44d-3d6292245195.jpg',
  'us-west-2:39954b8f-6cf8-49af-b5bb-1a1db1dc18ed/354e9bfe-342b-41fe-91f2-ab2e76e1f7dd.jpg',
  'us-west-2:39954b8f-6cf8-49af-b5bb-1a1db1dc18ed/4d65fc68-6381-4401-9eca-a5b34ff826a0.jpg',
  'us-west-2:39954b8f-6cf8-49af-b5bb-1a1db1dc18ed/11694096-aea5-40b8-bf52-0fb16502356b.jpg',
  'us-west-2:39954b8f-6cf8-49af-b5bb-1a1db1dc18ed/cb648c5b-8927-4acc-a1fb-9aa7759d5614.jpg',
  'us-west-2:39954b8f-6cf8-49af-b5bb-1a1db1dc18ed/b4184bf8-1d1c-4bfb-8915-263447f57f6b.jpg',
  'us-west-2:39954b8f-6cf8-49af-b5bb-1a1db1dc18ed/db7fdfa4-9ac5-402d-a3cc-b8d06cf89186.jpg',
  'us-west-2:39954b8f-6cf8-49af-b5bb-1a1db1dc18ed/514a9047-0f4b-4504-8b95-e6aece46b68b.jpg',
  'us-west-2:39954b8f-6cf8-49af-b5bb-1a1db1dc18ed/1eb79366-35bd-45b6-b4ac-f0fe22651347.jpg',
  'us-west-2:39954b8f-6cf8-49af-b5bb-1a1db1dc18ed/1e6321c4-1134-4631-9ab5-2a0b91236755.jpg',
  'us-west-2:39954b8f-6cf8-49af-b5bb-1a1db1dc18ed/1ed1cf74-0647-4368-a198-b5621b4b094e.jpg',
  'us-west-2:39954b8f-6cf8-49af-b5bb-1a1db1dc18ed/610c2045-b613-40f8-a2bb-69df9fd902bd.jpg',
  'us-west-2:39954b8f-6cf8-49af-b5bb-1a1db1dc18ed/b97046b9-2296-44c4-b85d-96f2592677be.jpg',
  'us-west-2:39954b8f-6cf8-49af-b5bb-1a1db1dc18ed/db9ca199-186d-4ba6-9d2b-058cc9f53469.jpg',
  'us-west-2:39954b8f-6cf8-49af-b5bb-1a1db1dc18ed/58767c1f-e96b-4769-a69f-21ae4513fa4a.jpg',
  'us-west-2:39954b8f-6cf8-49af-b5bb-1a1db1dc18ed/7f3926e5-3ce9-431d-bcf0-ee6e7f9acd77.jpg',
  'us-west-2:39954b8f-6cf8-49af-b5bb-1a1db1dc18ed/c1f81ba5-0ad8-4c8e-989a-d5c2243d641a.jpg',
  'us-west-2:39954b8f-6cf8-49af-b5bb-1a1db1dc18ed/89384436-8d89-4222-b175-d48b2dd83612.jpg',
  'us-west-2:39954b8f-6cf8-49af-b5bb-1a1db1dc18ed/84417ec8-0f9e-4195-93fc-1806fe048cfd.jpg',
  'us-west-2:39954b8f-6cf8-49af-b5bb-1a1db1dc18ed/bbdec7ef-c7ed-4793-bb68-0ce227c345fa.jpg',
];

export default {
  components: {
    AppImg,
    AppImageInput,
    AppImageCrop,
  },
  props: {
    coverImage: {
      type: String,
      required: false,
      default: null,
    },
    showUploadButton: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      randomCovers,
      selectedIndex: null,
      selectedBanner: null,
      cover: null,
      showCrop: false,
    };
  },
  mounted() {
    if (this.coverImage) {
      const coverImg = this.coverImage;
      const index = this.randomCovers.indexOf(coverImg);
      if (index >= 0) {
        this.selectedIndex = index;
        this.selectedBanner = this.randomCovers[index];
      } else {
        this.cover = coverImg;
      }
    }
  },
  methods: {
    async selectImage() {
      const file = await $utils.selectFile('image/*');
      file.dataurl = URL.createObjectURL(file);
      this.imageSelected(file);
    },
    imageSelected(val) {
      this.selectedIndex = null;
      this.selectedBanner = null;
      this.cover = val;
      console.log('Cover', this.cover);
      this.showCrop = true;
      this.$emit('opened-crop');
      this.sendSelectedCover();
    },
    selectBannerImg(url, index) {
      this.selectedIndex = index;
      this.selectedBanner = url;
      this.cover = null;
      this.sendSelectedCover();
    },
    sendSelectedCover() {
      const cover = {
        selectedIndex: this.selectedIndex,
        selectedBanner: this.selectedBanner,
        cover: this.cover,
      };
      console.log('send selected Cover', cover);
      this.$emit('selected-cover', cover);
    },

    croppedCover(image) {
      this.$emit('closed-crop');
      this.showCrop = false;
      this.cover = image;
      this.sendSelectedCover();
    },
  },
};
</script>

<style scoped>
.header-image-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 10px;
  padding: 10px;
  border: 1px solid var(--cs-gray-02);
  overflow: auto;
  height: calc(100vh - 300px);
}
.header-image {
  margin-right: 5px;
  width: 450px;
}
.header-image__selected {
  border: 3px solid var(--cs-primary-base);
}
.preset {
  margin: 10px 0px;
}
.cover-footer {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
}

.selected-banner-preview {
  position: relative;
}

.upload-button {
  --cs-button-color: var(--cs-gray-00) !important;
  --cs-button-color-hover: var(--cs-gray-00) !important;
  --cs-button-text-color: var(--cs-gray-07) !important;
  --cs-button-padding: 2px 12px !important;
  position: absolute;
  right: 10px;
  bottom: 10px;
}
.banner-image {
  width: 100%;
}
</style>
