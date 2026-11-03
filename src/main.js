import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import Painel from './views/Painel.vue'
import './style.css'

// Hash history: o GitHub Pages não tem rewrite de rotas, então /#/reservas evita 404.
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: Painel, meta: { title: 'Painel de ocupação', mes: true } },
    { path: '/espacos', component: () => import('./views/Espacos.vue'), meta: { title: 'Espaços e capacidade' } },
    { path: '/reservas', component: () => import('./views/Reservas.vue'), meta: { title: 'Reservas e contratos', mes: true } },
    { path: '/financeiro', component: () => import('./views/Financeiro.vue'), meta: { title: 'Custos e ponto de equilíbrio', mes: true } },
    { path: '/marketing', component: () => import('./views/Marketing.vue'), meta: { title: 'Estratégia de marketing', mes: true } },
    { path: '/dados', component: () => import('./views/Dados.vue'), meta: { title: 'Dados e publicação' } },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

createApp(App).use(router).mount('#app')
