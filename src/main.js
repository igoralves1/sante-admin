import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import Inicio from './views/Inicio.vue'
import './style.css'

// Hash history: o GitHub Pages não reescreve rotas, então /#/painel evita 404.
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: Inicio, meta: { title: 'Santé Admin', home: true } },
    { path: '/painel', component: () => import('./views/Painel.vue'), meta: { title: 'Painel de ocupação', mes: true } },
    { path: '/situacao', component: () => import('./views/Situacao.vue'), meta: { title: 'Situação atual', mes: true } },
    { path: '/espacos', component: () => import('./views/Espacos.vue'), meta: { title: 'Espaços' } },
    { path: '/espacos/novo', component: () => import('./views/EspacoForm.vue'), meta: { title: 'Cadastrar novo espaço' } },
    { path: '/espacos/:id', component: () => import('./views/EspacoDetalhe.vue'), meta: { title: 'Espaço', mes: true, dinamico: true, secao: '/espacos' } },
    { path: '/espacos/:id/editar', component: () => import('./views/EspacoForm.vue'), meta: { title: 'Editar espaço', secao: '/espacos' } },
    { path: '/profissionais', component: () => import('./views/Profissionais.vue'), meta: { title: 'Profissionais', mes: true } },
    { path: '/estatisticas', component: () => import('./views/Estatisticas.vue'), meta: { title: 'Estatísticas e estimativas', mes: true } },
    { path: '/marketing', component: () => import('./views/Marketing.vue'), meta: { title: 'Estratégia de marketing', mes: true } },
    { path: '/marketing/estrategia', component: () => import('./views/Estrategia.vue'), meta: { title: 'Estratégia: recém-formados', secao: '/marketing' } },
    { path: '/concorrentes', component: () => import('./views/Concorrentes.vue'), meta: { title: 'Concorrentes' } },
    { path: '/financeiro', component: () => import('./views/Financeiro.vue'), meta: { title: 'Custos e ponto de equilíbrio', mes: true } },
    { path: '/dados', component: () => import('./views/Dados.vue'), meta: { title: 'Dados e publicação' } },
    { path: '/reservas', redirect: '/situacao' },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  document.title = to.meta.home ? 'Santé Admin' : `${to.meta.title} · Santé Admin`
})

createApp(App).use(router).mount('#app')
