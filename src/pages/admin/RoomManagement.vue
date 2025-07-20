<template>
  <q-page class="q-pa-md">
    <q-card flat class="q-pa-md">
      <q-card-section>
        <div class="text-h6">Rooms Management</div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <q-btn-toggle
          v-model="filter"
          spread
          toggle-color="primary"
          :options="[
            { label: 'All', value: 'all' },
            { label: 'Occupied', value: 'occupied' },
            { label: 'Available', value: 'available' }
          ]"
        />
      </q-card-section>

      <q-separator />

      <q-table :rows="filteredRooms" :columns="columns" row-key="roomNumber">
        <template v-slot:body-cell-resident="props">
          <q-td>
            <q-btn
              v-if="props.row.resident"
              flat dense color="primary"
              :label="props.row.resident.name"
              @click="viewStudentInfo(props.row.resident)"
            />
            <q-badge v-else color="positive">Available</q-badge>
          </q-td>
        </template>
      </q-table>
    </q-card>

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
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from 'boot/axios'
import { Notify } from 'quasar'

const rooms = ref([])
const showStudentDialog = ref(false)
const selectedStudent = ref({})
const filter = ref('all')

const columns = [
  { name: 'roomNumber', label: 'Room Number', field: 'roomNumber', align: 'left' },
  { name: 'capacity', label: 'Capacity', field: 'capacity', align: 'left' },
  { name: 'type', label: 'Type', field: 'type', align: 'left' },
  { name: 'resident', label: 'Resident', field: 'resident', align: 'left' }
]

const filteredRooms = computed(() => {
  if (filter.value === 'occupied') {
    return rooms.value.filter(room => room.resident)
  } else if (filter.value === 'available') {
    return rooms.value.filter(room => !room.resident)
  } else {
    return rooms.value
  }
})

const viewStudentInfo = (student) => {
  selectedStudent.value = { ...student }
  showStudentDialog.value = true
}

onMounted(async () => {
  try {
    const [roomRes, studentRes] = await Promise.all([
      api.get('/api/rooms'),
      api.get('/api/students')
    ])

    const studentMap = {}
    for (const student of studentRes.data) {
      studentMap[student.roomNumber] = student
    }

    rooms.value = roomRes.data.map(room => ({
      ...room,
      resident: studentMap[room.roomNumber] || null
    }))
  } catch (err) {
    console.error('Failed to load rooms or students', err)
    Notify.create({ type: 'negative', message: 'Failed to load room data' })
  }
})
</script>
