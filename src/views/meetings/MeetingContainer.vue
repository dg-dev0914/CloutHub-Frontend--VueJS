<template>
  <div>
    <b-container fluid="xl">
      <b-row>
        <b-col v-if="!detail" md="2">
          <div
            v-router-link="{ name: 'MeetingHome' }"
            class="cs-textstyle-item-heading mb-2 cursor-pointer"
          >
            Meetings
          </div>
          <cs-button class="mb-4" block @click="showCreateModal = true">
            Create Meeting
          </cs-button>
        <app-search-bar />

          <app-page-menu title="Events">
            <app-page-menu-item
              v-for="view in meetingViews"
              :key="view.label"
              :label="view.label"
              :to="{ name: 'MeetingList', params: { view: view.view } }"
            />
          </app-page-menu>
          <app-page-menu title="Categories">
            <app-page-menu-item
              v-for="category in categories"
              :key="category.label"
              :label="category.label"
              :to="{
                name: 'MeetingCategory',
                params: { category: category.value },
              }"
            />
          </app-page-menu>
        </b-col>
        <b-col v-if="detail" md="1"></b-col>
        <b-col md="10">
          <router-view :key="$route.fullPath" />
        </b-col>
        <b-col v-if="detail" md="1"></b-col>
      </b-row>
    </b-container>
    <app-create-meeting-modal
      :show="showCreateModal"
      :has-payment-id="hasPaymentId"
      @close="showCreateModal = false"
    />
  </div>
</template>

<script>
import meetingcategories from '@/assets/config/meetingcategories.json';
import AppPageMenu from '@/components/general/PageMenu.vue';
import AppPageMenuItem from '@/components/general/PageMenuItem.vue';
import AppCreateMeetingModal from '@/components/meetings/CreateMeetingModal.vue';
import $auth from '@/services/auth';
import AppSearchBar from '@/components/general/SearchBar.vue';

export default {
  components: {
    AppPageMenu,
    AppPageMenuItem,
    AppCreateMeetingModal,
    AppSearchBar
  },
  data() {
    return {
      detail: !!this.$route.params.id,
      showCreateModal: false,
      hasPaymentId:false,
      categories: meetingcategories,
      canCreate: false,
      meetingViews: [
        { label: 'All Meetings', view: 'all' },
        { label: 'Live Meetings', view: 'live' },
        { label: 'Upcoming Meetings', view: 'upcoming' },
        { label: 'Attending', view: 'attending' },
        { label: 'Attended', view: 'attended' },
        { label: 'Invited', view: 'invited' },
        { label: 'Completed', view: 'completed' },
      ],
    };
  },
  async mounted() {
    const user = await $auth.getUser();
    if(user.enablePayments) this.hasPaymentId = true
    const whitelist = [
      'be03853c-6190-4c6f-bdf5-912253d9b90d', // @janakan
      '39a4e45f-c0c3-4b82-8c35-acd03a1a7f8b', // @rajivkhatri
    ];
    this.canCreate =
      user.badgeType === 'influencer' ||
      user.badgeType === 'founder' ||
      user.badgeType === 'channel' ||
      whitelist.includes(user.id);
    // this.canCreate = true;
  },
};
</script>

<style scoped></style>
