<template>
  <div class="cs-follow-recommend">
    <app-modal
      :show="show"
      class="cs-follow-recommend__modal"
      title="People you might like to follow"
      @close="onCloseModal"
    >
      <div class="cs-follow-recommend__body">
        <div class="row follow-scroll">
          <div
            v-for="(person, index) in people"
            :key="index"
            class="col-md-3 col-lg-3 mb-3"
          >
            <cs-card no-divider>
              <div slot="media" class="cs-follow-cover">
                <img :src="person.cover" />
              </div>
              <div slot="header">
                <div class="cs-follow-avatar text-center">
                  <app-avatar
                    :picture="person.picture"
                    :name="person.name"
                    size="medium"
                  />
                  <h3>
                    {{ person.name }}
                  </h3>
                  <h4>
                    {{ person.handler }}
                  </h4>
                </div>
              </div>
              <div slot="body">
                <p
                  v-if="person.description.length > 60"
                  style="
                    overflow-wrap: break-word;
                    word-wrap: break-word;
                    hyphens: auto;
                  "
                >
                  {{
                    person.description.substring(0, 60) +
                    ' ' +
                    person.description.substring(60, person.description.length)
                  }}
                </p>
                <p
                  v-else
                  style="
                    overflow-wrap: break-word;
                    word-wrap: break-word;
                    hyphens: auto;
                  "
                >
                  {{ person.description }}
                </p>
              </div>
              <div slot="footer" class="text-center">
                <cs-button
                  :variant="'primary'"
                  :fill="'outline'"
                  :size="'small'"
                  >Follow</cs-button
                >
              </div>
            </cs-card>
          </div>
        </div>
      </div>
    </app-modal>
  </div>
</template>

<script>
// TODO: this has been updated with app-modal but because it's not been tested fully
import AppModal from '@/components/general/Modal.vue';
import AppAvatar from '@/components/general/Avatar.vue';

export default {
  components: {
    AppModal,
    AppAvatar,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    people: {
      type: Array,
    },
  },
  methods: {
    onCloseModal() {
      this.$emit('close');
    },
  },
};
</script>

<style scoped>
.cs-follow-recommend__body {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.cs-follow-recommend .follow-scroll {
  overflow: auto;
  max-height: 600px;
}
.cs-follow-recommend .cs-follow-recommend__modal >>> .cs-card {
  margin: 0px !important;
}
.cs-follow-recommend .cs-follow-recommend__modal >>> .cs-card h3 {
  font-size: var(--cs-font-size-100) !important;
  color: var(--cs-secondary-light);
  font-weight: var(--cs-font-weight-bold);
}
.cs-follow-recommend .cs-follow-recommend__modal >>> .cs-card h4 {
  font-size: var(--cs-font-size-50) !important;
  color: var(--cs-secondary-lightest);
}
.cs-follow-recommend .cs-follow-recommend__modal >>> .cs-card p {
  color: var(--cs-gray-05);
  font-size: var(--cs-font-size-50) !important;
}
.cs-follow-recommend .cs-follow-recommend__modal >>> .cs-card .cs-card__info {
  position: relative;
}
.cs-follow-recommend .cs-follow-recommend__modal >>> .cs-card .cs-follow-cover {
  overflow: hidden;
  height: 100px !important;
}
.cs-follow-recommend
  .cs-follow-recommend__modal
  >>> .cs-card
  .cs-follow-cover
  img {
  height: 100px !important;
  max-height: 100px;
}
.cs-follow-recommend
  .cs-follow-recommend__modal
  >>> .cs-card
  .cs-follow-avatar {
  position: absolute;
  top: -30px;
  left: 0px;
  width: 100%;
}
.cs-follow-recommend .cs-follow-recommend__modal >>> .cs-card .cs-card__body {
  margin-top: 65px;
  text-align: center;
}
.cs-follow-recommend
  .cs-follow-recommend__modal
  >>> .cs-card
  .cs-follow-avatar
  .ch-avatar__content {
  border: 2px solid var(--cs-gray-00);
}

::-webkit-scrollbar {
  width: 5px;
  border-radius: 10px;
}

/* Track */
::-webkit-scrollbar-track {
  background: var(--cs-gray-00);
  border-radius: 10px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: var(--cs-gray-02);
  border-radius: 10px;
}
</style>
