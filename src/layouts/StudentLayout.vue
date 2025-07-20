<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-blue-8 text-white">
      <q-toolbar>
        <q-toolbar-title>Student Portal</q-toolbar-title>
        <q-btn flat icon="logout" label="Logout" @click="logout" />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
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
        <div class="q-my-md"></div> 
        <q-btn
         v-for="log in log_out"
          :key="log.text"
          :label="log.text"
          :icon="log.icon"
          flat
          class="q-py-md q-px-lg full-width"
          align="left"
          :to="log.to"
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
const links = [
  { icon: 'home', text: 'Home',to: '/student/' },
  { icon: 'build', text: 'My Tickets',to:'/student/tickets' },
  { icon: 'email', text: 'Messages' ,to:'/student/messages'},
]
const log_out=[
  { icon: 'logout', text: 'Checkout', to: '/student/checkout' }
]
const router = useRouter()
const leftDrawerOpen = ref(true)

const logout = () => {
  localStorage.removeItem('admin_token')
  delete api.defaults.headers.common.Authorization
  router.push('/login')
}
</script>