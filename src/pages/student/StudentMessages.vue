<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <q-btn
        flat
        label="All"
        :color="filterMode === 'all' ? 'primary' : 'grey'"
        @click="setFilter('all')"
        class="q-mr-sm"
      />
      <q-btn
        flat
        label="Read"
        :color="filterMode === 'read' ? 'positive' : 'grey'"
        @click="setFilter('read')"
        class="q-mr-sm"
      />
      <q-btn
        flat
        label="Unread"
        :color="filterMode === 'unread' ? 'warning' : 'grey'"
        @click="setFilter('unread')"
      />
    </div>

    <q-table
      :rows="filteredMessages"
      :columns="columns"
      row-key="id"
      flat
      bordered
      :pagination="{ rowsPerPage: 10 }"
    >
      <template v-slot:body-cell-content="props">
        <q-td>
          <q-btn
            flat
            dense
            color="primary"
            label="View"
            @click="openMessageDialog(props.row)"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-read="props">
        <q-td>
          <q-badge
            :color="props.row.readByMe ? 'positive' : 'warning'"
            :label="props.row.readByMe ? 'Read' : 'Unread'"
          />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="showDialog">
      <q-card style="max-width: 600px">
        <q-card-section>
          <div class="text-h6">Message Content</div>
          <div class="q-mt-sm">{{ dialogContent }}</div>
        </q-card-section>
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
import { Notify } from 'quasar'

const messages = ref([])
const filteredMessages = ref([])
const studentId = ref(null)
const showDialog = ref(false)
const dialogContent = ref('')
const selectedMessageId = ref(null)
const filterMode = ref('all') // options: 'all', 'read', 'unread'
const columns= [
  { name: 'title', label: 'Title', field:'title',align: 'left' },
  { name: 'content', label: 'Content', field:'content',align: 'left' },
  {name:'pulishedTime', label: 'Published Time', field:'createdAt',align: 'left'},
  { name: 'status', label: 'OnRead', field: 'readByMe', align: 'center' },
]
const fetchStudentId = async () => {
  try {
    const res = await api.get('/api/students/me')
    studentId.value = res.data.id
  } catch (err) {
    console.error('Failed to fetch student ID', err)
    Notify.create({ type: 'negative', message: 'Cannot load student info' })
  }
}

const fetchMessages = async () => {
  try {
    const res = await api.get('/api/messages/student')
    messages.value = res.data
    applyFilter()
  } catch (err) {
    console.error('Failed to fetch messages', err)
    Notify.create({ type: 'negative', message: 'Cannot load messages' })
  }
}

const applyFilter = () => {
  if (filterMode.value === 'read') {
    filteredMessages.value = messages.value.filter(m => m.readByMe)
  } else if (filterMode.value === 'unread') {
    filteredMessages.value = messages.value.filter(m => !m.readByMe)
  } else {
    filteredMessages.value = [...messages.value]
  }
}

const openMessageDialog = async (message) => {
  dialogContent.value = message.content
  selectedMessageId.value = message.id
  showDialog.value = true

  // Mark as read if not already
  if (!message.readByMe) {
    try {
      await api.post(`/api/messages/${message.id}/read`, null, {
        params: { studentId: studentId.value }
      })
      message.readByMe = true
      applyFilter()
    } catch (err) {
      console.warn('Failed to mark message as read', err)
    }
  }
}

const setFilter = (mode) => {
  filterMode.value = mode
  applyFilter()
}

onMounted(async () => {
  await fetchStudentId()
  await fetchMessages()
})
</script>