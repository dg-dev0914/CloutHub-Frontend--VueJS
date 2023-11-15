<template>
  <div class="site-links-card">
    <a v-for="(link,index) in links" :key="index" class="cs-textstyle-paragraph-small site-link"
      :href="link.url" target="_blank">{{link.label}}</a>
  </div>
</template>

<script>
import { policyPagesUrls } from '@/constants';

export default {
  data() {
    return {
      links: [
        {
          url: 'https://www.clouthub.com/about',
          label: 'About Us',
        },
        {
          url: policyPagesUrls.termsOfUseUrl,
          label: 'Terms & Conditions',
        },
        {
          url: policyPagesUrls.privacyPolicyUrl,
          label: 'Privacy Policy',
        },
        {
          url: 'https://www.clouthub.com/verification-policy',
          label: 'Verification Policy',
        },
      ],
    };
  },
};
</script>

<style>
.site-links-card
{
  text-align: center;
}
.site-links-card .site-link{
  padding: 5px 10px;
  display: inline-block;
  font-weight: var(--cs-font-weight-bold);
  line-height: 21px;
}
</style>
