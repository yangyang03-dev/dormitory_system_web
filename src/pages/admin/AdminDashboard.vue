<template>
  <div class="row q-col-gutter-md q-mt-md">
  <!-- Total Students -->
  <div class="col-12 col-sm-6 col-md-3">
    <q-card class="bg-primary text-white fit">
      <q-card-section>
        <div class="text-subtitle1">Total Students</div>
        <div class="text-h5 q-mt-sm">{{ totalStudents }}</div>
      </q-card-section>
    </q-card>
  </div>

  <!-- Pending Applications -->
  <div class="col-12 col-sm-6 col-md-3">
    <q-card class="bg-orange-5 text-white fit">
      <q-card-section>
        <div class="text-subtitle1">Pending Applications</div>
        <div class="text-h5 q-mt-sm">{{ pendingApplications }}</div>
      </q-card-section>
    </q-card>
  </div>

  <!-- Pending Checkouts -->
  <div class="col-12 col-sm-6 col-md-3">
    <q-card class="bg-teal-5 text-white fit">
      <q-card-section>
        <div class="text-subtitle1">Pending Checkouts</div>
        <div class="text-h5 q-mt-sm">{{ pendingCheckouts }}</div>
      </q-card-section>
    </q-card>
  </div>

  <!-- Pending Tickets -->
  <div class="col-12 col-sm-6 col-md-3">
    <q-card class="bg-red-5 text-white fit">
      <q-card-section>
        <div class="text-subtitle1">Pending Tickets</div>
        <div class="text-h5 q-mt-sm">{{ pendingTickets }}</div>
      </q-card-section>
    </q-card>
  </div>
</div>
<div class="row q-col-gutter-lg q-mt-xl">

    <!-- Gender Distribution Pie Chart -->
    <q-card class="col-12 col-md-4">
      <q-card-section class="flex flex-center">
        <div style="max-width: 250px; width: 100%;">
          <PieChart :data="genderChartData" />
        </div>
      </q-card-section>
    </q-card>

    <!-- Room Occupancy Pie Chart -->
    <q-card class="col-12 col-md-4">
      <q-card-section class="flex flex-center">
        <div style="max-width: 250px; width: 100%;">
          <PieChart :data="roomChartData" />
        </div>
      </q-card-section>
    </q-card>

    <!-- World Map for Nationality Distribution -->
    <q-card class="col-12 col-md-4">
      <q-card-section>
        <WorldMap :data="nationalityData" />
      </q-card-section>
    </q-card>

  </div> 
  <div class="row q-col-gutter-lg q-mt-xl items-stretch" style="width: 100%">
  <!-- Left side: Tickets Table -->
  <div class="col-7">
    <q-card class="full-height">
      <q-card-section>
        <div class="text-h6">Recent Maintenance Tickets</div>
      </q-card-section>

      <q-table 
        :rows="tickets" 
        :columns="columns" 
        row-key="id" 
        dense 
        flat 
        bordered 
        hide-pagination 
        :rows-per-page-options="[5]"
        class="q-pa-sm"
      >
        <!-- Description -->
        <template v-slot:body-cell-description="props">
          <q-td>
            <q-btn flat dense color="grey-8" @click="viewDescription(props.row.description)">
              {{ props.row.description.slice(0, 20) }}...
            </q-btn>
          </q-td>
        </template>

        <!-- Image -->
        <template v-slot:body-cell-image="props">
          <q-td>
            <q-btn flat icon="image" color="primary" @click="openImage(props.row.imageUrl)" />
          </q-td>
        </template>

        <!-- Status -->
        <template v-slot:body-cell-status="props">
          <q-td>
            <q-badge :color="props.row.status === 'solved' ? 'positive' : 'warning'">
              {{ props.row.status }}
            </q-badge>
          </q-td>
        </template>
      </q-table>
    </q-card>
  </div>

  <!-- Right side: Tickets summary + weather -->
  <div class="col-5 column q-gutter-md full-height">
    <div class="col">
      <TicketsTable :tickets="tickets" class="full-height" />
    </div>
    <div class="col">
      <WeatherCard class="full-height" />
    </div>
  </div>
