<script>
import $auth from '@/services/auth';
import $bus from '@/services/bus';

export default {
  created() {
    window.onUsersnapCXLoad = function (api) {
      api.init();
      api.on('open', async (event) => {
        const me = await $auth.getUser();
        event.api.setValue('visitor', me.email);
        event.api.setValue('custom', { userId: me.id });
      });
      $bus.$on('report_bug', () => {
        api.logEvent('report_bug');
      });
    };
    const script = document.createElement('script');
    script.defer = 1;
    script.src = 'https://widget.usersnap.com/global/load/986c505b-5efa-45f1-bc7b-9ffb337306d1?onload=onUsersnapCXLoad';
    document.getElementsByTagName('head')[0].appendChild(script);
  },
};
</script>
<template>
  <div></div>
</template>
