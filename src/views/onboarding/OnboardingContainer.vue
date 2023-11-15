<template>
  <div class="layout">
    <div class="container">
      <div class="row">
        <div class="column centered-content">
          <div class="mb-2 cs-textstyle-item-heading info">
            Welcome to the CloutHub community where you can socialize, connect,
            and collaborate on topics that matter to you most, and ultimately,
            change lives one “clout” at a time.
          </div>
        </div>
        <div class="column first">
          <div class="router-view">
            <router-view />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {},
  data() {
    return {
      showNewPosts: false,
    };
  },
};
</script>
<style scoped>
.row {
  display: flex;
  flex-direction: row;
  width: 100%;
}

.column {
  width: 50%;
  height: 100vh;
}
.centered-content {
  display: flex;
  height: 60vh;
  flex-direction: column;
  justify-content: center;
}

.info {
  margin-top: 65px;
  font: normal normal bold 22px/21px Roboto;
  text-align: center;
  line-height: 25px;
  color: var(--cs-gray-05);
}

.router-view {
  position: fixed;
  margin-top: 1rem;
}

.layout {
  margin: 0 auto;
  display: flex;
  width: 100%;
  overflow-y: auto;
}

.splash {
  flex: 1;
}

.login-form,
.reset-password-form,
.signup-form {
  width: 512px;
}

.overlay {
  display: flex;
  flex-direction: column-reverse;
  height: 100%;
  width: 100%;
  background: transparent
    linear-gradient(
      0deg,
      var(--cs-primary-base) 0%,
      #f38367b3 42%,
      #00000080 100%
    )
    0% 0% no-repeat padding-box;
}

.message {
  padding: 40px;
  color: #ffffff;
}

.router-view {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 100px;
  margin: 0 auto;
}

@media (min-width: 1280px) {
  .router-view {
    padding: 20px 80px;
  }
}

@media (min-width: 1024px) and (max-width: 1300px) {
  .layout {
    padding: 0 30px 60px;
  }
  .router-view {
    padding: 4rem 30px;
  }
}

@media (max-width: 1024px) {
  .column {
    width: 100%;
    height: auto;
  }

  .router-view {
    position: relative;
    padding: 2rem 0;
  }

  .row {
    flex-direction: row-reverse;
  }

  .first {
    order: -1 !important;
  }
}

@media (min-width: 1600px) {
  .router-view {
    padding: 4rem 120px;
  }
}

.cs-page-title {
  margin-bottom: 15px;
}

.cs-informative-paragraph {
  width: 80%;
}
</style>
