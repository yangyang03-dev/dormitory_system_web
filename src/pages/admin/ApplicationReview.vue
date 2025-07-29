<template>
  <q-page class="q-pa-md">
    <q-card flat class="q-pa-md">

      <!-- Header -->
      <q-card-section>
        <div class="text-h6">Application Review</div>
      </q-card-section>

      <q-separator />

      <!-- Application Tables by Status -->
      <!-- Application Tables by Status -->
<q-card-section
  v-for="status in ['pending', 'accepted', 'rejected']"
  :key="status"
>
  <div class="text-subtitle1 text-bold q-mb-sm">
    {{ capitalize(status) }} Applications
  </div>

  <q-table
    :rows="applicationsByStatus[status]"
    :columns="columns"
    row-key="id"
    flat
    bordered
    class="q-mb-lg"
  >
    <!-- applicant column: clickable name -->
    <template #body-cell-applicant="props">
      <q-td>
        <q-btn
          flat dense color="primary"
          :label="props.row.name"
          @click="selectApplication(props.row)"
        />
      </q-td>
    </template>

    <!-- submittedAt column: nice date formatting -->
    <template #body-cell-submittedAt="props">
      <q-td>{{ formatDate(props.row.submittedAt) }}</q-td>
    </template>

    <!-- status column: coloured badge -->
    <template #body-cell-status="props">
      <q-td>
        <q-badge
          :color="props.row.status === 'rejected' ? 'negative' : 'primary'"
        >
          {{ props.row.status }}
        </q-badge>
      </q-td>
    </template>

    <!-- actions column: reject / approve buttons -->
    <template #body-cell-actions="props">
      <q-td>
        <div class="q-gutter-sm">
          <q-btn
            v-if="props.row.status === 'pending'"
            color="negative"
            size="sm"
            label="Reject"
            @click="rejectApplication(props.row.id)"
          />
          <q-btn
            v-if="props.row.status === 'pending'"
            color="positive"
            size="sm"
            label="Select Room and Approve"
            @click="openRoomDialog(props.row)"
          />
        </div>
      </q-td>
    </template>
  </q-table>
</q-card-section>
    </q-card>

    <!-- Application Info Dialog -->
    <q-dialog v-model="showAppDialog" persistent>
      <q-card style="min-width: 400px; max-width: 90vw;">
        <q-card-section>
          <div class="text-h6">Application Info</div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <q-input v-model="selectedApp.name" label="Name" readonly />
          <q-input v-model="selectedApp.email" label="Email" readonly />
          <q-input v-model="selectedApp.gender" label="Gender" readonly />
          <q-input v-model="selectedApp.nationality" label="Nationality" readonly />
          <q-input v-model="selectedApp.major" label="Major" readonly />
          <q-input v-model="selectedApp.emergencyContact" label="Emergency Contact" readonly />
          <q-input v-model="selectedApp.preferredRoomType" label="Preferred Room Type" readonly />
          <q-input v-model="selectedApp.status" label="Status" readonly />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Close" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Room Selection Dialog -->
    <q-dialog v-model="showRoomDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Assign Room Number</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="roomNumber" label="Room Number" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="primary" label="Approve" @click="approveApplication" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from 'boot/axios'
const columns = [
  {
    name: 'applicant',
    label: 'Applicant',
    field: 'name',
    align: 'left',
    headerClasses: 'text-left'
  },
  {
    name: 'gender',
    label: 'Gender',
    field: 'gender',
    align: 'left',
    headerClasses: 'text-left'
  },
  {
    name: 'nationality',
    label: 'Nationality',
    field: 'nationality',
    align: 'left',
    headerClasses: 'text-left'
  },
  {
    name: 'submittedAt',
    label: 'Submitted&nbsp;At',
    field: 'submittedAt',
    align: 'left',
    headerClasses: 'text-left'
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'left',
    headerClasses: 'text-left'
  },
  {
    name: 'actions',
    label: 'Actions',
    align: 'left',
    headerClasses: 'text-left'
  }
]
const applications = ref([])
const selectedApp = ref({})
const showAppDialog = ref(false)
const showRoomDialog = ref(false)
const roomNumber = ref('')
const approvingAppId = ref(null)

const applicationsByStatus = computed(() => {
  const grouped = { pending: [], accepted: [], rejected: [] }
  for (const app of applications.value) {
    grouped[app.status]?.push(app)
  }
  return grouped
})

const formatDate = (timestamp) => {
  return timestamp ? new Date(timestamp).toLocaleString() : ''
}

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)

const selectApplication = (app) => {
  selectedApp.value = { ...app }
  showAppDialog.value = true
}

const openRoomDialog = (app) => {
  approvingAppId.value = app.id
  roomNumber.value = ''
  showRoomDialog.value = true
}

const rejectApplication = async (id) => {
  try {
    await api.put(`/api/applications/${id}/reject`)
    const app = applications.value.find(a => a.id === id)
    if (app) app.status = 'rejected'
  } catch (err) {
    console.error('Failed to reject application', err)
  }
}

const approveApplication = async () => {
  try {
    await api.put(`/api/applications/${approvingAppId.value}/approve`, null, {
      params: { roomNumber: roomNumber.value }
    })
    await api.put(`/api/rooms`, null,{
      params: { roomNumber: roomNumber.value }
    })

    const app = applications.value.find(a => a.id === approvingAppId.value)
    if (app) app.status = 'accepted'

    showRoomDialog.value = false
  } catch (err) {
    console.error('Failed to approve application', err)
  }
}

onMounted(async () => {
  try {
    const res = await api.get('/api/applications')
    applications.value = res.data
  } catch (err) {
    console.error('Failed to load applications', err)
  }
})
</script>