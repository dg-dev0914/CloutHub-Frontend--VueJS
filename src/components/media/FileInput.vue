<template>
  <div
    @drop.prevent="dropFiles"
    @dragover.prevent="highlight = true"
    @dragleave.prevent="highlight = false"
    @dragend.prevent="highlight = false"
    class="draggable"
    :class="{'highlight':highlight}"
  >
    <div class="">{{title}}</div>
    <div class="file-input-button-holder">
      <cs-button @click="selectFiles()">{{buttonLabel}}</cs-button>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      default: 'Drag files here',
    },
    buttonLabel: {
      type: String,
      default: 'Select files',
    },
    accept: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: '',
    },
    multiple: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      highlight: false,
    };
  },
  methods: {
    selectFiles() {
      const fi = document.createElement('input');
      fi.type = 'file';
      fi.accept = this.accept;
      fi.multiple = this.multiple;
      fi.addEventListener('input', () => {
        this.handle(fi.files);
      });
      fi.click();
    },
    dropFiles(e) {
      const droppedFiles = e.dataTransfer.files;
      if (!droppedFiles) return;
      this.handle(droppedFiles);
      this.highlight = false;
    },
    handle(files) {
      const matches = ([...files]).filter((f) => f.type.includes(this.type));
      if (matches.length) {
        const output = (this.multiple) ? matches : matches[0];
        this.$emit('selected', output);
      }
    },
  },
};
</script>
<style>
.draggable
{
  text-align: center;
  width: 100%;
  border: dashed 1px var(--cs-primary-base);
  padding: 50px;
}
.draggable.highlight
{
  border: solid 1px var(--cs-primary-base);
  background-color: var(--cs-primary-lightest);
}
.file-input-button-holder
{
  margin-top: 10px;
}
</style>
