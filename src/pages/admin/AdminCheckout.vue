<template>
  <q-page class="q-pa-md">
    <h5>Checkout Requests</h5>

    <!-- Pending Table -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Pending Requests</div>
      </q-card-section>
      <q-separator />
      <q-table :rows="pending" :columns="columns" row-key="id">
        <template v-slot:body-cell-student="props">
          <q-td>
            <q-btn
              flat dense color="primary"
              :label="props.row.studentName"
              @click="viewStudentInfo(props.row.studentUUID)"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-reason="props">
          <q-td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            <q-btn flat dense color="grey-8" @click="viewReason(props.row.reason)">
              {{ props.row.reason.slice(0, 20) }}...
            </q-btn>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td>
            <q-btn flat round icon="more_vert">
              <q-menu>
                <q-list>
                  <q-item clickable v-close-popup @click="approve(props.row.id)">
                    <q-item-section>Approve</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="cancel(props.row.id)">
                    <q-item-section>Cancel</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Approved Table -->
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6">Approved Requests</div>
      </q-card-section>
      <q-separator />
      <q-table :rows="approved" :columns="columns" row-key="id">
        <template v-slot:body-cell-student="props">
          <q-td>
            <q-btn
              flat dense color="primary"
              :label="props.row.studentName"
              @click="viewStudentInfo(props.row.studentUUID)"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-reason="props">
          <q-td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            <q-btn flat dense color="grey-8" @click="viewReason(props.row.reason)">
              {{ props.row.reason.slice(0, 20) }}...
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Student Info Dialog -->
    <q-dialog v-model="showStudentDialog" persistent>
      <q-card style="min-width: 400px; max-width: 90vw;">
        <q-card-section>
          <div class="text-h6">{{ student.name }}'s Info</div>
        </q-card-section>
        <q-separator />
        <q-card-section class="q-gutter-md">
          <q-input v-model="student.email" label="Email" readonly />
          <q-input v-model="student.gender" label="Gender" readonly />
          <q-input v-model="student.roomNumber" label="Room" readonly />
          <q-input v-model="student.nationality" label="Nationality" readonly />
          <q-input v-model="student.major" label="Major" readonly />
          <q-input v-model="student.emergencyContact" label="Emergency Contact" readonly />
          <q-input v-model="student.status" label="Status" readonly />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Reason Dialog -->
    <q-dialog v-model="showReasonDialog">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Reason for Checkout</div>
        </q-card-section>
        <q-separator />
        <q-card-section>{{ currentReason }}</q-card-section>
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

const checkouts = ref([])
const students = ref([])
const student = ref({})
const studentMap = ref({})
const showStudentDialog = ref(false)
const showReasonDialog = ref(false)
const currentReason = ref('')

const columns = [
  { name: 'student', label: 'Student', field: 'studentName', align: 'left' },
  { name: 'roomNumber', label: 'Room Number', field: 'roomNumber', align: 'left' },
  { name: 'submittedAt', label: 'Submitted At', field: row => new Date(row.requestedAt).toLocaleString(), align: 'left' },
  { name: 'reason', label: 'Reason', field: 'reason', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
  { name: 'actions', label: 'Actions', align: 'left' }
]

const pending = computed(() => checkouts.value.filter(c => c.status === 'pending'))
const approved = computed(() => checkouts.value.filter(c => c.status === 'accepted'))
const fetchData = async () => {
  try {
    const [checkoutRes, studentRes] = await Promise.all([
      api.get('/api/checkouts'),
      api.get('/api/students')
    ])

    students.value = studentRes.data
    studentMap.value = Object.fromEntries(
      students.value.map(s => [s.id, s])
    )

    checkouts.value = checkoutRes.data.map(c => ({
      ...c,
      studentName: studentMap.value[c.studentUUID]?.name || 'Unknown',
      roomNumber: studentMap.value[c.studentUUID]?.roomNumber || '-'
    }))
  } catch (err) {
    console.error('Failed to load checkout data', err)
    Notify.create({ type: 'negative', message: 'Failed to load data' })
  }
}

onMounted(fetchData)
const approve = async (id) => {
  try {
    await api.put(`/api/checkouts/${id}/status?status=accepted`)
    const target = checkouts.value.find(c => c.id === id)
    if (target) target.status = 'accepted'
    Notify.create({ type: 'positive', message: 'Request approved' })
  } catch  {
    Notify.create({ type: 'negative', message: 'Failed to approve request' })
  }
}

const cancel = async (id) => {
  try {
    await api.delete(`/api/checkouts/${id}`)
    checkouts.value = checkouts.value.filter(c => c.id !== id)
    Notify.create({ type: 'positive', message: 'Request canceled' })
  } catch  {
    Notify.create({ type: 'negative', message: 'Failed to cancel request' })
  }
}

const viewStudentInfo = async (studentUUID) => {
  try {
    const res = await api.get(`/api/students/${studentUUID}`)
    student.value = res.data
    showStudentDialog.value = true
  } catch {
    Notify.create({ type: 'negative', message: 'Failed to load student info' })
  }
}

const viewReason = (reason) => {
  currentReason.value = reason
  showReasonDialog.value = true
}
</script>