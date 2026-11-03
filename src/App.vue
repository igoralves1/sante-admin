<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import Icon from './components/Icon.vue'
import { state, carregar, exportarJSON, publicadoMaisNovo, descartarLocal } from './lib/store'
import { addMes, mesLongo } from './lib/format'

const route = useRoute()
onMounted(carregar)

const nav = [
  { to: '/', label: 'Início', icon: 'home' },
  { to: '/painel', label: 'Painel', icon: 'painel' },
  { to: '/situacao', label: 'Situação atual', icon: 'reservas' },
  { to: '/espacos', label: 'Espaços', icon: 'espacos' },
  { to: '/estatisticas', label: 'Estatísticas', icon: 'stats' },
  { to: '/marketing', label: 'Marketing', icon: 'marketing' },
  { to: '/concorrentes', label: 'Concorrentes', icon: 'users' },
  { to: '/financeiro', label: 'Financeiro', icon: 'financeiro' },
  { to: '/dados', label: 'Dados', icon: 'dados' },
]

// tema: auto -> claro -> escuro
const TEMAS = ['auto', 'light', 'dark']
const tema = ref('auto')
try {
  tema.value = localStorage.getItem('sante-tema') || 'auto'
} catch {
  /* ignore */
}
function aplicarTema() {
  if (tema.value === 'auto') document.documentElement.removeAttribute('data-theme')
  else document.documentElement.setAttribute('data-theme', tema.value)
}
aplicarTema()
function trocarTema() {
  tema.value = TEMAS[(TEMAS.indexOf(tema.value) + 1) % 3]
  try {
    localStorage.setItem('sante-tema', tema.value)
  } catch {
    /* ignore */
  }
  aplicarTema()
}
const temaIcone = computed(() => ({ auto: 'auto', light: 'sun', dark: 'moon' })[tema.value])
const temaLabel = computed(() => ({ auto: 'Tema automático', light: 'Tema claro', dark: 'Tema escuro' })[tema.value])

const instagram = computed(() => state.data?.meta?.instagram)
</script>

<template>
  <div v-if="state.loaded" class="shell">
    <aside class="side">
      <RouterLink to="/" class="brand">
        <span class="logo">S</span>
        <span class="brand-txt"><strong>Santé Admin</strong><small>Consultórios · Maceió</small></span>
      </RouterLink>
      <nav class="nav">
        <RouterLink v-for="n in nav" :key="n.to" :to="n.to" class="nav-item">
          <Icon :name="n.icon" /> <span>{{ n.label }}</span>
        </RouterLink>
      </nav>
      <div class="side-foot">
        <a v-if="instagram" :href="instagram" target="_blank" rel="noopener" class="nav-item">
          <Icon name="insta" /> <span>@santeconsultoriosmaceio</span>
        </a>
        <button class="nav-item" type="button" :title="temaLabel" @click="trocarTema">
          <Icon :name="temaIcone" /> <span>{{ temaLabel }}</span>
        </button>
      </div>
    </aside>

    <main class="main">
      <header v-if="!route.meta.home" class="topbar">
        <div>
          <h1>{{ route.meta.title }}</h1>
          <p v-if="route.meta.mes" class="muted sub">Referência: {{ mesLongo(state.mes) }}</p>
        </div>
        <div v-if="route.meta.mes" class="month">
          <button class="btn icon" type="button" aria-label="Mês anterior" @click="state.mes = addMes(state.mes, -1)"><Icon name="left" /></button>
          <input v-model="state.mes" type="month" aria-label="Mês de análise" required />
          <button class="btn icon" type="button" aria-label="Próximo mês" @click="state.mes = addMes(state.mes, 1)"><Icon name="right" /></button>
        </div>
      </header>

      <div v-if="state.local" class="banner">
        <Icon name="alert" />
        <span>
          Há alterações salvas <strong>só neste navegador</strong>.
          Para atualizar o link público, exporte o arquivo e publique no repositório.
          <template v-if="publicadoMaisNovo()"> A versão publicada é mais recente que a sua cópia.</template>
        </span>
        <span class="toolbar">
          <button class="btn sm" type="button" @click="exportarJSON"><Icon name="download" :size="15" /> Exportar sante.json</button>
          <RouterLink to="/dados" class="btn sm ghost">Como publicar</RouterLink>
          <button class="btn sm ghost" type="button" @click="descartarLocal">Descartar</button>
        </span>
      </div>

      <RouterView />

      <footer class="foot muted small">
        Santé Admin · dados do documento “Potencial Santé”, da planilha de controle e do
        <a :href="state.data.meta.site" target="_blank" rel="noopener">site da Santé</a>.
      </footer>
    </main>
  </div>
  <div v-else class="loading">
    <span v-if="state.erro">{{ state.erro }}</span>
    <span v-else>Carregando…</span>
  </div>
</template>

<style scoped>
.shell { display: grid; grid-template-columns: 240px minmax(0, 1fr); min-height: 100vh; }
.side {
  position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; gap: 20px;
  padding: 20px 14px; background: var(--surface); border-right: 1px solid var(--border);
}
.brand { display: flex; align-items: center; gap: 10px; padding: 4px 8px; text-decoration: none; color: var(--text); }
.logo { width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; background: #1c5cab; color: #fff; font-weight: 700; font-size: 18px; flex: none; }
.brand-txt { display: grid; line-height: 1.2; }
.brand-txt small { color: var(--muted); font-size: 12px; }
.nav { display: grid; gap: 2px; }
.nav-item {
  display: flex; align-items: center; gap: 10px; height: 38px; padding: 0 10px; border-radius: 10px;
  color: var(--text-2); text-decoration: none; font: inherit; font-weight: 500; border: 0; background: none; cursor: pointer; text-align: left; width: 100%;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.nav-item:hover { background: var(--surface-2); color: var(--text); }
.nav-item.router-link-exact-active, .nav-item.router-link-active:not([href='#/']) { background: var(--accent-soft); color: var(--accent-ink); }
.side-foot { margin-top: auto; display: grid; gap: 2px; border-top: 1px solid var(--border); padding-top: 12px; }
.side-foot .nav-item span { overflow: hidden; text-overflow: ellipsis; }

.main { padding: 24px 32px 32px; min-width: 0; display: grid; gap: 20px; align-content: start; }
.topbar { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }
.topbar h1 { font-size: 22px; }
.sub { margin: 2px 0 0; font-size: 13px; }
.month { display: flex; gap: 6px; align-items: center; }
.month input { width: 160px; }
.banner {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  background: var(--warn-soft); color: var(--text); border-radius: 12px; padding: 10px 14px; font-size: 13px;
}
.banner > svg { color: var(--warn); flex: none; }
.banner > span:first-of-type { flex: 1 1 320px; }
.foot { padding-top: 8px; }
.loading { display: grid; place-items: center; min-height: 100vh; color: var(--muted); }

@media (max-width: 900px) {
  .shell { grid-template-columns: minmax(0, 1fr); }
  .side { position: sticky; z-index: 5; height: auto; flex-direction: row; flex-wrap: wrap; align-items: center; gap: 8px; padding: 10px 16px; border-right: 0; border-bottom: 1px solid var(--border); }
  .nav { display: flex; order: 3; width: 100%; overflow-x: auto; gap: 4px; scrollbar-width: none; }
  .nav-item { width: auto; flex: none; height: 34px; }
  .side-foot { margin: 0 0 0 auto; border: 0; padding: 0; display: flex; }
  .side-foot .nav-item span { display: none; }
  .main { padding: 16px; }
  .topbar h1 { font-size: 19px; }
}
</style>
