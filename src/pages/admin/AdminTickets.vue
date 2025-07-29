<template>
  <q-page class="q-pa-md">
    <h5>All Maintenance Tickets</h5>

    <q-table :rows="tickets" :columns="columns" row-key="id" flat bordered>

      <!-- Student Column (clickable name) -->
      <template v-slot:body-cell-student="props">
        <q-td>
          <q-btn flat dense color="primary" :label="props.row.studentName" @click="viewStudentInfo(props.row.studentId)" />
        </q-td>
      </template>

      <!-- Description Column (clickable with dialog) -->
      <template v-slot:body-cell-description="props">
        <q-td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          <q-btn flat dense color="grey-8" @click="viewDescription(props.row.description)">
            {{ props.row.description.slice(0, 20) }}...
          </q-btn>
        </q-td>
      </template>

      <!-- Image URL Viewer -->
      <template v-slot:body-cell-image="props">
        <q-td>
          <q-btn flat icon="image" color="primary" @click="openImage(props.row.imageUrl)" />
        </q-td>
      </template>

      <!-- Actions -->
      <template v-slot:body-cell-actions="props">
        <q-td>
          <q-btn flat round icon="more_vert">
            <q-menu>
              <q-list>
                <q-item v-if="props.row.status === 'submitted'" clickable v-close-popup @click="markSolved(props.row.id)">
                  <q-item-section>Mark as Solved</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="deleteTicket(props.row.id)">
                  <q-item-section>Delete</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-td>
      </template>

    </q-table>

    <!-- Student Info Dialog -->
    <q-dialog v-model="showStudentDialog" persistent>
      <q-card style="min-width: 400px; max-width: 90vw;">
        <q-card-section>
          <div class="text-h6">{{ selectedStudent.name }}'s Info</div>
        </q-card-section>
        <q-separator />
        <q-card-section class="q-gutter-md">
          <q-input v-model="selectedStudent.email" label="Email" readonly />
          <q-input v-model="selectedStudent.gender" label="Gender" readonly />
          <q-input v-model="selectedStudent.roomNumber" label="Room" readonly />
          <q-input v-model="selectedStudent.nationality" label="Nationality" readonly />
          <q-input v-model="selectedStudent.major" label="Major" readonly />
          <q-input v-model="selectedStudent.emergencyContact" label="Emergency Contact" readonly />
          <q-input v-model="selectedStudent.status" label="Status" readonly />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Description Dialog -->
    <q-dialog v-model="showDescriptionDialog">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Ticket Description</div>
        </q-card-section>
        <q-separator />
        <q-card-section>{{ currentDescription }}</q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Image Preview Dialog -->
    <q-dialog v-model="showImageDialog">
  <q-card style="width: 80vw; height: 80vh">
    <q-img
      :src="imageUrl"
      style="
        width: 100%;
        height: 100%;
        min-height: 600px;
        object-fit: contain;
      "
    />
    <q-card-actions align="right">
      <q-btn flat label="Close" v-close-popup />
    </q-card-actions>
  </q-card>
</q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { baseURL } from 'boot/axios'
import { Notify } from 'quasar'

const tickets = ref([])
const students = ref([])
const studentMap = ref({})
const showStudentDialog = ref(false)
const showDescriptionDialog = ref(false)
const showImageDialog = ref(false)
const selectedStudent = ref({})
const currentDescription = ref('')
const imageUrl = ref('')

const columns = [
  { name: 'roomNumber', label: 'Room', field: 'roomNumber', align: 'left' },
  { name: 'student', label: 'Student', field: 'studentName', align: 'left' },
  { name: 'description', label: 'Description', field: 'description', align: 'left' },
  { name: 'image', label: 'Image', field: 'imageUrl', align: 'left' },
  { name: 'createdAt', label: 'Created At', field: row => new Date(row.createdAt).toLocaleString(), align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
  { name: 'actions', label: 'Actions', align: 'left' }
]

const fetchData = async () => {
  try {
    const [ticketRes, studentRes] = await Promise.all([
      api.get('/api/tickets'),
      api.get('/api/students')
    ])

    students.value = studentRes.data
    studentMap.value = Object.fromEntries(
      students.value.map(s => [s.id, s])
    )

    tickets.value = ticketRes.data.map(t => ({
      ...t,
      studentName: studentMap.value[t.studentId]?.name || 'Unknown'
    }))
  } catch (err) {
    console.error('Failed to load tickets', err)
    Notify.create({ type: 'negative', message: 'Failed to load data' })
  }
}

const viewStudentInfo = async (studentId) => {
  try {
    const res = await api.get(`/api/students/${studentId}`)
    selectedStudent.value = res.data
    showStudentDialog.value = true
  } catch {
    Notify.create({ type: 'negative', message: 'Failed to load student info' })
  }
}

const viewDescription = (desc) => {
  currentDescription.value = desc
  showDescriptionDialog.value = true
}

const openImage = (url) => {
  imageUrl.value = baseURL+ url
  showImageDialog.value = true
}

const markSolved = async (id) => {
  try {
    await api.put(`/api/tickets/${id}/solve`)
    const target = tickets.value.find(t => t.id === id)
    if (target) target.status = 'solved'
    Notify.create({ type: 'positive', message: 'Marked as solved' })
  } catch {
    Notify.create({ type: 'negative', message: 'Failed to update status' })
  }
}

const deleteTicket = async (id) => {
  try {
    await api.delete(`/api/tickets/${id}`)
    tickets.value = tickets.value.filter(t => t.id !== id)
    Notify.create({ type: 'positive', message: 'Deleted successfully' })
  } catch {
    Notify.create({ type: 'negative', message: 'Failed to delete ticket' })
  }
}

onMounted(fetchData)
</script>