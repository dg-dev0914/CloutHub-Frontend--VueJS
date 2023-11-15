<template>
  <div class="sidebar-card">
    <div class="cs_chw_card">
      <div class="cs_card_header header">Download Our Apps</div>
      <div class="body">
        <div class="d-flex">
          <a
            v-for="(app, index) in appStore"
            :key="index"
            class="store-icon mr-5 d-flex justify-content-center align-items-center"
            :href="app.link"
            target="_blank"
            ><div class="store-link"><img :src="app.icon" width="22px" height="25px" /></div>
            <span>{{ app.name }}</span></a
          >
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      appStore: [
        {
          name: 'Android',
          icon: require('@/assets/images/appstores/android.png'),
          link: 'https://play.google.com/store/apps/details?id=com.clouthub.clouthub',
        },
        {
          name: 'iOS',
          icon: require('@/assets/images/appstores/ios.png'),
          link: 'https://apps.apple.com/us/app/clouthub-social-networking/id1437607344',
        },
      ],
    };
  },
};
</script>
<style scoped>
.sidebar-card .cs_chw_card {
  /* box-shadow: 0px 3px 6px #0000000d; */
  border: none;
  background-color: var(--cs-gray-00);
  border-radius: var(--cs-card-border-radius);
}
.sidebar-card .cs_chw_card .cs_card_header {
  /* border-bottom: 1px solid var(--cs-gray-02); */
  padding: var(--cs-navtab-padding-y) var(--cs-card-padding-x);
  color: var(--gray-06);
}
.sidebar-card .cs_chw_card .cs_card_body .store-icon {
  color: var(--gray-06);
  font: normal normal bold 14px/21px Roboto;
  padding: var(--cs-button-padding-y) 0px;
}
.store-icon{
  margin: auto;
}
.sidebar-card .cs_chw_card .store-link {
  margin-right: 0.4rem;
}
.sidebar-card .cs_chw_card .store-icon  span{
  font-size: var(--cs-font-size-50);
  font-weight: var(--cs-font-weight-bold);
  margin-top: 2px;
}
</style>
