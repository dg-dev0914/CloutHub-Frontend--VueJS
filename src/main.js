import Vue from 'vue';
import axios from 'axios';
import VueAxios from 'vue-axios';
import { BootstrapVue } from 'bootstrap-vue';
import VueMoment from 'vue-moment';
import moment from 'moment-timezone';
import VueObserveVisibility from 'vue-observe-visibility';
import VueApollo from 'vue-apollo';
import vueCountryRegionSelect from 'vue-country-region-select';
import VueToast from 'vue-toast-notification';
import VueEasyLightbox from 'vue-easy-lightbox';
import 'firebase/analytics';
import VueChatScroll from 'vue-chat-scroll';
import PortalVue from 'portal-vue';
import { extend } from 'vee-validate';

import $amplitude from '@/services/amplitude';
import apolloClient from '@/services/apollo';
// import logger from '@/services/logger';
import * as rules from 'vee-validate/dist/rules';
import App from './App.vue';
import router from './router';
import VueVirtualScroller from './lib/vue-virtual-scroller';
import VueGtag from "vue-gtag";

import 'cs-components';
import 'cs-components/dist/csuite.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'vue-toast-notification/dist/theme-sugar.css';
import '@/assets/icons/css/styles.css';
import '@/assets/css/style.css';
import '@/assets/css/design-token.css';
import '@/assets/css/toast.css';
import '@/assets/css/slick-slider.css';

Vue.config.productionTip = false;
Vue.use(vueCountryRegionSelect);
Vue.use(VueToast);
Vue.use(VueAxios, axios);
Vue.use(VueObserveVisibility);
Vue.use(VueApollo);
Vue.use(VueEasyLightbox);
Vue.use(BootstrapVue);
Vue.use(VueMoment, { moment });
Vue.use(VueChatScroll);
Vue.use(VueVirtualScroller);
Vue.use(PortalVue);
Vue.use(VueGtag, {
  appName: "ch-desktop",
  config: {
    id: "G-Q0014B3L6M",
    params: { send_page_view: true }
  }
}, router);

axios.defaults.baseURL = process.env.VUE_APP_API_ENDPOINT;
if (localStorage.access_token)
  axios.defaults.headers.common.Authorization = `Bearer ${localStorage.access_token}`;

const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
});

Vue.directive('router-link', {
  inserted(el, binding, vnode) {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      vnode.context.$router.push(binding.value);
    });
  },
});

Vue.prototype.$amplitude = $amplitude.init();

new Vue({
  apolloProvider,
  router,
  render: (h) => h(App),
}).$mount('#app');

moment.tz.setDefault(moment.tz.guess());
moment.locale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s: '%ds',
    ss: '%ss',
    m: 'a minute',
    mm: '%dm',
    h: 'an hour',
    hh: '%dh',
    d: 'a day',
    dd: '%dd',
    M: 'a month',
    MM: '%dM',
    y: 'a year',
    yy: '%dY',
  },
});

Object.keys(rules).forEach((rule) => {
  extend(rule, rules[rule]);
});
