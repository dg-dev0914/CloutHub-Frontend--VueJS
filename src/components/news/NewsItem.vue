<template>
  <div v-if="site" class="news-item cursor-pointer" :class="itemClass">
    <div class="news-item-card">
      <app-img
        class="news-item-cover cursor-pointer"
        :src="post.linkPreview.image || defaultPic"
      />
      <div class="news-item-body">
        <div class="cursor-pointer news-bottomline">
          <div class="news-header-spacing">
            <div
              v-router-link="{ name: 'NewsDetail', params: post }"
              class="cs-textstyle-paragraph-bold news-item-title"
            >
              {{ post.linkPreview.title }}
            </div>
            <div>
              <app-post-menu :post="post" />
            </div>
          </div>
          <div class="cs-textstyle-paragraph text-light news-item-description">
            {{ post.linkPreview.details }}
          </div>
        </div>
        <div class="news-item__bottom">
          <div
            v-router-link="{ name: 'NewsProfile', params: post.user }"
            class="news-item-author cursor-pointer"
          >
            <app-avatar
              :name="post.user.displayname"
              :picture="post.user.profilePhotoURL"
              size="medium"
            />
            <div>
              <div
                class="news-item-author-name cs-textstyle-paragraph-small-bold"
              >
                <app-username :user="post.user" type="displayname" />
              </div>
              <div class="cs-textstyle-paragraph-small text-light">
                {{ post.viewCount }} {{ viewsLabel }} ·
                {{ post.createdAt | moment('from') }}
              </div>
            </div>
          </div>
          <div class="news-extras">
            <div class="news-extras__icons">
              <app-share-button size="small" :post="post" title="Share News" />
              <app-bookmark-button size="small" :post="post" />
              <app-queue-button size="small" :post="post" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AppImg from '@/components/general/Img.vue';
import AppAvatar from '@/components/general/Avatar.vue';
import AppUsername from '@/components/general/Username.vue';
import AppShareButton from '@/components/post/buttons/ShareButton.vue';
import AppQueueButton from '@/components/post/buttons/QueueButton.vue';
import AppBookmarkButton from '@/components/post/buttons/BookmarkButton.vue';
import AppPostMenu from '@/components/post/items/PostMenu.vue';

const defaultPicUrl = require('@/assets/images/placeholders/group-picture.png');

export default {
  components: {
    AppImg,
    AppAvatar,
    AppBookmarkButton,
    AppQueueButton,
    AppShareButton,
    AppUsername,
    AppPostMenu,
  },
  props: {
    post: {
      type: Object,
      required: true,
    },
    itemClass: {
      type: String,
      default: 'col-md-4',
    },
  },
  computed: {
    site() {
      return this.post && this.post.linkPreview && this.post.linkPreview.url;
    },
    defaultPic() {
      return defaultPicUrl;
    },
    viewsLabel() {
      return this.post.viewCount === 1 ? 'view' : 'views';
    },
  },
};
</script>

<style scoped>
.news-item {
  padding: 3px;
}
.news-bottomline {
  height: 95px;
}
.news-item-card {
  border-radius: 10px;
  border: solid 1px var(--cs-gray-02);
  overflow: hidden;
  background-color: white;
  display: flex;
  height: 200px;
  flex-direction: row;
}
.news-item-cover {
  width: 223px;
  height: 200px;
  object-fit: cover;
}
.news-item__bottom {
  display: flex;
  justify-content: space-between;
  padding-top: 10px;
  border-top: solid 1px var(--cs-gray-01);
}
.news-item-body {
  padding: 15px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
}
.news-item-title,
.news-item-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.news-item-author {
  display: flex;
  gap: 10px;
}
* >>> .cs-article-card__author {
  overflow: hidden;
  text-overflow: ellipsis;
}
.news-extras {
  display: flex;
  white-space: nowrap;
  align-items: flex-end;
  padding-bottom: 8px;
}
.news-extras__icons {
  display: flex;
  flex-direction: row;
  align-items: center;
  color: var(--cs-gray-05);
  gap: 8px;
}
.news-date {
  font-size: 12px;
  margin: 0px;
}
.news-item-author-name {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.news-header-spacing {
  display: flex;
  justify-content: space-between;
}
</style>
