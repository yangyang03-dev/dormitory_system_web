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
      console.log('Initializing auth store')
      const token = localStorage.getItem('admin_token')
      console.log('Token found:', !!token)
      if (token) {
        const decoded = jwtDecode(token)
        console.log('Decoded token:', decoded)
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
        console.error('Invalid token:', error)
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