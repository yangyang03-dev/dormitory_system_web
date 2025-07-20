<template>
  <q-page class="q-pa-md">
    <q-card flat class="q-pa-md">

      <q-card-section>
        <div class="text-h6">Contract List</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-table
          :rows="contracts"
          :columns="columns"
          row-key="id"
          flat
          bordered
          :pagination="{ rowsPerPage: 10 }"
        >
          <!-- Signed At -->
          <template v-slot:body-cell-signedAt="props">
            <q-td>{{ formatDate(props.row.signedAt) }}</q-td>
          </template>

          <!-- Resident (student name) -->
          <template v-slot:body-cell-resident="props">
            <q-td>
              <q-btn
                flat
                dense
                color="primary"
                :label="getStudentName(props.row.studentId)"
                @click="showStudent(props.row.studentId)"
              />
            </q-td>
          </template>

          <!-- Actions -->
          <template v-slot:body-cell-actions="props">
            <q-td>
              <q-btn
                label="View"
                color="primary"
                size="sm"
                @click="viewContract(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
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
        </q-card-section>

        <q-separator />

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

const contracts = ref([])
const students = ref([])
const studentMap = ref({})

const showStudentDialog = ref(false)
const selectedStudent = ref({})

const columns = [
  { name: 'roomNumber', label: 'Room Number', field: 'roomNumber', align: 'left' },
  { name: 'resident', label: 'Resident', field: 'resident', align: 'left' },
  { name: 'signedAt', label: 'Signed At', field: 'signedAt', align: 'left' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'right' }
]

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleString()
}

const getStudentName = (studentId) => {
  const student = studentMap.value[studentId]
  return student ? student.name : 'Unknown'
}

const showStudent = (studentId) => {
  const student = studentMap.value[studentId]
  if (student) {
    selectedStudent.value = { ...student }
    showStudentDialog.value = true
  }
}

const viewContract = (contract) => {
  // TODO: Future implementation to open PDF or document
  console.log('View contract:', contract)
}

onMounted(async () => {
  try {
    const [contractRes, studentRes] = await Promise.all([
      api.get('/api/contracts'),
      api.get('/api/students')
    ])
    contracts.value = contractRes.data
    students.value = studentRes.data

    // build a map for quick access
    studentMap.value = Object.fromEntries(
      students.value.map(s => [s.id, s])
    )
  } catch (err) {
    console.error('Failed to load contracts or students', err)
  }
})
</script>