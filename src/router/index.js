import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/detalle/:id',
      name: 'detalle',
      // Lazy loading: solo se carga cuando el usuario entra al detalle
      component: () => import('../views/DetailView.vue'),
    },
  ],
})

export default router
