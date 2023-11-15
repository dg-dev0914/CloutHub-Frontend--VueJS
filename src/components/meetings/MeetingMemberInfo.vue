<template>
  <div>
    <app-avatar
      :name="user.displayname"
      :picture="user.profilePhotoURL"
      tabindex="-1"
      size="small"
    />
    <div class="cs-textstyle-paragraph-bold">
      {{ user.displayname }}
    </div>
    <div class="cs-textstyle-paragraph-small text-light">
      {{ user.username }}
    </div>
    <div class="cs-textstyle-paragraph-small">{{ user.bio }}</div>
  </div>
</template>

<script>
import AppAvatar from '@/components/general/Avatar.vue';

export default {
  props:{
    user: Object
  },
  components: {
    AppAvatar
  }
}
</script>