import { createRouter, createWebHistory, createMemoryHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { jwtDecode } from 'jwt-decode'

export default function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  Router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('admin_token')
  let role = null
  if (to.meta.requiresAuth) {
    //need login for these pages
    if (token) {
      const decoded = jwtDecode(token)
      const roles = decoded.roles || []
      role = roles.includes('ROLE_ADMIN') ? 'ADMIN' :
      roles.includes('ROLE_USER') ? 'USER' : 'UNKNOWN'
      if (to.path.startsWith('/admin')&&  role === 'USER') {
      next('/student')
      } else if (to.path.startsWith('/student') && role === 'ADMIN') {
        next('/admin')
        console.log('it directs to the student')
      } else {
        next()
      }
      } else {
      next('/login')
    }
  } else {
    // if already logged in and clicked the login page, redirect to appropriate page
    if (to.path === '/login' && token) {
      const decoded = jwtDecode(token)
      const roles = decoded.roles || []
      role = roles.includes('ROLE_ADMIN') ? 'ADMIN' :
      roles.includes('ROLE_USER') ? 'USER' : 'UNKNOWN'
      if (role === 'ADMIN') {
        next('/admin')
      } else if( role === 'USER') {
        next('/student')
      }else {
      next()
    } 
    } else{
      next()
    }
  }
})

  return Router
}