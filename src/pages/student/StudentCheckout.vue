<template>
  <q-page class="q-pa-md">
    <h5>Room Checkout Request</h5>

    <div v-if="checkoutRequest">
      <q-card flat bordered class="q-pa-md" style="max-width: 500px">
        <q-card-section>
          <div class="text-subtitle1">You have already submitted a checkout request:</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="checkoutRequest.reason" label="Reason" readonly filled />
          <q-input v-model="checkoutRequest.preferredDate" label="Preferred Date" readonly filled />
          <q-input v-model="checkoutRequest.status" label="Status" readonly filled />
        </q-card-section>
      </q-card>
    </div>

    <div v-else>
      <q-form @submit="submitCheckout" class="q-gutter-md" style="max-width: 400px">
        <q-input
          v-model="reason"
          label="Reason for Checkout"
          type="textarea"
          filled
          required
        />
        <q-input
          v-model="preferredDate"
          label="Preferred Checkout Date"
          type="date"
          filled
          required
        />
        <q-btn type="submit" label="Submit Request" color="primary" :loading="loading" />
      </q-form>
    </div>
  </q-page>
</template>

<script setup>
import { Notify } from 'quasar'
import { api } from 'boot/axios'
import { onMounted, ref } from 'vue'

const reason = ref('')
const preferredDate = ref('')
const loading = ref(false)
const currentStudent = ref(null)
const checkoutRequest = ref(null)

const submitCheckout = async () => {
  try {
    loading.value = true
    await api.post('/api/checkouts', {
      studentUUID: currentStudent.value.id,
      reason: reason.value,
      preferredDate: preferredDate.value
    })

    Notify.create({
      type: 'positive',
      message: 'Checkout request submitted successfully',
      position: 'top'
    })

    // Refresh the UI
    fetchCheckout()
  } catch {
    Notify.create({
      type: 'negative',
      message: 'Failed to submit checkout request',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

const fetchCheckout = async () => {
  try {
    const res = await api.get('/api/checkouts/me')
    checkoutRequest.value = res.data
  } catch (err) {
    if (err.response?.status !== 404) {
      console.error('Error loading checkout request', err)
    }
    checkoutRequest.value = null
  }
}

onMounted(async () => {
  try {
    const res = await api.get('/api/students/me')
    currentStudent.value = res.data
    await fetchCheckout()
  } catch (err) {
    console.error('Failed to load student info', err)
  }
})
</script>