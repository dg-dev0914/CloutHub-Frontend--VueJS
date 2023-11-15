<template>
  <div>
    <div class="ch-create-post__body-txtarea">
      <app-avatar
        v-if="user"
        :picture="user.profilePhotoURL"
        :name="user.displayname"
        size="medium"
      />
      <div class="full-width">
        <app-textarea
          ref="composer"
          v-model="draftPost"
          placeholder="Share an article, photo, video or an idea..."
          class="ch-textarea"
          :class="draftPost.length >= allowedCharacters ? 'invalid-data' : null"
          :maxlength="allowedCharacters"
        />
        <!-- User list to mention in post -->
        <app-mention-user
          v-if="showList"
          :user-list="userList"
          @mention-user="mentionUser"
        />
      </div>
    </div>
    <div class="ch-create-post__body-extra">
      <span class="ch-character-cnt cs-textstyle-paragraph-extra-small"
        >{{ draftPost.length }}/{{ allowedCharacters }} characters</span
      >
      <span
        v-if="blockedUserFound"
        class="ch-character-cnt cs-textstyle-paragraph-small text-red"
        >You are not allowed to mention this user!</span
      >
      <div class="ch-extra-btns">
        <app-user-location
          v-if="isUserLocation"
          v-model="location"
          @add="addUserLocation"
          @remove="removeUserLocation"
        />
        <cs-button
          id="emoji-popover"
          variant="default"
          size="small"
          corners="round"
          class="cs-exta-btns"
          @click="showEmoji = !showEmoji"
        >
          <i class="ch-icons-reaction"></i>
        </cs-button>
        <app-emoji-picker
          :show="showEmoji"
          target="emoji-popover"
          @selected="selectEmoji"
        />
      </div>
    </div>
    <app-spinner v-if="loadingLink" class="ch-spinner"></app-spinner>
    <div v-if="link" class="ch-create-post__link-preview-holder">
      <app-link-preview
        :title="link.title"
        :src="link.url"
        :description="link.details"
        :picture="link.image"
        @remove="removeLinkPreview"
      />
    </div>
  </div>
</template>

<script>
// Js files
import $auth from '@/services/auth';
//  Graphql files
import UserSearch from '@/gql/search/UserSearch.gql';
import GetLinkPreview from '@/gql/general/GetLinkPreview.gql';
import GetProfile from '@/gql/general/GetProfile.gql';
// Components files
import AppAvatar from '@/components/general/Avatar.vue';
import AppUserLocation from '@/components/general/UserLocation.vue';
import AppEmojiPicker from '@/components/general/EmojiPicker.vue';
import AppSpinner from '@/components/general/Spinner.vue';
import AppTextarea from '@/components/general/Textarea.vue';
import AppLinkPreview from '@/components/general/LinkPreview.vue';
import AppMentionUser from '@/components/post/composer/MentionUser.vue';

