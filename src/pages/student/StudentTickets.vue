<template>
  <q-page class="q-pa-md">
    <h5>My Maintenance Tickets</h5>

    <!-- New Ticket Form -->
    <q-form @submit="submitTicket" class="q-gutter-md q-mb-lg" style="max-width: 500px">
      <q-input v-model="description" label="Issue Description" type="textarea" filled required />
      <q-input v-model="roomNumber" label="Room Number" filled required />
      <q-file v-model="image" label="Optional Image" accept="image/*" filled />
      <q-btn type="submit" label="Submit Ticket" color="primary" :loading="loading" />
    </q-form>

    <!-- Tickets Table -->
    <q-table :rows="tickets" :columns="columns" row-key="id" flat bordered>
      <template v-slot:body-cell-image="props">
        <q-td>
          <q-btn
            flat dense color="primary"
            label="View"
            @click="viewImage(props.row.imageUrl)"
            v-if="props.row.imageUrl"
          />
          <span v-else>-</span>
        </q-td>
      </template>
      <template v-slot:body-cell-status="props">
        <q-td>
          <q-badge :color="props.row.status === 'solved' ? 'positive' : 'primary'">
            {{ props.row.status }}
          </q-badge>
        </q-td>
      </template> 
    </q-table>

    <!-- Image Dialog -->
    <q-dialog v-if="showImageDialog" v-model="showImageDialog" @hide="imageUrl = ''">
  <q-card>
    <q-img
      v-if="imageUrl"
      :src="imageUrl"
      style="max-width: 600px; max-height: 400px"
    />
    <q-card-actions align="right">
      <q-btn flat label="Close" v-close-popup />
    </q-card-actions>
  </q-card>
</q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { api } from 'boot/axios'
import { Notify } from 'quasar'
const description = ref('')
const roomNumber = ref('')
const image = ref(null)
const loading = ref(false)
const student = ref(null)
const tickets = ref([])
const showImageDialog = ref(false)
const imageUrl = ref('')

const columns = [
  { name: 'description', label: 'Description', field: 'description', align: 'left' },
  { name: 'roomNumber', label: 'Room', field: 'roomNumber', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
  { name: 'createdAt', label: 'Created At', field: row => new Date(row.createdAt).toLocaleString(), align: 'left' },
  { name: 'image', label: 'Image', align: 'left' }
]
onBeforeRouteLeave(() => {
  showImageDialog.value = false
  imageUrl.value = ''
})
onUnmounted(() => {
  showImageDialog.value = false
  imageUrl.value = ''
})
onMounted(async () => {
  try {
    const res = await api.get('/api/students/me')
    student.value = res.data
    await fetchTickets()
  } catch (err) {
    console.error('Failed to load student info', err)
    Notify.create({ type: 'negative', message: 'Failed to load student' })
  }
})

const fetchTickets = async () => {
  try{
      const res = await api.get('/api/tickets/me')
      tickets.value = res.data
  }
  catch (err) {
    console.error('Error fetching tickets:', err)
    Notify.create({ type: 'negative', message: 'Failed to load tickets' })
  }

}

const submitTicket = async () => {
  try {
    loading.value = true
    const formData = new FormData()
    formData.append('studentId', student.value.id)
    formData.append('roomNumber', roomNumber.value)
    formData.append('description', description.value)
    if (image.value) {
      formData.append('file', image.value)
    }

    await api.post('/api/tickets/upload', formData)
    Notify.create({ type: 'positive', message: 'Ticket submitted' })
    description.value = ''
    roomNumber.value = ''
    image.value = null
    await fetchTickets()
  } catch {
    Notify.create({ type: 'negative', message: 'Submission failed' })
  } finally {
    loading.value = false
  }
}

const viewImage = (url) => {
  imageUrl.value = `http://localhost:8080${url}`
  showImageDialog.value = true
}
</script>