</div>
</template>

<script setup>
import { ref,  onMounted ,computed} from 'vue'
import { api } from 'boot/axios'
import { Notify } from 'quasar'
import PieChart from 'pages/PieChart.vue'
import WorldMap from 'pages/WorldMap.vue' // You will need a wrapper component using e.g., ECharts or Highcharts
import WeatherCard from 'components/WeatherCard.vue'
// const messages = [
//   { id: 1, title: 'Fire Drill Notice', content: 'Be prepared for a fire drill on Friday.', createdAt: '2025-07-15' },
//   { id: 2, title: 'WiFi Maintenance', content: 'WiFi will be down this weekend.', createdAt: '2025-07-13' },
//   { id: 3, title: 'Cafeteria Hours', content: 'The cafeteria will extend dinner hours.', createdAt: '2025-07-10' }
// ]
const totalStudents = ref(0)
const pendingApplications = ref(0)
const pendingCheckouts = ref(0)
const pendingTickets = ref(0)
onMounted(async () => {
  try {
    const [studentsRes, applicationsRes, checkoutsRes, ticketsRes] = await Promise.all([
      api.get('/api/students'),
      api.get('/api/applications'),
      api.get('/api/checkouts'),
      api.get('/api/tickets')
    ])

    totalStudents.value = studentsRes.data.length
    pendingApplications.value = applicationsRes.data.filter(app => app.status === 'pending').length
    pendingCheckouts.value = checkoutsRes.data.filter(checkout => checkout.status === 'pending').length
    pendingTickets.value = ticketsRes.data.filter(ticket => ticket.status === 'pending').length

  } catch (err) {
    Notify.create({ type: 'negative', message: 'Failed to load dashboard data' })
    console.error(err)
  }
})
const students = ref([])
const rooms=ref([])
const nationalityData = ref({})
const countryNameToCode = {
  'China': 'CN',
  'United States': 'US',
  'Japan': 'JP',
  'South Korea': 'KR',
  'Germany': 'DE',
  'France': 'FR',
  'Vietnam': 'VN',
  // ... add others as needed
}
onMounted(async () => {
  const res = await api.get('/api/students')
  students.value = res.data
  const roomRes = await api.get('/api/rooms')
  rooms.value = roomRes.data
  await fetchNationalityData()
  await fetchTicketsData()
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
const roomChartData = computed(() => {
  const occupied = rooms.value.filter(s => !s.available).length
  const available = rooms.value.filter(s => s.available).length
  return {
    labels: ['Occupied','Available'],
    datasets: [
      {
        data: [occupied, available],
        backgroundColor: ['#bdbdbd', '#66bb6a']
      }
    ]
  }
})
const fetchNationalityData = async () => {
  try {
    const res = await api.get('/api/students') // or an endpoint that gives all students
    const counts = {}

    for (const student of res.data) {
      const rawNationality=student.nationality
      if (!rawNationality) continue
      const code = countryNameToCode[rawNationality] || rawNationality
      if (!code) continue
      counts[code] = (counts[code] || 0) + 1
    }

    nationalityData.value = counts
  } catch (err) {
    console.error('Failed to load nationality data', err)
  }
}
const tickets = ref([])
const showDescriptionDialog = ref(false)
const showImageDialog = ref(false)
const currentDescription = ref('')
const imageUrl = ref('')
const columns = [
  { name: 'description', label: 'Description', field: 'description', align: 'left' },
  { name: 'image', label: 'Image', field: 'imageUrl', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
]
const fetchTicketsData = async () => {
  try {
    const [ticketRes] = await Promise.all([
      api.get('/api/tickets'),
    ])
    tickets.value=ticketRes.data
    
    
  } catch (err) {
    console.error('Failed to load tickets', err)
    Notify.create({ type: 'negative', message: 'Failed to load data' })
  }
}
const viewDescription = (desc) => {
  currentDescription.value = desc
  showDescriptionDialog.value = true
}

const openImage = (url) => {
  imageUrl.value = `http://localhost:8080${url}`
  showImageDialog.value = true
}

</script>