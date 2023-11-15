// TODO: Date and time doesn't work as expected
<template>
  <app-modal :show="show" title="Ticket Sales" @close="close()" class="meeting-tickets-modal">
    <div class="metric">
      <div class="metric-value">{{freeTicketCount}}</div>
      <div class="metric-name">Free Tickets</div>
    </div>
    <div class="metric">
      <div class="metric-value">{{paidTicketCount}}</div>
      <div class="metric-name">Paid Tickets</div>
    </div>
    <div class="metric">
      <div class="metric-value">{{earnings}}</div>
      <div class="metric-name">Earnings</div>
    </div>
    <hr />
    <table v-if="members" class="member-table">
      <thead>
        <th>User</th>
        <th>Status</th>
        <th>Price</th>
        <th>Referral Code</th>
      </thead>
      <tr v-for="member in members">
        <td>{{ member.user.username }}</td>
        <td>{{ member.ticketStatus || 'FREE' }}</td>
        <td>{{ member.ticketPricePaid || '—' }}</td>
        <td>{{ member.referralCode || '—' }}</td>
      </tr>
    </table>
  </app-modal>
</template>
<script>
import AppModal from '@/components/general/Modal.vue';
import ListMeetingMembers from '@/gql/meetings/ListMeetingMembers.gql';

export default {
  components: {
    AppModal,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    meeting: {
      type: Object,
      required: true,
    },
  },
  computed: {
    totalTicketCount() {
      return (this.members && this.members.length) || 0;
    },
    freeTicketCount() {
      return this.totalTicketCount - this.paidTicketCount;
    },
    paidTicketCount() {
      return (
        (this.members &&
          this.members.filter((m) => m.ticketStatus === 'PURCHASED').length) ||
        0
      );
    },
    earnings() {
      let total = 0;
      if (this.members) {
        this.members.forEach(m => {
          if (m.ticketPricePaid) {
            total += m.ticketPricePaid;
          }
        });
      }

      return Number(total).toFixed(2);
    },
  },
  methods: {
    close() {
      this.$emit('close');
    },
  },
  apollo: {
    members: {
      query: ListMeetingMembers,
      variables() {
        return {
          meetingId: this.meeting.id,
        };
      },
    },
  },
};
</script>
<style scoped>
th,
td {
  padding-right: 20px;
}

.metric {
  display: inline-block;
  margin-right: 10px;
  text-align: center;
}
.metric-value {
  font-size: 30px;
  font-weight: bold;
}
.meeting-tickets-modal
{
  text-align: center;
}
table {
  margin-left: auto;
  margin-right: auto;
}
</style>
