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
    { path: '/painel', component: () => import('./views/Painel.vue'), meta: { title: 'Painel gerencial', mes: true } },
    { path: '/situacao', component: () => import('./views/Situacao.vue'), meta: { title: 'Carteira de contratos', mes: true } },
    { path: '/espacos', component: () => import('./views/Espacos.vue'), meta: { title: 'Centros de custo' } },
    { path: '/espacos/novo', component: () => import('./views/EspacoForm.vue'), meta: { title: 'Novo centro de custo', secao: '/espacos' } },
    { path: '/espacos/:id', component: () => import('./views/EspacoDetalhe.vue'), meta: { title: 'Espaço', mes: true, dinamico: true, secao: '/espacos' } },
    { path: '/espacos/:id/editar', component: () => import('./views/EspacoForm.vue'), meta: { title: 'Editar espaço', secao: '/espacos' } },
    { path: '/profissionais', component: () => import('./views/Profissionais.vue'), meta: { title: 'Locatários', mes: true } },
    { path: '/estatisticas', component: () => import('./views/Estatisticas.vue'), meta: { title: 'Projeções e cenários', mes: true } },
    { path: '/marketing', component: () => import('./views/Marketing.vue'), meta: { title: 'Comercial', mes: true } },
    { path: '/marketing/social', component: () => import('./views/Social.vue'), meta: { title: 'Monitor social', secao: '/marketing' } },
    { path: '/marketing/estrategia', component: () => import('./views/Estrategia.vue'), meta: { title: 'Estratégia: recém-formados', secao: '/marketing' } },
    { path: '/concorrentes', component: () => import('./views/Concorrentes.vue'), meta: { title: 'Análise de mercado' } },
    { path: '/financeiro', component: () => import('./views/Financeiro.vue'), meta: { title: 'Custos e ponto de equilíbrio', mes: true } },
    { path: '/dados', component: () => import('./views/Dados.vue'), meta: { title: 'Base de dados' } },
    { path: '/dados/diagrama', component: () => import('./views/Diagrama.vue'), meta: { title: 'Diagrama do banco' } },
    { path: '/dados/consultas', component: () => import('./views/Consultas.vue'), meta: { title: 'Tabelas e consultas' } },
    { path: '/documentacao-api', component: () => import('./views/ApiDocs.vue'), meta: { title: 'Documentação da API' } },
    { path: '/reservas', redirect: '/situacao' },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  document.title = to.meta.home ? 'Santé Admin' : `${to.meta.title} · Santé Admin`
})

createApp(App).use(router).mount('#app')
