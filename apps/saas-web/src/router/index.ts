import { createRouter, createWebHistory } from 'vue-router';
import Layout from '../layouts/Layout.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('../views/Login.vue'),
    },
    {
      path: '/',
      component: Layout,
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/orders' },
        { path: 'orders', component: () => import('../views/Orders.vue') },
        { path: 'riders', component: () => import('../views/Riders.vue') },
        { path: 'communities', component: () => import('../views/Communities.vue') },
      ],
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token');
  if (to.path === '/') {
    next(token ? '/orders' : '/login');
    return;
  }
  if (to.meta.requiresAuth && !token) next('/login');
  else next();
});

export default router;