export default {
  components: {
    AppAvatar,
    AppUserLocation,
    AppEmojiPicker,
    AppSpinner,
    AppTextarea,
    AppLinkPreview,
    AppMentionUser,
  },
  props: {
    value: {
      type: Object,
      required: false,
      default: null,
    },
    sharedLink: {
      type: String,
      required: false,
      default: '',
    },
    bodyText: {
      type: String,
      default: '',
    },
    isUserLocation: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      user: null,
      userSetting: null,
      draftPost: this.bodyText,
      showEmoji: false,
      link: '',
      loadingLink: false,
      ignoredLinks: [],
      linkTimer: null,
      showList: false,
      userSearchTimer: null,
      userList: null,
      blockedUserList: new Set(),
      textarea: null,
      blockedUserFound: false,
      location: this.value ? this.value.location : null,
    };
  },
  apollo: {
    user: {
      query: GetProfile,
      variables() {
        return {
          id: $auth.getUserId(),
        };
      },
    },
  },
  computed: {
    allowedCharacters() {
      return this.userSetting ? this.userSetting.postCharacters : 300;
    },
  },
  watch: {
    bodyText() {
      this.draftPost = this.bodyText || '';
    },
    draftPost() {
      this.handleInput(this.draftPost);
    },
  },
  async mounted() {
    if (this.sharedLink) this.draftPost = this.sharedLink;
    if (this.sharedLink && this.bodyText) {
      this.draftPost = `${this.bodyText}\n${this.sharedLink}`;
    }
    this.userSetting = await $auth.getUserSettings();
    this.textarea = this.$refs.composer.$el.querySelector('textarea');
    this.textarea.focus();
  },
  methods: {
    mentionUser(user) {
      const cursorPos = this.textarea.selectionStart;
      const beforeText = this.draftPost.substring(0, cursorPos);
      const beforeCursorWords = beforeText.replace(/\n/g, ' ').split(' ');
      const currentWord = beforeCursorWords[beforeCursorWords.length - 1];
      this.draftPost = this.draftPost.replace(currentWord, `${user.username} `);
      this.$nextTick(() => {
        this.textarea.selectionEnd = cursorPos + user.username.length;
        this.textarea.focus();
        this.showList = false;
      });
    },
    addUserLocation(location) {
      this.$emit('add', location);
    },
    removeUserLocation() {
      this.$emit('remove');
    },
    removeLinkPreview() {
      this.ignoredLinks.push(this.link.url);
      this.link = null;
      this.$emit('removeLinkPreview');
    },
    selectEmoji(emoji) {
      const cursorPos = this.textarea.selectionStart;
      const beforeText = this.draftPost.substring(0, cursorPos);
      const afterText = this.draftPost.substring(
        cursorPos,
        this.draftPost.length
      );
      this.draftPost = `${beforeText}${emoji}${afterText}`;
      this.$nextTick(() => {
        this.textarea.selectionEnd = cursorPos + emoji.length;
      });
    },
    async getLinks(notIgnoredLinks) {
      this.link = null;
      let url = notIgnoredLinks[0];
      if (!url.startsWith('http')) {
        url = `https://${url}`;
      }
      this.loadingLink = true;

      await this.$apollo
        .query({
          query: GetLinkPreview,
          variables: {
            url,
          },
        })
        .then(({ data }) => {
          const link = {
            ...data.link_preview,
            url,
          };
          delete link.__typename;
          link.url = url;
          this.link = link;
          this.$emit('detectLink', link);
        })
        .then(() => {
          this.loadingLink = false;
        })
        .catch(() => {
          // TODO: expose this error?
          this.loadingLink = false;
        });
    },
    async searchUsers(query) {
      const { data } = await this.$apollo.query({
        query: UserSearch,
        variables: {
          query,
        },
      });
      this.userList = data.users;
      data.users.forEach((user) => {
        if (user.myRelationship.isBlocked)
          this.blockedUserList.add(user.username);
      });
    },
    async handleInput(data) {
      if (!!this.link && !data.includes(this.link.url)) {
        this.link = null;
        this.$emit('removeLinkPreview');
      }

      if (!this.draftPost.length) {
        this.ignoredLinks = [];
      }
      this.$emit('textHandle', this.draftPost);
      const tags = [];
      this.textarea = this.$refs.composer.$el.querySelector('textarea');
      const cursorPos = this.textarea.selectionStart;
      const beforeText = this.draftPost.substring(0, cursorPos);
      const beforeCursorWords = beforeText.replace(/\n/g, ' ').split(' ');
      const currentWord = beforeCursorWords[beforeCursorWords.length - 1];
      if (currentWord.startsWith('@')) {
        this.showList = true;
        clearTimeout(this.userSearchTimer);
        this.userSearchTimer = setTimeout(
          () => this.searchUsers(currentWord),
          700
        );
      } else this.showList = false;

      const draftPostArray = this.draftPost.replace(/\n/g, ' ').split(' ');
      draftPostArray.forEach((datas) => {
        if (datas.startsWith('#')) {
          tags.push(datas.split('#')[1]);
        }
      });
      const foundMentionnedUsers = this.draftPost.match(/\B@[a-z0-9_-]+/gi);
      let containsBlockedUsers;
      if (foundMentionnedUsers && this.blockedUserList) {
        containsBlockedUsers = foundMentionnedUsers.reduce(
          (accumulator, mentionedUser) =>
            accumulator || !!this.blockedUserList.has(mentionedUser),
          false
        );
      }
      this.blockedUserFound = containsBlockedUsers;
      if (containsBlockedUsers) {
        this.$emit('blockPosting', true);
      } else {
        this.$emit('blockPosting', false);
      }

      this.$emit('handleTags', tags);
      if (!this.link) {
        clearTimeout(this.linkTimer);
        const links = this.draftPost.match(
          /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)/g
        );
        if (links) {
          const notIgnoredLinks = links.filter(
            (link) => !this.ignoredLinks.includes(link)
          );
          if (notIgnoredLinks.length) {
            this.linkTimer = setTimeout(
              () => this.getLinks(notIgnoredLinks),
              700
            );
          }
        }
      }
    },
  },
};
</script>

<style>
.ch-list-container {
  width: max-content;
  height: 16px;
  background: transparent;
  position: absolute;
}
.ch-create-post__body-txtarea {
  display: flex;
  flex-direction: row;
  gap: 10px;
}
.ch-textarea {
  display: flex;
  flex: 1;
  width: 100%;
}
.ch-textarea > .cs-textarea__textarea,
.ch-textarea > .cs-textarea__textarea:focus {
  border: solid 1px var(--cs-gray-00) !important;
  padding: 10px !important;
  outline: none;
}
.ch-textarea.invalid-data > .cs-textarea__textarea {
  border: solid 1px #dc3545 !important;
}
.link-preview {
  display: flex;
}
.link-preview p {
  width: 10px;
}
.full-width {
  width: 100%;
}
.popover-class {
  z-index: 999;
  color: black !important;
  background-color: black !important;
}
.ch-create-post__body-extra {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 15px -20px 0;
  padding: 12px 20px;
  justify-content: space-between;
  border-top: 1px solid var(--cs-gray-02);
  border-bottom: 1px solid var(--cs-gray-02);
}
.ch-character-cnt {
  color: var(--cs-gray-04);
}
.ch-extra-btns {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
}
.cs-exta-btns {
  width: 40px;
  height: 40px;
  padding: 0 !important;
}
.cs-exta-btns {
  --cs-button-color: var(--cs-gray-01) !important;
  --cs-button-text-color: var(--cs-gray-05) !important;
}
.ch-create-post__link-preview-holder {
  padding-bottom: 10px;
}

.text-red {
  color: red;
}
</style>
