<template>
  <div class="ch-link-preview">
    <div class="ch-link-preview__top">
      <div class="ch-link-preview__top-icon">
      </div>
    </div>

    <div class="ch-link-preview_data">
      <i class="cs-icons-delete ch-attachment-delete" v-if="!preview" @click="$emit('remove')"></i>
      <a class="ch-link-preview__content" @click.stop :href="src" target="_system">
        <div class="ch-link-preview__content-picture" v-if="picture">
          <img :src="picture" alt="picture" />
        </div>
        <div :class="['ch-link-preview__content-textbox', { 'ch-link-preview__content-textbox--nopicture': !picture }]">
          <div class="cs-textstyle-detail-heading ch-link-preview__content-textbox--title" v-if="title">
            {{ title }}
          </div>
          <div class="cs-textstyle-paragraph ch-link-preview__content-textbox--desc" v-if="description">
            {{ description }}
          </div>
          <div class="cs-textstyle-link-text ch-link-preview__content-textbox--src">{{ displaySrc }}</div>
        </div>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: null,
    },
    preview: {
      type: Boolean,
      default: false,
    },
    src: {
      type: String,
      default: null,
    },
    linkLabel: {
      type: String,
      default: 'Link',
    },
    picture: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    linkIcon: {
      type: String,
      default: 'cs-icons-link-filled',
    },
  },
  computed: {
    displaySrc() {
      return this.src || new URL(this.src).hostname;
    },
  },
};
</script>

<style scoped>
.ch-link-preview_data{
  background-color: var(--cs-gray-01);
  position: relative;

}
.ch-attachment-delete{
  background: var(--cs-white);
    font-size: 20px;
    padding: 5px 11px;
    right: 5px;
    cursor: pointer;
    position: absolute;
    color: var(--cs-secondary-dark);
    z-index: 1;
    border-radius: 10px;
    top: 5px;
    font-weight: 700;
    transition: 0.2s ease-in;
}

.ch-link-preview {
  min-width: 0;
}
.ch-link-preview__top {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.ch-link-preview__top-icon {
  color: var(--cs-primary-dark);
  margin-right: 5px;
  font-size: 14px;
}
.ch-link-preview__content {
  display: flex;
  border-radius: var(--cs-card-border-radius);
  border: 1px solid var(--cs-gray-02);
  margin-top: 8px;
  cursor: pointer;
  padding: var(--cs-card-padding-y) var(--cs-card-padding-x);
}

.ch-link-preview__content-picture {
  flex: 1;
  max-width: 80px;
}

.ch-link-preview__content-picture * {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 5px;
  border: 1px solid var(--cs-gray-02);
}

.ch-link-preview__content-textbox {
  flex: 2;
  min-width: 0px;
  padding-left: var(--cs-card-padding-x);
}

.ch-link-preview__content-textbox--nopicture {
  padding-left: 0px;
}

.ch-link-preview__content-textbox--title,
.ch-link-preview__content-textbox--desc,
.ch-link-preview__content-textbox--src {
  max-height: 48px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.ch-link-preview__content-textbox--title,
.ch-link-preview__content-textbox--desc {
  margin-bottom: 8px;
}
.ch-link-preview__content-textbox--desc {
  max-height: 72px;
  line-clamp: 3;
  -webkit-line-clamp: 3;
}
.ch-link-preview__content-textbox--src {
  max-height: 24px;
  word-break: break-all;
  line-clamp: 1;
  -webkit-line-clamp: 1;
  color: var(--cs-primary-dark);
}

@media (min-width: 768px) {
  .ch-link-preview__content-picture {
    max-width: 120px;
  }
}
</style>
