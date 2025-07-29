import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'
import { api } from 'boot/axios'
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    role: null,
    loading: false
  }),
  actions: {
    initialize() {
      const token = localStorage.getItem('admin_token')
      if (token) {
        this.setAuthFromToken(token)
        return true
      }
      return false
    },
    
    setAuthFromToken(token) {
      try {
        const decoded = jwtDecode(token)
        this.user = decoded.sub // 根据你的JWT结构调整
        this.role = decoded.roles?.includes('ROLE_ADMIN') 
          ? 'ADMIN' 
          : decoded.roles?.includes('ROLE_USER') 
            ? 'USER' 
            : null
        return true
      } catch (error) {
        this.clearAuth()
        return false
      }
    },
    
    clearAuth() {
      this.user = null
      this.role = null
      localStorage.removeItem('admin_token')
      delete api.defaults.headers.common.Authorization
    }
  }
})