<template>
  <div class="card-no-padding card-margin sidebar-card">
    <div>
      <div class="header cs-textstyle-paragraph-bold">Trending Today</div>
    </div>
    <div class="topic-list">
      <router-link
        v-for="(tag, $index) in topics"
        :key="$index"
        class="topic"
        :to="{ name: 'Tag', params: { tag: tag.tag } }"
      >
        <div class="topic-tag">
          <div class="cs-textstyle-paragraph-small">
            <span class="mr-2 tag-count">{{ $index + 1 }}.</span
            ><span class="cs-textstyle-paragraph-small-bold">
              #{{ tag.tag }}</span
            >
          </div>
        </div>
        <div class="topic-count">
          <div class="cs-textstyle-paragraph-small-bold">{{ tag.count }}</div>
        </div>
      </router-link>
    </div>
  </div>
</template>
<script>
import TrendingTopics from '@/gql/general/TrendingTopics.gql';

export default {
  apollo: {
    topics: TrendingTopics,
  },
};
</script>
<style scoped>
.orangeText {
  color: #f16027;
  cursor: pointer;
  margin-top: 2px;
}

.header {
  padding: var(--cs-card-padding-y) var(--cs-card-padding-x);
  border-bottom: 1px solid var(--cs-gray-02);
  color: var(--cs-gray-06);
}

.topic {
  display: flex;
  flex-direction: row;
  border-top: 1px solid var(--cs-gray-02);
  justify-content: space-between;
  background: white;
  padding: 10px 0px;
  margin: 0px 15px;
}
.topic:first-child {
  border-top: none;
}

.topic-tag {
  display: flex;
  flex-direction: row;
  padding: 0px;
  color: var(--cs-primary-base);
  font-size: 12px;
}

.topic-tag .tag-count {
  color: var(--cs-gray-05);
  margin-right: 5px;
}
.topic-count {
  color: var(--cs-gray-05);
}
</style>
