<template>
  <div class="announcement-view">
    <div class="announcement-view__top cs-textstyle-paragraph-bold">
      Announcement
    </div>
    <div class="announcement-view__info">
      <div v-if="announcement.id" class="announcement-view__header">
        <app-avatar
          :picture="group.picture"
          :name="group.name"
          size="large"
          class="announcement-view__avatar"
        />
        <div>
          <h4 class="announcement-view__group-name">{{ group.name }}</h4>
          <span class="announcement-view__author">
            by {{ announcement.user.username }}
          </span>
        </div>
      </div>
      <p class="announcement-view__description">
        {{ announcement.description }}
      </p>
      <cs-button
        v-if="announcement.link"
        :href="announcement.link"
        target="_blank"
      >
        Visit Website
      </cs-button>
      <cs-button @click="visitGroup"> Visit Group </cs-button>
    </div>
  </div>
</template>

<script>
import AppAvatar from '@/components/general/Avatar.vue';
import GetAnnouncement from '@/gql/groups/GetAnnouncement.gql';

export default {
  components: {
    AppAvatar,
  },
  apollo: {
    announcement: {
      query: GetAnnouncement,
      variables() {
        return {
          id: this.$route.params.id,
        };
      },
    },
  },
  data() {
    return {
      announcement: {},
    };
  },
  computed: {
    group() {
      return this.announcement.group;
    },
    id() {
      return this.$route.params.id;
    },
  },
  methods: {
    visitGroup() {
      if (this.id === this.group.id) {
        this.close();
      } else if (this.group)
        this.$router.push({
          name: 'GroupDetail',
          params: { id: this.group.id },
        });
    },
  },
};
</script>

<style scoped>
.announcement-view {
  background: white;
  border-radius: 5px;
  height: calc(100vh - 100px);
  overflow: auto;
}
.announcement-view__top {
  padding: 10px;
  border-bottom: 1px solid #e6eaea;
}
.announcement-view__info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.announcement-view__description {
  width: 80%;
  text-align: center;
  overflow-wrap: break-word;
  color: var(--cs-gray-05);
}
.announcement-view__icon {
  font-size: 70px;
  color: var(--cs-primary-base);
}
.announcement-view__header {
  display: flex;
  margin-bottom: 2rem;
  margin-top: 2rem;
}
.announcement-view__group-name {
  margin-top: 0.5rem;
}
.announcement-view__avatar {
  margin-right: 1rem;
}
.announcement-view__author {
  font-size: var(--cs-font-size-200);
  color: var(--cs-gray-04);
}
</style>
