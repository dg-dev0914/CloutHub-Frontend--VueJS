<template>
  <div class="ch-follow-card-segment">
    <div class="ch-follow-card-segment__header">
      <div
        class="
          cs-textstyle-detail-heading
          ch-follow-card-segment__header--title
        "
      >
        {{ title }}
      </div>
      <cs-button
        v-if="!isPreview"
        v-router-link="{ name: 'UserList', params: { view: 'recommended' } }"
        size="small"
        fill="clear"
        class="ch-follow-card-segment__header--btn"
        >View All <i class="cs-icons-next-arrow ch-icons"></i
      ></cs-button>
    </div>
    <app-follow-list :people="displayPeople"></app-follow-list>
  </div>
</template>

<script>
import AppFollowList from '@/components/followCards/FollowList.vue';
import RecommendedUsers from '@/gql/connections/RecommendedUsers.gql';

export default {
  components: {
    AppFollowList,
  },
  props: {
    count: {
      type: Number,
      required: false,
      default: 6,
    },
    isPreview: {
      type: Boolean,
      default: true,
    },
    followers: {
      type: Array,
      required: false,
      default: null,
    },
    title: {
      type: String,
      required: false,
      default: 'Members to Follow',
    },
  },
  data() {
    return {
      people: null,
    };
  },
  computed: {
    displayPeople() {
      if (!this.people && !this.followers) return [];
      return this.isPreview && this.followers
        ? this.followers.slice(0, this.count)
        : this.people.slice(0, this.count);
    },
  },
  mounted() {
    if (!this.isPreview) {
      this.$apollo
        .query({
          query: RecommendedUsers,
          fetchPolicy: 'no-cache',
        })
        .then((response) => {
          this.people = response.data.people;
        });
    }
  },
};
</script>

<style scoped>
.ch-follow-card-segment {
  margin-bottom: 0;
  background-color: var(--cs-gray-00);
  padding: 15px;
}
.ch-follow-card-segment__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.ch-follow-card-segment__header--title {
  padding: 0 15px;
}
.ch-follow-card-segment__header--btn {
  --cs-button-padding: 0px 15px;
}
.ch-icons {
  margin-left: 5px;
}
.ch-video-segment >>> .ch-follow-list__main--wrapper:first-child {
  padding-left: 15px;
}
</style>
