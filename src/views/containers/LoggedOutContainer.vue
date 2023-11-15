<template>
  <div class="layout">
    <div class="splash">
      <div class="overlay">
        <div class="message">
          <div class="cs-textstyle-page-title"> Welcome to Clouthub </div>
          <div class="cs-textstyle-informative-paragraph">
            CloutHub is using the power of the internet
            and social media for the purpose of bringing people together,
            empowering individuals to connect and solve issues they care about.
          </div>
        </div>
      </div>
    </div>
    <div class="router-view">
      <router-view/>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  position: fixed;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
}
.splash {
  background-image: url(./../../assets/images/welcome-bg.png);
  flex: 1;
}
.overlay {
  height: 100%;
  width: 100%;
  background: transparent linear-gradient(0deg, var(--cs-primary-base) 0%,
              #F38367B3 42%, #00000080 100%) 0% 0% no-repeat padding-box;
  display: flex;
  flex-direction: column-reverse;
}
.message {
  padding: 40px;
  color: #FFFFFF;
}
.router-view{
  width: 700px;
  padding-left: 124px;
  padding-top: 80px;
  padding-right: 74px;
}
</style>
