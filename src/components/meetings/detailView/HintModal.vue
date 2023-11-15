<template>
  <app-modal :show="show" title="Step 2 - Helpful hints" @close="closeModal">
    <div>Below are the description of each function</div>

    <div class="info">
      <span class="topic"> Handouts </span>
      <span class="about"> Location of file upload by host </span>
    </div>

    <div class="info">
      <span class="topic"> Breakouts </span>
      <span class="about"> Location of Meetings moung members</span>
    </div>

    <div class="info">
      <span class="topic">
        <cs-button size="small" fill="outline"> Invite </cs-button>
      </span>
      <span class="about"> Sends Invite to members</span>
    </div>

    <div class="info">
      <span class="topic">
        <i class="ch-icons-share meeting-share-button__icon" />
        <span class="cs-textstyle-paragraph-small-bold"> Share </span>
      </span>
      <span class="about">
        Shares events in the platform or outside the platforn</span
      >
    </div>

    <div class="info">
      <span class="topic">
        <cs-button size="small" variant="primary"> Go Live </cs-button>
      </span>
      <span class="about"> Activates tour camera and microphone</span>
    </div>

    <div class="info">
      <span class="topic">
        <div class="black-background">
          <i class="cs-icons-microphone media-icon"></i>
          <i class="cs-icons-video media-icon"></i>
          <i class="cs-icons-channels media-icon"></i>
        </div>
      </span>
      <span class="about">
        Indicates your microphone, camera and screen share is enabled</span
      >
    </div>

    <div class="info">
      <span class="topic">
        <cs-button size="small" variant="secondary">
          <i class="cs-icons-settings mr-2"></i>
        </cs-button>
      </span>
      <span class="about">
        Open settings where you can change your microphone or camera</span
      >
    </div>

    <div class="info">
      <span class="topic">
        <cs-button fill="solid" size="small" variant="secondary">
          Leave
        </cs-button>
      </span>
      <span class="about">Leaves the event</span>
    </div>

    <div class="info">
      <span class="topic">
        <cs-button size="small" variant="secondary"> End Event </cs-button>
      </span>
      <span class="about"> Ends the event</span>
    </div>

    <slot slot="footer">
      <div class="footer">
        <cs-button size="small" @click="next"> {{ buttonLable }} </cs-button>
      </div>
    </slot>
  </app-modal>
</template>

<script>
import AppModal from '@/components/general/Modal.vue';

export default {
  components: {
    AppModal,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    buttonLable: {
      type: String,
      default: 'Proceed to event',
    },
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
    next() {
      this.$emit('startMeeting');
      this.closeModal();
    },
  },
};
</script>

<style scoped>
.footer {
  float: right;
}
.info {
  margin-top: 10px;
  display: flex;
}
.topic {
  font-size: var(--cs-font-size-200);
  /* margin-top: 20px; */
  width: 150px;
  margin-right: 10px;
}
.about {
  font-size: var(--cs-font-size-150);
  color: var(--cs-gray-05);
}
.black-background {
  background: black !important;
  height: 50px;
}
.media-icon {
  background: green;
  font-size: 20px;
  width: 30px;
  height: 30px;
}
</style>
