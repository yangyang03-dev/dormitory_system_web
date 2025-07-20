<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>

        <q-toolbar-title>
          Dormitory Management System
        </q-toolbar-title>

        <q-btn flat label="Pre-Apply" to="/api/preapply" class="q-mx-sm" />
        <q-btn flat label="Rooms" to="/api/rooms" class="q-mx-sm" />
        <q-btn flat label="Tickets" to="/api/tickets" class="q-mx-sm" />
        <q-btn flat label="Admin" to="/api/admin" class="q-mx-sm" />
        <q-btn v-if="isLoggedIn" 
               flat
               label="Logout "
               icon="logout" 
               @click="logout"
         />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'
const router = useRouter()
const isLoggedIn = ref(!!localStorage.getItem('admin_token'))

const logout = () => {
  localStorage.removeItem('admin_token')
  delete api.defaults.headers.common.Authorization
  router.push('/login')
}
</script>