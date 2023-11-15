<template lang="html">
  <app-modal class="ch-report-modal" :show="show" :title="title" @close="close">
    <div v-if="type" class="ch-report-modal__body">
      <app-spinner v-if="saving" />
      <div v-if="!saving">
        Why are you reporting this {{ type === 'own-video' ? 'video' : type }}?
        <div class="ch-check-box">
          <cs-checkbox
            v-for="reason in reasons"
            :key="reason.label"
            v-model="reason.checked"
            class="ch-report-issue"
            :label="reason.label"
            @input="onInput"
          />
        </div>
        <app-textarea
          v-model="comment"
          class="ch-report-comment"
          label="Comment (optional)"
          placeholder="Type a comment"
          @input="onInput"
        />
        <div>
          <cs-button
            class="submit-btn"
            :disabled="saving || invalidForm"
            @click="report"
            >Report</cs-button
          >
        </div>
      </div>
    </div>
  </app-modal>
</template>

<script>
import reportReasons from '@/assets/config/reportreasons.json';
import ReportEntity from '@/gql/general/ReportEntity.gql';
import $bus from '@/services/bus';
import AppModal from '@/components/general/Modal.vue';
import AppTextarea from '@/components/general/Textarea.vue';
import AppSpinner from '@/components/general/Spinner.vue';

export default {
  components: {
    AppModal,
    AppTextarea,
    AppSpinner,
  },
  data() {
    return {
      saving: false,
      comment: '',
      type: '',
      id: '',
      show: false,
      invalidForm: true,
    };
  },
  computed: {
    reasons() {
      if (!this.type) return [];
      return reportReasons[this.type].map((r) => ({
        label: r,
        checked: false,
      }));
    },
    title() {
      if (this.type) {
        if (this.type === 'own-video') {
          return 'Report video';
        }
        return `Report ${this.type}`;
      }
      return '';
    },
  },
  mounted() {
    $bus.$on('show-report-modal', ({ type, id }) => {
      this.id = id;
      this.type = type;
      this.show = true;
      this.saving = false;
      this.comment = '';
    });
  },
  methods: {
    async report() {
      this.saving = true;
      const issues = this.reasons.filter((r) => r.checked).map((r) => r.label);
      await this.$apollo.mutate({
        mutation: ReportEntity,
        variables: {
          type: this.type,
          id: this.id,
          comment: this.comment,
          issues,
        },
      });
      this.$toast.open({
        message: 'Sent',
        type: 'success',
        duration: 3000,
        dismissible: true,
        position: 'top',
      });
      this.saving = false;
      this.close();
    },
    close() {
      this.show = false;
    },
    onInput() {
      const issues = this.reasons.filter((r) => r.checked).map((r) => r.label);
      this.invalidForm = !(this.comment.trim() !== '' || issues.length !== 0);
    },
  },
};
</script>

<style scoped>
.ch-report-modal__body {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.ch-report-comment {
  padding-top: 20px;
  width: 100%;
}
.ch-report-issue {
  min-width: 180px;
}
.ch-check-box {
  column-count: 2;
}
.submit-btn {
  margin-top: 10px;
  float: right;
}
</style>
