<template>
  <div
    class="ad-container"
    ref="adContainer"
    :style="{ width: width + 'px', height: height + 'px' }"
  >

    <ins
      :data-revive-zoneid="invocationCode"
      data-revive-target="_blank"
      data-revive-id="c504d9cfdaddca6ee1d8b7703fb4886a"
    ></ins>
    <script2 async src="//ads.clouthub.com/www/delivery/asyncjs.php"></script2>

    <script2
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9013020691147323"
      crossorigin="anonymous"
    >
    </script2>
    <ins
      class="adsbygoogle"
      style="display: inline-block; width: 125px; height: 125px"
      data-ad-client="ca-pub-9013020691147323"
      data-ad-slot="4883941533"
      data-ad-format="auto"
    >
    </ins>
    <script2> (adsbygoogle = window.adsbygoogle || []).push({}); </script2>
  </div>
</template>

<script>
import GetAdZone from '@/gql/general/GetAdZone.gql';
import Vue from 'vue';
//import Adsense from 'vue-google-adsense/dist/Adsense.min.js';
//import InArticleAdsense from 'vue-google-adsense/dist/InArticleAdsense.min.js';
//import InFeedAdsense from 'vue-google-adsense/dist/InFeedAdsense.min.js';
Vue.use(require('vue-script2'));
//Vue.use(Adsense);

export default {
  props: {
    zoneName: {
      type: String,
      required: true,
      default: '',
    },
    width: {
      type: [String, Number],
      required: false,
      default: '300',
    },
    height: {
      type: [String, Number],
      required: false,
      default: '250',
    },
    invocationCode: {
      type: String,
      required: false,
      default: '',
    },
  },
  apollo: {
    adZone: {
      query: GetAdZone,
      variables() {
        return {
          zone_name: this.zoneName,
        };
      },
    },
    result({ data }) {
      console.log("adzone data:", data);
      this.height = this.adZone.ad_size.split('x')[1];
      this.width = this.adZone.width;
      if (data && data.adZone) {
        this.invocationCode = data.adZone.invocation_code;
      }
    },
  },
  computed: {
    adsrc() {
      return `/ad.html?wid=${this.zoneName}`;
    },
  },
  data() {
    return {
      adContainer: null,
      invocationCode: '',
    };
  },
  async mounted() {
    console.log('invocationCode::', this.invocationCode);
    console.log('height::', this.height);
    // Wait for the DOM content to load

    this.$nextTick(() => {
      // Render the ad after the DOM content has loaded
      window.adsbygoogle.push({});
    });

    // Get the zone details here
    const adZone = await this.$apollo.queries.adZone.refetch();
    console.log('adZone', adZone);
    // The below script works for the user whose browser accepts javascript
    // for the users with no js i had hardcoded in template
    // the main goal of the below script is to append some js where we want to show post
    const m3_u =
      location.protocol === 'https:'
        ? 'https://ads.clouthub.com/www/delivery/ajs.php'
        : 'http://ads.clouthub.com/www/delivery/ajs.php';
    const m3_r = Math.floor(Math.random() * 99999999999);
    if (!document.MAX_used) document.MAX_used = ',';
    const adScript = document.createElement('script');
    adScript.type = 'text/javascript';
    adScript.src = `${m3_u}?zoneid=1&cb=${m3_r}${
      document.MAX_used !== ',' ? '&exclude=' + document.MAX_used : ''
    }${
      document.charset
        ? '&charset=' + document.charset
        : document.characterSet
        ? '&charset=' + document.characterSet
        : ''
    }&loc=${encodeURIComponent(window.location)}${
      document.referrer
        ? '&referer=' + encodeURIComponent(document.referrer)
        : ''
    }${
      document.context ? '&context=' + encodeURIComponent(document.context) : ''
    }`;
    if (this.$refs.adContainer) {
      this.$refs.adContainer.appendChild(adScript);
    }
    console.log('adScript', adScript);
  },
};
</script>

<style scoped>
.ad-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 10px;
  /*  border: 2px solid red; */
}
.ad-slot {
  /* border: solid 1px #ccc; */
}
</style>
<style>
.adswrapper {
  width: 125px !important;
  height: 125px !important;
}
.ch-ads {
  width: 125px !important;
  height: 125px !important;
}
</style>
