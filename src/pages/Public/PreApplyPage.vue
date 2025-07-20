<template>
  <q-page class="q-pa-md">
    <q-card class="q-pa-lg q-mx-auto" style="max-width: 500px">
      <q-card-section>
        <div class="text-h6">Student Pre-Application</div>
      </q-card-section>

      <q-form @submit="submitForm" class="q-gutter-md">
        <q-select
          filled
          v-model="form.preferredRoomType"
          :options="['SingleA', 'SingleB', 'SingleC']"
          label="Room Type"
          required
        />
        <q-input filled v-model="form.studentNumber" label="StudentNumber" required />
        <q-input filled v-model="form.name" label="Full Name" required />
        <q-input filled v-model="form.email" label="Email" type="email" required />
        <q-select
          filled
          v-model="form.gender"
          :options="['Male', 'Female', 'Other']"
          label="Gender"
          required
        />
        <q-input filled v-model="form.nationality" label="Nationality" required />
        <q-input filled v-model="form.major" label="Major (optional)" />
        <q-input filled v-model="form.emergencyContact" label="Emergency Contact (optional)" />

        <div class="text-center"><q-btn type="submit" label="Submit Application" color="primary" /></div>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { api } from 'boot/axios'
import { Notify } from 'quasar'

const form = ref({
  preferredRoomType: '',
  studentNumber:'',
  name: '',
  email: '',
  gender: '',
  nationality: '',
  major: '',
  emergencyContact: '',
})

const submitForm = async () => {
  try {
    await api.post('/api/applications', form.value)
    Notify.create({ type: 'positive', message: 'Application submitted!' })
    form.value = {} // reset
  } catch (err) {
    Notify.create({ type: 'negative', message: 'Submission failed' })
    console.error(err)
  }
}
</script>