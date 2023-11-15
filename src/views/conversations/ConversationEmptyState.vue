<template>
  <div class="empty-conversation">
    <cs-empty-state>
      <div slot="title" class="cs-textstyle-item-heading">
        <app-img
          class="ch-conversation-list__empty-slot-img mb-4"
          :src="appImgUrl"
        />
        <br />
        No Messages Found
      </div>
      <div slot="description" class="empty-conversation__desc">
        Check the other tab
      </div>
      <div slot="button">
        <cs-button @click="openNewMessageModal">Start Conversation</cs-button>
      </div>
    </cs-empty-state>
  </div>
</template>

<script>
import $bus from '@/services/bus';
import AppImg from '@/components/general/Img.vue';

const appImgUrl = require('@/assets/images/groups/no-message.svg');

export default {
  components: {
    AppImg,
  },
  data() {
    return { appImgUrl };
  },
  methods: {
    openNewMessageModal() {
      $bus.$emit('new-message-modal', {});
    },
  },
};
</script>

<style scoped>
.empty-conversation {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
}
.empty-conversation__desc {
  color: var(--cs-gray-04);
  font-size: var(--cs-font-size-100);
}
</style>
