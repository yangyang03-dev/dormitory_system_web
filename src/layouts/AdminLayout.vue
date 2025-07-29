<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-deep-orange-8 text-white">
      <q-toolbar>
        <q-btn 
          flat 
          dense 
          round 
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
          class="q-mr-sm"
        />
        <q-toolbar-title>Admin Panel</q-toolbar-title>
        <q-btn flat icon="logout" label="Logout" @click="logout" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen"
      show-if-above
      class="bg-blue-1"
      :width="200"
      bordered
    >
       <div class="column justify-center full-height">
        <q-btn
          v-for="link in links"
          :key="link.text"
          :label="link.text"
          :icon="link.icon"
          flat
          class="q-py-md q-px-lg full-width"
          align="left"
          :to="link.to"
        />
       </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'
import { useAuthStore } from 'stores/auth'
const links = [
  { icon: 'home', text: 'Home',to: '/admin' },
  { icon: 'build', text: 'Tickets',to:'/admin/tickets' },
  { icon: 'people', text: 'Residents' ,to:'/admin/students'},
  {icon:'hotel', text: 'Rooms', to: '/admin/rooms'},
  {icon:'description', text: 'Contract', to: '/admin/contracts'},
  {icon:'approval', text: 'Applications', to: '/admin/applications'},
  {icon:'message', text: 'Messages', to: '/admin/messages'},
  {icon:'tour', text: 'Checkout', to: '/admin/checkout'}
] 
const router = useRouter()
const leftDrawerOpen = ref(true)
const authStore = useAuthStore()
const logout = () => {
  authStore.clearAuth()
  localStorage.removeItem('admin_token')
  delete api.defaults.headers.common.Authorization
  router.push('/login')
}
</script>