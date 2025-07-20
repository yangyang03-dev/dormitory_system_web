<template>
    <div class="row q-col-gutter-md q-mt-md">

      <!-- Card 1: Room Number -->
      <div class="col-12 col-sm-6 col-md-4">
      <q-card class="bg-orange-5 text-white fit">
        <q-card-section>
          <div class="text-h6">My Room</div>
          <div class="text-subtitle1 q-mt-sm">{{ roomNumber || 'Unassigned' }}</div>
        </q-card-section>
      </q-card>
      </div>

      <!-- Card 2: Unread Messages -->
       <div class="col-12 col-sm-6 col-md-4">
      <q-card class="bg-primary text-white fit" @click="goToMessages">
        <q-card-section>
          <div class="text-h6">Unread Messages</div>
          <div class="text-subtitle1 q-mt-sm">{{ unreadMessages }}</div>
        </q-card-section>
      </q-card>
      </div>
      <!-- Card 3: Unsolved Tickets -->
      <div class="col-12 col-sm-6 col-md-4">
      <q-card class="bg-red-5 text-white fit">
        <q-card-section>
          <div class="text-h6">Unsolved Tickets</div>
          <div class="text-subtitle1 q-mt-sm">{{unsolvedTickets}}</div>
        </q-card-section>
      </q-card>
      </div>  
    </div>
    <q-card class="q-mt-md">
  <q-card-section>
    <div class="text-h6">Recent Messages</div>
  </q-card-section>

  <q-table
    :rows="messages"
    :columns="messageColumns"
    row-key="id"
    flat
    bordered
    dense
    :rows-per-page-options="[5]"
    hide-pagination
  >
    <template v-slot:body-cell-content="props">
      <q-td>
        <q-btn flat dense color="primary" @click="markAsRead(props.row.id)">
          {{ props.row.content.slice(0, 30) }}...
        </q-btn>
      </q-td>
    </template>
  </q-table>
</q-card>
<q-card class="q-mt-md full-width">
  <WeatherCard />
</q-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'
import WeatherCard from 'components/WeatherCard.vue'
const router = useRouter()

const roomNumber = ref('')
const unreadMessages = ref(0)
const unsolvedTickets = ref(0)

const goToMessages = () => {
  router.push('/student/messages')
}


onMounted(async () => {
  try {
    const studentRes = await api.get('/api/students/me')
    roomNumber.value = studentRes.data.roomNumber || ''

    // Fetch messages
    const messagesRes = await api.get('/api/messages/student')

    unreadMessages.value = messagesRes.data.filter(msg => !msg.readByMe).length
    messages.value = messagesRes.data

    // Fetch tickets
    const ticketsRes = await api.get('/api/tickets/me')
    unsolvedTickets.value = ticketsRes.data.filter(
      t => t.status !== 'solved'
    ).length
  } catch (err) {
    console.error('Failed to load student home data', err)
  }
})
const messages = ref([])

const messageColumns = [
  { name: 'title', label: 'Title', field: 'title', align: 'left' },
  { name: 'content', label: 'Content', field: 'content', align: 'left' },
  { name: 'createdAt', label: 'Published Time', field: row => new Date(row.createdAt).toLocaleString(), align: 'left' }
]
</script>