<template>
  <div class="ch-location">
    <cs-small-tag
      variant="default"
      v-if="showAddress && address"
    >
      <span>
        <i class="cs-icons-marker-filled"/>
        {{address}}
        <i class="cs-icons-close-filled" @click="removeLocation"/>
      </span>
    </cs-small-tag>
    <div v-if="!showAddress">
      <cs-button id="addressPopoverIcon" variant="default" size="small" corners="round" class="cs-exta-btns" @click="getLocation">
        <i class="cs-icons-marker" />
      </cs-button>
      <b-popover
        ref="addressPopover"
        target="addressPopoverIcon"
        placement="bottom"
        triggers="click blur"
        custom-class="menu-popover"
      >
        <cs-textarea
          v-model="address"
          placeholder="Enter a location"
          label="Location"
          :disabled="!address"
        />
        <cs-button
          variant="primary"
          size="small"
          fill="outline"
          :disabled="!address"
          @click="addAddress"
        >
          <i class="cs-icons-add"></i> <span>Add</span>
        </cs-button>
      </b-popover>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import AppSpinner from '@/components/general/Spinner.vue';

export default {
  props: {
    value: String,
  },
  components: {
    AppSpinner,
  },
  data() {
    return {
      address: this.value,
      showAddress: false,
    };
  },
  mounted() {    
    if(this.location) this.address = this.location;
  },
  methods: {
    async addAddress() {
      this.showAddress = true;
      this.$emit('add', this.address);
    },
    async getLocation() {
      const { data } = await axios.get('https://ipapi.co/json/');
      if (data) {
        this.address = '';
        if (data.city) this.address = `${data.city}, `;
        if (data.region) this.address += `${data.region}, `;
        if (data.country_name) this.address += `${data.country_name}`;
      }
    },
    removeLocation() {
      this.showAddress = false;
      this.address = null;
      this.$emit('remove');
    },
  },
};
</script>
<style scoped>
.cs-exta-btns{
   --cs-button-color: var(--cs-gray-01) !important;
    --cs-button-text-color: var(--cs-gray-05) !important;
  width: 40px;
  height: 40px;
  padding: 0 !important;
}
.spinner-location-box {
  margin-right: 20px;
}
.ch-location{
  min-height: 45px;
}
</style>
