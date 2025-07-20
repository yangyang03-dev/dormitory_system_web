<template>
  <q-page class="q-pa-md">
    <h5>Message Center</h5>

    <!-- Create New Message -->
    <q-form @submit="createMessage" class="q-gutter-md q-mb-lg" style="max-width: 600px">
      <q-input v-model="title" label="Title" filled required />
      <q-input v-model="content" label="Content" type="textarea" filled required />
      <q-btn label="Publish" color="primary" type="submit" :loading="loading" />
    </q-form>

    <!-- Messages Table -->
    <q-table :rows="messages" :columns="columns" row-key="id" flat bordered>
      <template v-slot:body-cell-content="props">
        <q-td>
          <div class="ellipsis" style="max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            <q-btn flat dense color="primary" @click="viewContent(props.row.content)">
              View Content
            </q-btn>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-readBy="props">
        <q-td>
          <q-btn flat dense color="secondary" @click="viewReadBy(props.row.id)">
            View Readers
          </q-btn>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td>
          <q-btn flat dense icon="delete" color="negative" @click="deleteMessage(props.row.id)" />
        </q-td>
      </template>
    </q-table>

    <!-- Dialogs -->
    <q-dialog v-model="showContentDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Message Content</div>
          <div>{{ selectedContent }}</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showReadersDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Students Who Read This</div>
          <q-list bordered>
            <q-item v-for="student in readers" :key="student.id">
              <q-item-section>{{ student.name }}</q-item-section>
            </q-item>
          </q-list>
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

const title = ref('')
const content = ref('')
const messages = ref([])
const readers = ref([])

const loading = ref(false)
const showContentDialog = ref(false)
const selectedContent = ref('')
const showReadersDialog = ref(false)

const columns = [
  { name: 'title', label: 'Title', field: 'title', align: 'left' },
  { name: 'content', label: 'Content', field: 'content', align: 'left' },
  { name: 'createdAt', label: 'Published Time', field: row => new Date(row.createdAt).toLocaleString(), align: 'left' },
  { name: 'readBy', label: 'Readers', align: 'left' },
  { name: 'actions', label: 'Actions', align: 'right' }
]

const fetchMessages = async () => {
  try {
    const res = await api.get('/api/messages')
    messages.value = res.data
  } catch {
    Notify.create({ type: 'negative', message: 'Failed to load messages' })
  }
}

const createMessage = async () => {
  try {
    loading.value = true
    await api.post('/api/messages', { title: title.value, content: content.value })
    Notify.create({ type: 'positive', message: 'Message published' })
    title.value = ''
    content.value = ''
    await fetchMessages()
  } catch  {
    Notify.create({ type: 'negative', message: 'Failed to publish message' })
  } finally {
    loading.value = false
  }
}

const deleteMessage = async (id) => {
  try {
    await api.delete(`/api/messages/${id}`)
    Notify.create({ type: 'positive', message: 'Message deleted' })
    await fetchMessages()
  } catch {
    Notify.create({ type: 'negative', message: 'Failed to delete message' })
  }
}

const viewContent = (contentText) => {
  selectedContent.value = contentText
  showContentDialog.value = true
}

const viewReadBy = async (messageId) => {
  try {
    const res = await api.get(`/api/messages/${messageId}/readers`)
    readers.value = res.data
    showReadersDialog.value = true
  } catch {
    Notify.create({ type: 'negative', message: 'Failed to load readers' })
  }
}

onMounted(() => {
  fetchMessages()
})
</script>