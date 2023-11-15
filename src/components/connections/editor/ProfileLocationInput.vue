<template>
  <div class="profile-location-input">
    <!-- country  -->
    <div class="profile-location-input__label cs-textstyle-label-text">
      Country
    </div>
    <div class="cs-select__wrapper">
      <country-select
        v-model="country"
        :country="country"
        top-country="US"
        :country-name="true"
        class-name="cs-select__select"
        :autocomplete="true"
        @input="onSelectCountry"
      />
      <div class="cs-select__icon">
        <i class="cs-icons-expand-arrow"></i>
      </div>
    </div>
    <!-- State  -->
    <div class="profile-location-input__label cs-textstyle-label-text">
      State/Region
    </div>
    <div class="cs-select__wrapper">
      <region-select
        v-model="state"
        :country="country"
        :region="state"
        :country-name="true"
        :autocomplete="true"
        :class="{ disabled: hasNoCountry }"
        placeholder="Select State/Region"
        class-name="cs-select__select"
        :region-name="true"
        @input="onSelectState"
      />
      <div class="cs-select__icon">
        <i class="cs-icons-expand-arrow"></i>
      </div>
    </div>
    <!-- City -->
    <cs-input
      v-model="city"
      placeholder="Enter a City"
      label="City"
      :disabled="!state"
      @input="onSelectCity"
    ></cs-input>
    <cs-button
      variant="default"
      size="small"
      corners="round"
      class="cs-exta-btns"
      @click="getLocation"
    >
      <i class="cs-icons-marker"></i>
    </cs-button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  props: {
    value: {
      type: Object,
      required: false,
      default: () => ({}),
    },
  },
  data() {
    let country;
    let state;
    let city;
    let hasNoCountry;
    if (this.value && this.value.address) {
      const locationParts = this.value.address
        .split(',')
        .reverse()
        .map((l) => l.trim());
      if (locationParts[0] === 'USA') {
        country = 'United States';
      } else {
        country = locationParts[0] || '';
      }
      state = locationParts[1] || '';
      city = locationParts[2] || '';
    }
    if (!country) {
      hasNoCountry = true;
    }
    return {
      country,
      state,
      city,
      hasNoCountry,
    };
  },
  methods: {
    async getLocation() {
      const { data } = await axios.get('https://ipapi.co/json/');
      if (data) {
        if (data.country_name) {
          this.country = data.country_name;
        }
        if (data.region) {
          setTimeout(() => {
            this.state = data.region;
          }, 5);
        }
        if (data.city) {
          setTimeout(() => {
            this.city = data.city;
          }, 5);
        }
        this.update();
      }
    },
    onSelectCountry() {
      this.state = '';
      this.city = '';
      if (!this.country) {
        this.hasNoCountry = true;
      } else {
        this.hasNoCountry = false;
      }
      this.update();
    },
    onSelectState() {
      this.city = '';
      this.update();
    },
    onSelectCity() {
      this.update();
    },
    update() {
      this.$emit('input', {
        address: [this.city, this.state, this.country].join(', '),
      });
    },
  },
};
</script>

<style scoped>
.cs-exta-btns {
  width: 45px;
  height: 25px;
  padding: 0 !important;
  --cs-button-color: var(--cs-gray-01) !important;
  --cs-button-text-color: var(--cs-gray-05) !important;
}
.profile-location-input {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.profile-location-input__label {
  color: var(--cs-gray-05);
}
.cs-select__wrapper {
  display: flex;
  position: relative;
  overflow: hidden;
  height: 40px;
  width: 100%;
  white-space: nowrap;
  align-items: center;
  box-sizing: border-box;
  background-color: var(--cs-gray-00);
  border: 1px solid;
  border-color: var(--cs-gray-02);
  border-radius: var(--cs-input-border-radius);
  white-space: nowrap;
  overflow: hidden;
}
.cs-select__wrapper:focus-within {
  border-color: var(--cs-gray-03);
}
.cs-select__select {
  -webkit-appearance: none;
  -moz-appearance: none;
  background: transparent;
  background-image: none;
  padding-left: var(--cs-form-input-padding-x);
  padding-right: 40px;
  height: 100%;
  width: 100%;
  color: var(--cs-gray-07);
  width: 100%;
  border: 0;
  z-index: 1;
}
.cs-select__select::-ms-expand {
  display: none; /* Hide the default arrow in Internet Explorer 10 and Internet Explorer 11 */
}
.cs-select__select:focus {
  outline: none;
}

.cs-select__icon {
  position: absolute;
  right: var(--cs-form-input-padding-x);
  top: 50%;
  width: 18px;
  transform: translateY(-50%);
  font-size: 18px;
  pointer-events: none;
  color: var(--cs-gray-03);
}
.cs-select__wrapper:focus-within .cs-select__icon {
  color: var(--cs-gray-07);
}
.disabled {
  pointer-events: none;
  color: var(--cs-gray-04);
  cursor: not-allowed;
  background-color: var(--cs-gray-01);
  border-color: var(--cs-gray-02);
}
</style>
