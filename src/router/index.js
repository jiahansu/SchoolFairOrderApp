import { createRouter, createWebHistory } from '@ionic/vue-router';
import HomePage from '../views/HomePage.vue';

const routes = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
    meta: { title: '園遊會點餐系統' },
  },
  {
    path: '/menu',
    name: 'MenuManagement',
    component: () => import('../views/MenuManagementPage.vue'),
    meta: { title: '商品管理' },
  },
  {
    path: '/orders',
    name: 'OrderManagement',
    component: () => import('../views/OrderManagementPage.vue'),
    meta: { title: '訂單管理' },
  },
  {
    path: '/board',
    name: 'OrderStatusBoard',
    component: () => import('../views/OrderStatusBoardPage.vue'),
    meta: { title: '取餐公告欄' },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
