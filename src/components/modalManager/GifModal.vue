<template>
  <app-modal
    :show="showModal"
    class="gif-modal"
    title="Select GIFs"
    @close="onCloseGIF"
  >
    <div class="ch-gifs-body">
      <cs-search-bar
        placeholder="Search all the GIFs"
        @input="onInput"
      ></cs-search-bar>
      <div v-if="gifs" class="ch-gifs-body__content">
        <div class="ch-gifs-images">
          <app-img
            v-for="gif in gifs"
            :key="gif.id"
            :src="gif.url"
            class="ch-gif-img"
            @click="gifSelect(gif)"
          />
        </div>
        <cs-empty-state v-if="gifs.length === 0" description="No results" />
      </div>
      <div v-else>
        <app-spinner class="ch-spinner"></app-spinner>
      </div>
    </div>
  </app-modal>
</template>

<script>
import $auth from '@/services/auth'; // Make sure to import the auth service
import $bus from '@/services/bus';
import AppSpinner from '@/components/general/Spinner.vue';
import AppModal from '@/components/general/Modal.vue';
import AppImg from '@/components/general/Img.vue';
import SearchGiphy from '@/gql/general/SearchGiphy.gql';

export default {
  components: {
    AppModal,
    AppImg,
    AppSpinner,
  },
  data() {
    return {
      showModal: false,
      offset: 0,
      search: 'trending',
      isLoggedIn: false,
    };
  },
  async created() {
    this.isLoggedIn = await $auth.isLoggedInAsUser();
  },
  apollo: {
    gifs: {
      skip() {
        return !this.isLoggedIn; // Skip query if user is not logged in
      },
      query: SearchGiphy,
      variables() {
        return {
          query: this.search,
          offset: this.offset,
        };
      },
    },
  },
  mounted() {
    $bus.$on('show-select-gif-modal', () => {
      this.showModal = this.isLoggedIn; // Only show the modal if the user is logged in
    });
  },
  methods: {
    onCloseGIF() {
      this.search = 'trending';
      this.showModal = false;
    },
    onInput(query) {
      this.search = query;
    },
    gifSelect(gif) {
      $bus.$emit('gif-modal-select', gif);
      this.onCloseGIF();
    },
  },
};
</script>

<style scoped>
.cs-icons {
  font-size: 20px;
}
.ch-gifs-title {
  font-size: 16px;
  font-weight: bold;
}
.ch-gifs-body {
  width: -webkit-fill-available;
  min-height: 460px;
}
.ch-gifs-body__content {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  overflow-y: auto;
}
.ch-gifs-images {
  flex: 1 1 auto;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-evenly;
}
.ch-gif-img {
  height: 120px;
  width: 120px;
  border-radius: 3px;
  object-fit: contain;
}
.gif-modal >>> .ch-modal__popup {
  z-index: 10;
}
</style>
