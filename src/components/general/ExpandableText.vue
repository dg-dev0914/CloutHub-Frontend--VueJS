<template>
  <div @click="showAll = !showAll">
    <div
      v-if="post.video.description"
      class="expandable-text"
      :style="{
        '-webkit-line-clamp': displayLineCount,
      }"
    >
      <span v-for="(data, i) in displayBody" :key="i">
        <!-- Normal text in body -->
        <span v-if="data.type === 'text'">{{ data.word }} </span>
        <!-- Link in post poby -->
        <a
          v-if="data.type === 'link'"
          class="ch-link"
          :href="data.link"
          target="_blank"
          >{{ data.word }}
        </a>
      </span>
    </div>
    <div v-else>No Description</div>
  </div>
</template>
<script>
export default {
  props: {
    post: {
      type: Object,
      required: true,
    },
    placeholder: {
      type: String,
      required: false,
      default: '',
    },
    maxLines: {
      type: Number,
      required: false,
      default: 1,
    },
    isDescription: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      showAll: false,
    };
  },
  computed: {
    displayLineCount() {
      return this.showAll ? 100 : this.maxLines;
    },
    displayBody() {
      const finalArray = [];
      const postLines = this.post.video.description.split(/\n/g);
      const previewLink = this.post.linkPreview
        ? this.post.linkPreview.originalLink
        : null;
      postLines.forEach((line) => {
        const bodyArray = line.split(' ');
        bodyArray.forEach((data) => {
          const link = data.match(
            /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g
          );
          if (link) {
            const email = data.match(/.*@.*/);
            if (data !== previewLink || email) {
              let clicableLink;
              if (email) clicableLink = `mailto:${data}`;
              else clicableLink = this.getClickableLink(data);
              finalArray.push({
                type: 'link',
                word: data,
                link: clicableLink,
              });
            }
          } else {
            finalArray.push({
              type: 'text',
              word: data,
            });
          }
        });
        finalArray.push({
          type: 'text',
          word: '\n',
        });
      });
      return finalArray;
    },
  },
  methods: {
    getClickableLink(link) {
      return link.startsWith('http://') || link.startsWith('https://')
        ? link
        : `http://${link}`;
    },
  },
};
</script>
<style scoped>
.expandable-text {
  white-space: pre-line;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.expandable-show {
  cursor: pointer;
  color: var(--cs-gray-04);
}
</style>
