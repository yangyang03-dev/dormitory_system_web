<template>
  <router-view />
</template>

<script setup>
import { useAuthStore } from 'stores/auth'

const authStore = useAuthStore()
// 应用启动时初始化认证
authStore.initialize()

import { onMounted } from 'vue'
onMounted(() => {
  console.log('App mounted, token exists:', !!localStorage.getItem('admin_token'))
})
</script>
