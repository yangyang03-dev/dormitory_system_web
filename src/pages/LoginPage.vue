<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="q-pa-md flex flex-center">
        <q-card class="q-pa-lg" style="width: 400px; max-width: 90vw">
          <q-card-section class="text-h6">Login</q-card-section>
          <q-form @submit.prevent="login" class="q-gutter-md">
            <q-input v-model="username" label="Username" filled required />
            <q-input v-model="password" label="Password" type="password" filled required />
            <q-btn type="submit" label="Login" color="primary" :loading="loading" />
          </q-form>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'
import { Notify } from 'quasar'
//import { jwtDecode } from 'jwt-decode'
import { useAuthStore } from 'stores/auth'
const authStore = useAuthStore()
const username = ref('')
const password = ref('')
const loading = ref(false)
const router = useRouter()

const login = async () => {
  try {
    authStore.loading = true
    const res = await api.post('/api/auth/login', {
      username: username.value,
      password: password.value
    })

    const token = res.data.token
    localStorage.setItem('admin_token', token)
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    if (authStore.setAuthFromToken(token)) {
      Notify.create({
        type: 'positive',
        message: 'Login successful',
        position: 'top'
      })
      
      if (authStore.role === "ADMIN") {
        router.push('/admin')
      } else if (authStore.role === "USER") {
        router.push('/student')
      } else {
        Notify.create({ type: 'negative', message: 'Unknown role' })
      }
    }
    // const decoded = jwtDecode(token)
    // const roles = decoded.roles || []
    // const role = roles.includes('ROLE_ADMIN') ? 'ADMIN' :
    //          roles.includes('ROLE_USER') ? 'USER' : 'UNKNOWN'
    // Notify.create({
    //   type: 'positive',
    //   message: 'Login successful',
    //   position: 'top'
    // })

    // if (role === "ADMIN") {
    //   router.push('/admin')
    // } else if (role === "USER") {
    //   router.push('/student')
    // } else {
    //   Notify.create({ type: 'negative', message: 'Unknown role' })
    // }
  } catch (err) {
    Notify.create({
      type: 'negative',
      message: err.response?.data?.message || 'Login failed',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.q-page {
  min-height: 100vh;
}
</style>