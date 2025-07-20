<template>
  <q-page class="q-pa-md">
    <q-card flat class="q-pa-md">

      <!-- Gender Pie Chart -->
      <q-card-section class="flex flex-center">
        <div style="max-width: 250px; width: 100%;">
          <PieChart :data="genderChartData" />
        </div>
      </q-card-section>

      <!-- Action Buttons -->
      <q-card-section class="row q-gutter-sm">
        <q-btn
          :label="showTable ? 'Hide Students' : 'View All Students'"
          color="primary"
          @click="showTable = !showTable"
        />
      </q-card-section>

      <!-- Toggle Show Left -->
      <q-card-section class="row items-center q-gutter-sm">
        <q-toggle v-model="showLeftStudents" label="Show students who left" />
      </q-card-section>

      <!-- Grouped Student Table -->
      <q-card-section v-if="showTable">
        <div v-for="(group, status) in groupedStudents" :key="status" class="q-mb-md">
          <div class="text-subtitle1 text-weight-bold q-mb-sm">
            {{ capitalize(status) }}
          </div>
          <q-markup-table flat bordered class="q-table__card">
            <thead>
              <tr>
                <th>Name</th>
                <th>Gender</th>
                <th>Room</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in group" :key="student.id">
                <td>{{ student.name }}</td>
                <td>{{ student.gender }}</td>
                <td>{{ student.roomNumber }}</td>
                <td>
                  <q-btn
                    label="More Info"
                    size="sm"
                    color="secondary"
                    @click="selectStudent(student)"
                  />
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </div>
      </q-card-section>

    </q-card>

    <!-- Student Info Dialog -->
    <q-dialog v-model="showInfoDialog" persistent>
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

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="closeDialog" />

          <q-btn
            v-if="selectedStudent.status?.toLowerCase() === 'accepted'"
            color="primary"
            label="Check-In"
            @click="updateStudentStatus('active')"
          />

          <q-btn
            v-if="selectedStudent.status?.toLowerCase() === 'checkout_approved'"
            color="negative"
            label="Checkout"
            @click="updateStudentStatus('left')"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from 'boot/axios'
import PieChart from 'pages/PieChart.vue'

const students = ref([])
const selectedStudent = ref({})
const showInfoDialog = ref(false)
const showTable = ref(false)
const showLeftStudents = ref(false)

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1)

const selectStudent = (student) => {
  selectedStudent.value = { ...student }
  showInfoDialog.value = true
}

const closeDialog = () => {
  showInfoDialog.value = false
  selectedStudent.value = {}
}

const updateStudentStatus = async (newStatus) => {
  try {
    await api.put(`/api/students/${selectedStudent.value.id}/status`, null, {
      params: { status: newStatus }
   })
    selectedStudent.value.status = newStatus
    const index = students.value.findIndex(s => s.id === selectedStudent.value.id)
    if (index !== -1) students.value[index].status = newStatus
    closeDialog()
  } catch (err) {
    console.error('Failed to update student status', err)
  }
}

const groupedStudents = computed(() => {
  const result = {}
  const visible = showLeftStudents.value
    ? students.value
    : students.value.filter(s => s.status !== 'left')

  for (const student of visible) {
    const key = student.status.toLowerCase()
    if (!result[key]) result[key] = []
    result[key].push(student)
  }

  return result
})

const genderChartData = computed(() => {
  const male = students.value.filter(s => s.gender === 'Male').length
  const female = students.value.filter(s => s.gender === 'Female').length
  return {
    labels: ['Male', 'Female'],
    datasets: [
      {
        data: [male, female],
        backgroundColor: ['#2196f3', '#e91e63']
      }
    ]
  }
})

onMounted(async () => {
  const res = await api.get('/api/students',{ withCredentials: true })
  students.value = res.data
})
</script>