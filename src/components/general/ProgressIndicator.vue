<template>
  <div class="progress-indicator">
    <div
      v-for="(step, index) in steps"
      :key="step"
      class="progress-indicator__container"
    >
      <div class="progress-box" :class="{ 'hide-line': step === steps }">
        <div class="cs-textstyle-paragraph-extra-small-bold">
          Step {{ step }}
        </div>

        <div
          class="progress-extras"
          :class="[
            { 'hide-line': step === steps },
            { active: index === activeStep - 1 || activeStep - 1 >= index },
          ]"
        >
          <div
            class="progress-bullet"
            :class="{
              active: index === activeStep - 1 || activeStep - 1 >= index,
            }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    steps: {
      type: Number,
      required: true,
    },
    activeStep: {
      type: Number,
      required: true,
    },
  },
};
</script>

<style scoped>
.progress-indicator {
  position: relative;
  display: flex;
  flex-direction: row;
}
.progress-indicator__container {
  display: flex;
  flex-direction: row;
}
.progress-box {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100px;
}
.progress-box.hide-line {
  width: 35px;
}
.progress-extras {
  display: flex;
  flex-direction: row;
  position: relative;
  width: 100%;
}

.progress-bullet {
  background-color: var(--cs-gray-03);
  width: 20px;
  height: 20px;
  border-radius: 50%;
}
.progress-bullet.active {
  background-color: var(--cs-primary-base);
}
.progress-extras::after {
  content: '';
  width: calc(100% - 18px);
  height: 5px;
  background: var(--cs-gray-03);
  display: block;
  position: relative;
  top: 35%;
}
.progress-extras.active::after {
  background-color: var(--cs-primary-base);
}

.hide-line.progress-extras::after {
  display: none;
}
</style>
