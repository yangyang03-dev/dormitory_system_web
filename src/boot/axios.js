import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'
import { useAuthStore } from 'stores/auth'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({
  baseURL: '/'  // replace if needed 
})
export default defineBoot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api
  console.log('Axios boot initialized')
  const token = localStorage.getItem('authToken')
  console.log('Token in boot:', token)

  const authStore = useAuthStore()
  if (token) {
    console.log('Setting Authorization header')
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    authStore.setAuthFromToken(token)
  }
  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
})
export const baseURL = '/' // replace if needed
export { api }
