<template>
  <div>
    <conversation-detail :id="$route.params.conversationId" />
  </div>
</template>

<script>
import ConversationDetail from '@/components/conversations/ConversationDetail.vue';

export default {
  components: {
    ConversationDetail,
  },
  data() {
    return {
      id: this.$route.params.conversationId,
    };
  },
};
</script>
