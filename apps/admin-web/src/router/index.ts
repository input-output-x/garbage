import { createRouter, createWebHistory } from 'vue-router';
import Layout from '../layouts/Layout.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: () => import('../views/Login.vue') },
    {
      path: '/',
      component: Layout,
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/dashboard' },
        { path: 'dashboard', component: () => import('../views/Dashboard.vue') },
        { path: 'tenants', component: () => import('../views/Tenants.vue') },
      ],
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token');
  if (to.path === '/') {
    next(token ? '/dashboard' : '/login');
    return;
  }
  if (to.meta.requiresAuth && !token) next('/login');
  else next();
});

export default router;
