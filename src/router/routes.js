const routes = [
  // Public Pre-Application
  {
    path: '/preapply',
    component: () => import('layouts/PublicLayout.vue'),
    children: [
      { path: '', component: () => import('pages//Public/PreApplyPage.vue') }
    ]
  },

  // Unified Login Page
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue')
  },

  // USER Section (Students)
  {
    path: '/student',
    component: () => import('layouts/StudentLayout.vue'),
    meta: { requiresAuth: true, role: 'USER' },
    children: [
      { path: '', component: () => import('pages/student/StudentHome.vue') },
      { path: 'tickets', component: () => import('pages/student/StudentTickets.vue') },
      { path: 'checkout', component: () => import('pages/student/StudentCheckout.vue') },
      { path: 'messages', component: () => import('pages/student/StudentMessages.vue') }
    ]
  },

  // ADMIN Section
  {
    path: '/admin',
    component: () => import('layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, role: 'ADMIN' },
    children: [
      { path: '', component: () => import('pages/admin/AdminDashboard.vue') },
      { path: 'students', component: () => import('pages/admin/StudentManagement.vue') },
      { path: 'rooms', component: () => import('pages/admin/RoomManagement.vue') },
      { path: 'tickets', component: () => import('pages/admin/AdminTickets.vue') },
      { path: 'contracts', component: () => import('pages/admin/ContractManagement.vue') },
      { path: 'applications', component: () => import('pages/admin/ApplicationReview.vue') },
      { path: 'messages', component: () => import('pages/admin/AdminMessages.vue') },
      { path: 'checkout', component: () => import('pages/admin/AdminCheckout.vue') }
    ]
  },

  // Root Redirect
  {
    path: '/',
    redirect: '/preapply'
  },

  // Catch-All
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes